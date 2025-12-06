import asyncio
import tempfile
from pathlib import Path
from typing import Dict, List

from fastapi import UploadFile
from pdf2image import convert_from_path

from app.pipeline.ingestion.ocr_pipeline import ocr_images
from app.pipeline.ingestion.doc_classifier import classify_batch
from app.pipeline.extraction.extractor_runner import run_extractor
from app.pipeline.analysis.inconsistency_detector import detect_inconsistencies
from app.pipeline.analysis.legal_reasoner_runner import run_legal_reasoner
from app.pipeline.generation.opinion_generator_runner import generate_opinion
from app.pipeline.generation.card_generator import build_card_payload


async def process_case(files: List[UploadFile], case_id: str) -> Dict:
    """
    Orchestrates full pipeline for a single case:
    PDF -> OCR -> classify -> extract -> legal reasoning -> opinion/card payload.
    Returns a dict with raw texts, extracted JSON, opinion text, card payload.
    """
    if not files:
        raise ValueError("No files provided")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        pdf_paths: List[Path] = []
        for f in files:
            dest = tmp_path / f.filename
            dest.write_bytes(await f.read())
            pdf_paths.append(dest)

        # PDF -> images -> OCR texts
        image_paths: List[Path] = []
        for pdf in pdf_paths:
            images = convert_from_path(str(pdf), dpi=200)
            for i, img in enumerate(images):
                img_path = tmp_path / f"{pdf.stem}_p{i+1}.png"
                img.save(img_path, "PNG")
                image_paths.append(img_path)

        texts = ocr_images(image_paths)
        doc_types = classify_batch(texts)

        documents: Dict[str, str] = {}
        for name, text in texts.items():
            doc_type = doc_types.get(name, "unknown")
            documents[doc_type] = text

        # Extraction
        case_data = await run_extractor(documents, case_id)
        case_data = detect_inconsistencies(case_data)
        case_data = await run_legal_reasoner(case_data)
        opinion = await generate_opinion(case_data)
        card_payload = build_card_payload(case_data)

        return {
            "case_id": case_id,
            "documents": documents,
            "case": case_data.model_dump(),
            "opinion": opinion,
            "card_payload": card_payload,
        }

