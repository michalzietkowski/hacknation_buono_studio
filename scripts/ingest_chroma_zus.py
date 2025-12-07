"""
Ingest OCR'd ZUS accident documents into Chroma.

Usage (requires CHROMA_URL, optional CHROMA_AUTH_TOKEN, CHROMA_COLLECTION):
    uv run python scripts/ingest_chroma_zus.py \
        --data-dir data/zus_examples_ocr/zus_examples \
        --collection zus_cases
"""

from __future__ import annotations

import argparse
import re
import zipfile
from pathlib import Path
from typing import Iterable, List, Tuple

from app.services.chroma_client import get_chroma_client


def _normalize_doc_type(label: str) -> str:
    txt = label.lower()
    if "zawiadomienie" in txt:
        return "zawiadomienie"
    if "karta" in txt:
        return "karta_wypadku"
    if "wyjasnienia" in txt or "wyjaśnienia" in txt or "zapis wyjasnien" in txt:
        return "wyjasnienia"
    if "opinia" in txt:
        return "opinia"
    return "unknown"


def _parse_metadata(path: Path) -> Tuple[str, str, int]:
    """
    Returns (case_id, doc_type, page).
    Filenames look like:
    "zus_examples_wypadek 111_zawiadomienie o wypadku 111_p4.txt"
    """
    stem = path.stem
    page_match = re.search(r"_p(?P<page>\d+)$", stem)
    if not page_match:
        raise ValueError(f"Cannot parse page from {path.name}")
    page = int(page_match.group("page"))
    base = stem[: page_match.start()].strip()

    # Extract case_id as the first numeric token (>=2 digits preferred) in the base
    numbers = re.findall(r"\d+", base)
    if not numbers:
        raise ValueError(f"Cannot parse case_id from {path.name}")
    case_id = next((n for n in numbers if len(n) >= 2), numbers[0])

    doc_label = base
    # Remove prefix and numeric tokens/parentheses to normalize doc label
    if doc_label.lower().startswith("zus_examples_wypadek"):
        doc_label = doc_label[len("zus_examples_wypadek") :].strip()
    doc_label = re.sub(r"\(\d+\)", " ", doc_label)
    doc_label = re.sub(r"\b\d+\b", " ", doc_label)
    doc_label = re.sub(r"\s+", " ", doc_label).strip()

    doc_type = _normalize_doc_type(doc_label)
    return case_id, doc_type, page


def _clean_text(text: str) -> str:
    text = text.replace("\r", " ").replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _chunk_words(text: str, chunk_words: int, overlap: int) -> List[str]:
    words = text.split()
    chunks: List[str] = []
    start = 0
    while start < len(words):
        end = min(len(words), start + chunk_words)
        chunk = " ".join(words[start:end]).strip()
        if chunk:
            chunks.append(chunk)
        if end == len(words):
            break
        start = max(end - overlap, start + 1)
    return chunks


def iter_documents(
    data_dir: Path,
    chunk_words: int,
    overlap: int,
    limit: int | None = None,
) -> Iterable[Tuple[str, str, dict]]:
    for path in data_dir.glob("**/*.txt"):
        if path.stat().st_size == 0:
            continue
        raw = path.read_text(encoding="utf-8", errors="ignore").strip()
        if not raw:
            continue
        text = _clean_text(raw)
        if not text:
            continue

        try:
            case_id, doc_type, page = _parse_metadata(path)
        except ValueError:
            continue
        chunks = _chunk_words(text, chunk_words=chunk_words, overlap=overlap)

        for idx, chunk in enumerate(chunks):
            meta = {
                "case_id": case_id,
                "doc_type": doc_type,
                "page": page,
                "chunk_index": idx,
                "source_file": str(path.relative_to(data_dir.parent)),
                "modality": "text",
            }
            doc_id = f"{case_id}-{doc_type}-p{page}-c{idx}"
            yield doc_id, chunk, meta
            if limit is not None:
                limit -= 1
                if limit <= 0:
                    return


def ingest(
    data_dir: Path,
    collection_name: str | None,
    chunk_words: int,
    overlap: int,
    limit: int | None,
    batch_size: int = 64,
    dry_run: bool = False,
) -> None:
    client = get_chroma_client()
    collection = (
        client.get_or_create_collection(collection_name)
        if collection_name
        else client.get_or_create_collection("cases")
    )

    buffer_ids: List[str] = []
    buffer_docs: List[str] = []
    buffer_meta: List[dict] = []

    for doc_id, chunk, meta in iter_documents(data_dir, chunk_words, overlap, limit):
        buffer_ids.append(doc_id)
        buffer_docs.append(chunk)
        buffer_meta.append(meta)
        if len(buffer_ids) >= batch_size:
            if not dry_run:
                collection.upsert(ids=buffer_ids, documents=buffer_docs, metadatas=buffer_meta)
            buffer_ids.clear()
            buffer_docs.clear()
            buffer_meta.clear()

    if buffer_ids and not dry_run:
        collection.upsert(ids=buffer_ids, documents=buffer_docs, metadatas=buffer_meta)


def main():
    parser = argparse.ArgumentParser(description="Ingest ZUS OCR examples into Chroma.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path("data/zus_examples_ocr/zus_examples"),
        help="Path to directory with OCR .txt files.",
    )
    parser.add_argument(
        "--collection",
        type=str,
        default=None,
        help="Chroma collection name (defaults to CHROMA_COLLECTION or 'cases').",
    )
    parser.add_argument("--chunk-words", type=int, default=220)
    parser.add_argument("--overlap", type=int, default=40)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--limit", type=int, default=None, help="Limit number of chunks for testing.")
    parser.add_argument(
        "--zip-path",
        type=Path,
        default=None,
        help="Optional path to zus_examples.zip; if provided and data-dir missing, will extract.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Do not write to Chroma.")
    args = parser.parse_args()

    if args.zip_path and not args.data_dir.exists():
        args.data_dir.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(args.zip_path, "r") as zf:
            zf.extractall(args.data_dir.parent)

    ingest(
        data_dir=args.data_dir,
        collection_name=args.collection,
        chunk_words=args.chunk_words,
        overlap=args.overlap,
        limit=args.limit,
        batch_size=args.batch_size,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()

