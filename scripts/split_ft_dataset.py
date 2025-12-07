"""
Split an OpenAI FT JSONL into train/val for evaluation.

Example:
  uv run python scripts/split_ft_dataset.py \
    --input data/ft/ft_train.jsonl \
    --val-ratio 0.1 \
    --train-out data/ft/ft_train.jsonl \
    --val-out data/ft/ft_val.jsonl
"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path
from typing import List


def read_jsonl(path: Path) -> List[dict]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def write_jsonl(path: Path, rows: List[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def main():
    parser = argparse.ArgumentParser(description="Split FT JSONL into train/val.")
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--val-ratio", type=float, default=0.1)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--train-out", type=Path, required=True)
    parser.add_argument("--val-out", type=Path, required=True)
    args = parser.parse_args()

    rows = read_jsonl(args.input)
    random.Random(args.seed).shuffle(rows)
    val_size = max(1, int(len(rows) * args.val_ratio))
    val_rows = rows[:val_size]
    train_rows = rows[val_size:]

    write_jsonl(args.train_out, train_rows)
    write_jsonl(args.val_out, val_rows)
    print(f"train: {len(train_rows)} rows -> {args.train_out}")
    print(f"val:   {len(val_rows)} rows -> {args.val_out}")


if __name__ == "__main__":
    main()

