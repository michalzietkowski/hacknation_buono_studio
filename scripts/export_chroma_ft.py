"""
Export Chroma documents to JSONL for OpenAI fine-tuning.

Creates prompt/completion pairs with a fixed JSON schema for legal qualification.
Completions are left empty by default for human labeling.

Usage:
  uv run python scripts/export_chroma_ft.py \
    --collection zus_cases \
    --output-dir data/ft_ready \
    --limit 200
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any, Dict, List, Tuple

from app.services.chroma_client import get_chroma_client


OUTPUT_SCHEMA = {
    "kwalifikacja": "",
    "podstawa_prawna": "",
    "uzasadnienie": "",
    "confidence": None,
}

INSTRUCTION = (
    "Na podstawie treści dokonaj kwalifikacji prawnej wypadku. "
    "Zwróć wyłącznie JSON w formacie: "
    '{"kwalifikacja":"...", "podstawa_prawna":"...", "uzasadnienie":"...", "confidence": <0-1>}.'
)


def fetch_collection_rows(collection, limit: int | None) -> List[Tuple[str, Dict[str, Any], str]]:
    total = collection.count()
    batch_size = 200
    rows: List[Tuple[str, Dict[str, Any], str]] = []
    remaining = limit if limit is not None else total
    offset = 0
    while offset < total and (remaining is None or remaining > 0):
        take = batch_size if remaining is None else min(batch_size, remaining)
        chunk = collection.get(
            include=["documents", "metadatas"],
            limit=take,
            offset=offset,
        )
        ids = chunk.get("ids", [])
        docs = chunk.get("documents", [])
        metas = chunk.get("metadatas", [])
        for doc_id, meta, doc in zip(ids, metas, docs):
            rows.append((doc_id, meta or {}, doc or ""))
        offset += take
        if remaining is not None:
            remaining -= take
    return rows


def make_prompt(meta: Dict[str, Any], doc: str) -> str:
    parts = [INSTRUCTION, ""]
    parts.append(f"[doc_type]: {meta.get('doc_type', 'unknown')}")
    parts.append(f"[case_id]: {meta.get('case_id', 'unknown')}")
    parts.append(f"[page]: {meta.get('page', 'unknown')}")
    parts.append("")
    parts.append(doc.strip())
    return "\n".join(parts)


def build_records(rows: List[Tuple[str, Dict[str, Any], str]]) -> List[Dict[str, Any]]:
    records: List[Dict[str, Any]] = []
    for _, meta, doc in rows:
        if not doc:
            continue
        prompt = make_prompt(meta, doc)
        completion = json.dumps(OUTPUT_SCHEMA, ensure_ascii=False)
        records.append(
            {
                "prompt": prompt,
                "completion": completion,
            }
        )
    return records


def split_train_val(records: List[Dict[str, Any]], val_ratio: float = 0.1):
    n = len(records)
    val_size = max(1, math.floor(n * val_ratio)) if n > 0 else 0
    return records[val_size:], records[:val_size]


def write_jsonl(path: Path, rows: List[Dict[str, Any]]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def main():
    parser = argparse.ArgumentParser(description="Export Chroma data to JSONL for OpenAI FT.")
    parser.add_argument("--collection", type=str, default="zus_cases")
    parser.add_argument("--output-dir", type=Path, default=Path("data/ft_ready"))
    parser.add_argument("--limit", type=int, default=None, help="Limit number of docs fetched from Chroma.")
    parser.add_argument("--val-ratio", type=float, default=0.1)
    args = parser.parse_args()

    client = get_chroma_client()
    collection = client.get_collection(args.collection)

    rows = fetch_collection_rows(collection, args.limit)
    records = build_records(rows)
    train, val = split_train_val(records, val_ratio=args.val_ratio)

    write_jsonl(args.output_dir / "train.jsonl", train)
    write_jsonl(args.output_dir / "val.jsonl", val)

    print(
        f"Exported {len(records)} records "
        f"-> train={len(train)}, val={len(val)} "
        f"to {args.output_dir}"
    )


if __name__ == "__main__":
    main()

