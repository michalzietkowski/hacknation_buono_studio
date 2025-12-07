from pathlib import Path
from typing import Dict, List

from app.pipeline.utils.logging_utils import get_logger

try:
    import pytesseract
    from PIL import Image
except ImportError:  # pragma: no cover - optional dependency until installed
    pytesseract = None
    Image = None


logger = get_logger(__name__)


class OCRNotAvailable(RuntimeError):
    """Raised when pytesseract or system tesseract binary is not available."""


def ocr_images(image_paths: List[Path]) -> Dict[str, str]:
    """
    Perform OCR on a list of image files.

    Returns a dict keyed by file name (stem) with extracted text.
    """
    if not pytesseract or not Image:
        logger.error("pytesseract/Pillow not available; install tesseract-ocr and pillow.")
        raise OCRNotAvailable("pytesseract/Pillow not available; install tesseract-ocr and pillow.")

    logger.info("Starting OCR for %d images with Tesseract (lang=pol)", len(image_paths))

    results: Dict[str, str] = {}
    for path in image_paths:
        logger.info("Running OCR on image %s", path.name)
        with Image.open(path) as img:
            text = pytesseract.image_to_string(img, lang="pol")
            results[path.stem] = text
            logger.info("OCR done for %s (chars=%d)", path.name, len(text.strip()))

    logger.info("OCR finished for %d images", len(results))
    return results


def save_ocr_results(case_id: str, texts: Dict[str, str], output_dir: Path) -> None:
    """
    Save OCR results as text files under data/ocr/<case_id>/.
    """
    case_dir = output_dir / "ocr" / case_id
    case_dir.mkdir(parents=True, exist_ok=True)
    for name, text in texts.items():
        (case_dir / f"{name}.txt").write_text(text, encoding="utf-8")

