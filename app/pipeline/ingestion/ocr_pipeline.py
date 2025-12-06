from pathlib import Path
from typing import Dict, List

try:
    import pytesseract
    from PIL import Image
except ImportError:  # pragma: no cover - optional dependency until installed
    pytesseract = None
    Image = None


class OCRNotAvailable(RuntimeError):
    """Raised when pytesseract or system tesseract binary is not available."""


def ocr_images(image_paths: List[Path]) -> Dict[str, str]:
    """
    Perform OCR on a list of image files.

    Returns a dict keyed by file name (stem) with extracted text.
    """
    if not pytesseract or not Image:
        raise OCRNotAvailable("pytesseract/Pillow not available; install tesseract-ocr and pillow.")

    results: Dict[str, str] = {}
    for path in image_paths:
        with Image.open(path) as img:
            text = pytesseract.image_to_string(img, lang="pol")
            results[path.stem] = text
    return results


def save_ocr_results(case_id: str, texts: Dict[str, str], output_dir: Path) -> None:
    """
    Save OCR results as text files under data/ocr/<case_id>/.
    """
    case_dir = output_dir / "ocr" / case_id
    case_dir.mkdir(parents=True, exist_ok=True)
    for name, text in texts.items():
        (case_dir / f"{name}.txt").write_text(text, encoding="utf-8")

