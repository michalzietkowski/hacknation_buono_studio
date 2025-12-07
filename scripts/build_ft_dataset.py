"""
Prepare fine-tuning data from Chroma for legal qualification.

Two modes:
1) Export candidates for labeling (no labels):
   uv run python scripts/build_ft_dataset.py \
       --collection zus_cases \
       --output data/ft/candidates.jsonl \
       --max-per-doc-type 400

   Each line: {"prompt": "...", "completion": "", "meta": {...}}

2) Build FT JSONL when you have annotations (CSV/JSON):
   uv run python scripts/build_ft_dataset.py \
       --collection zus_cases \
       --output data/ft/ft_train.jsonl \
       --annotations data/ft/annotations.jsonl

Annotations JSONL/CSV must include:
  case_id, doc_type, page, kwalifikacja, podstawa_prawna, uzasadnienie, confidence

OpenAI FT format produced: {"messages":[...]}
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Dict, Iterable, List, Optional

from app.services.chroma_client import get_chroma_client

SYSTEM_INSTRUCTION = (
    "Jesteś prawnikiem oceniającym zdarzenia wypadkowe. "
    "Na podstawie treści dokumentu kwalifikujesz, czy spełnia przesłanki wypadku przy pracy. "
    "Zwróć TYLKO JSON o schemacie: "
    '{\"kwalifikacja\": \"<string>\", \"podstawa_prawna\": \"<string>\", '
    '\"uzasadnienie\": \"<string>\", \"confidence\": <float 0-1>}. '
    "Bez dodatkowego komentarza."
)


def load_annotations(path: Path) -> Dict[str, Dict[str, str]]:
    """
    Load annotations keyed by (case_id, doc_type, page).
    Supports CSV or JSONL with required columns.
    """
    data: Dict[str, Dict[str, str]] = {}
    if path.suffix.lower() == ".csv":
        rows = list(csv.DictReader(path.open()))
    else:
        rows = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]

    required = {"case_id", "doc_type", "page", "kwalifikacja", "podstawa_prawna", "uzasadnienie", "confidence"}
    for row in rows:
        if not required.issubset(row):
            continue
        key = f"{row['case_id']}|{row['doc_type']}|{row['page']}"
        data[key] = row
    return data


def build_prompt(text: str, meta: dict) -> str:
    header = f"case_id: {meta.get('case_id')} | doc_type: {meta.get('doc_type')} | page: {meta.get('page')}"
    return f"{header}\n\n{meta.get('source_file')}\n\n{text}"


def iter_chroma_documents(
    collection: str,
    limit: Optional[int],
    max_per_doc_type: Optional[int],
) -> Iterable[tuple[str, str, dict]]:
    client = get_chroma_client()
    col = client.get_or_create_collection(collection)
    # Paginate via where or get?
    total = col.count()
    page_size = 200
    fetched = 0
    doc_type_counts: Dict[str, int] = {}
    while fetched < total:
        batch = col.get(limit=page_size, offset=fetched, include=["documents", "metadatas", "ids"])
        ids = batch.get("ids", [])
        docs = batch.get("documents", [])
        metas = batch.get("metadatas", [])
        for _id, doc, meta in zip(ids, docs, metas):
            doc_type = (meta or {}).get("doc_type", "unknown")
            if max_per_doc_type is not None:
                if doc_type_counts.get(doc_type, 0) >= max_per_doc_type:
                    continue
            doc_type_counts[doc_type] = doc_type_counts.get(doc_type, 0) + 1
            yield _id, doc, meta or {}
            if limit is not None:
                limit -= 1
                if limit <= 0:
                    return
        fetched += len(ids)
        if len(ids) == 0:
            break


def save_jsonl(rows: Iterable[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def main():
    parser = argparse.ArgumentParser(description="Build OpenAI FT dataset from Chroma.")
    parser.add_argument("--collection", default="zus_cases")
    parser.add_argument("--output", type=Path, default=Path("data/ft/candidates.jsonl"))
    parser.add_argument("--limit", type=int, default=None, help="Limit total examples.")
    parser.add_argument("--max-per-doc-type", type=int, default=400, help="Cap per doc_type for balance.")
    parser.add_argument("--annotations", type=Path, default=None, help="Optional CSV/JSONL with labels.")
    args = parser.parse_args()

    annotations = load_annotations(args.annotations) if args.annotations else {}
    rows: List[dict] = []

    for _, doc, meta in iter_chroma_documents(
        collection=args.collection,
        limit=args.limit,
        max_per_doc_type=args.max_per_doc_type,
    ):
        prompt = build_prompt(doc, meta)
        base_meta = {
            "case_id": meta.get("case_id"),
            "doc_type": meta.get("doc_type"),
            "page": meta.get("page"),
            "source_file": meta.get("source_file"),
        }

        if annotations:
            key = f"{base_meta['case_id']}|{base_meta['doc_type']}|{base_meta['page']}"
            ann = annotations.get(key)
            if not ann:
                continue
            completion_obj = {
                "kwalifikacja": ann["kwalifikacja"],
                "podstawa_prawna": ann["podstawa_prawna"],
                "uzasadnienie": ann["uzasadnienie"],
                "confidence": float(ann["confidence"]),
            }
            row = {
                "messages": [
                    {"role": "system", "content": SYSTEM_INSTRUCTION},
                    {"role": "user", "content": prompt},
                    {"role": "assistant", "content": json.dumps(completion_obj, ensure_ascii=False)},
                ]
            }
        else:
            row = {
                "prompt": prompt,
                "completion": "",
                "meta": base_meta,
            }
        rows.append(row)

    save_jsonl(rows, args.output)
    print(f"Wrote {len(rows)} rows -> {args.output}")


if __name__ == "__main__":
    main()

