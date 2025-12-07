import asyncio
import tempfile
from pathlib import Path
from typing import Callable, Dict, List, Optional

from fastapi import UploadFile
from pdf2image import convert_from_path

from app.pipeline.analysis.inconsistency_detector import detect_inconsistencies
from app.pipeline.analysis.legal_reasoner_runner import run_legal_reasoner
from app.pipeline.extraction.extractor_runner import run_extractor
from app.pipeline.generation.card_generator import build_card_payload
from app.pipeline.generation.opinion_generator_runner import generate_opinion
from app.pipeline.ingestion.doc_classifier import classify_batch
from app.pipeline.ingestion.ocr_pipeline import ocr_images
from app.pipeline.utils.logging_utils import get_logger

logger = get_logger(__name__)


ProgressCallback = Optional[Callable[[str, Optional[dict]], None]]


async def process_case(files: List[UploadFile], case_id: str, progress_cb: ProgressCallback = None) -> Dict:
    """
    Orchestrates full pipeline for a single case:
    PDF -> OCR -> classify -> extract -> legal reasoning -> opinion/card payload.
    Returns a dict with raw texts, extracted JSON, opinion text, card payload.
    """
    if not files:
        raise ValueError("No files provided")

    logger.info("Starting pipeline for case_id=%s with %d files", case_id, len(files))
    if progress_cb:
        progress_cb("received", {"files": len(files)})

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        pdf_paths: List[Path] = []
        for f in files:
            dest = tmp_path / f.filename
            dest.write_bytes(await f.read())
            pdf_paths.append(dest)
            logger.info("Saved upload %s to %s", f.filename, dest)

        # PDF -> images -> OCR texts
        image_paths: List[Path] = []
        for pdf in pdf_paths:
            images = convert_from_path(str(pdf), dpi=200)
            logger.info("Converted %s to %d images", pdf.name, len(images))
            for i, img in enumerate(images):
                img_path = tmp_path / f"{pdf.stem}_p{i+1}.png"
                img.save(img_path, "PNG")
                image_paths.append(img_path)

        if progress_cb:
            progress_cb("ocr", {"pages": len(image_paths)})
        texts = ocr_images(image_paths)
        logger.info(
            "OCR complete for case_id=%s; pages=%d; text chars per page=%s",
            case_id,
            len(texts),
            {name: len(text.strip()) for name, text in texts.items()},
        )
        if progress_cb:
            progress_cb("classified_pending", {"pages": len(texts)})
        doc_types = classify_batch(texts)
        logger.info("Document types classified: %s", doc_types)
        if progress_cb:
            progress_cb("classified", {"doc_types": doc_types})

        documents: Dict[str, str] = {}
        for name, text in texts.items():
            doc_type = doc_types.get(name, "unknown")
            documents[doc_type] = text
            logger.info("Mapped %s -> %s", name, doc_type)

        # Extraction
        logger.info("Running extractor for case_id=%s with %d documents", case_id, len(documents))
        if progress_cb:
            progress_cb("extracting", {"documents": list(documents.keys())})
        case_data = await run_extractor(documents, case_id)
        case_data = detect_inconsistencies(case_data)
        if progress_cb:
            progress_cb("legal_reasoning")
        case_data = await run_legal_reasoner(case_data)
        if progress_cb:
            progress_cb("opinion")
        opinion = await generate_opinion(case_data)
        card_payload = build_card_payload(case_data)

        logger.info("Pipeline finished for case_id=%s", case_id)
        return {
            "case_id": case_id,
            "documents": documents,
            "case": case_data.model_dump(),
            "opinion": opinion,
            "card_payload": card_payload,
        }

