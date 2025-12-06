#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-$(pwd)}"
# Możesz podać własne ścieżki, domyślnie używamy danych skopiowanych do repo:
# host:   data/raw/zus_examples  -> kontener: /app/data/raw/zus_examples
# wynik:  /app/data/ocr/zus_examples (widoczne na hoście w data/ocr/zus_examples)
SRC_DIR="${SRC_DIR:-/app/data/raw/zus_examples}"
OUT_DIR="${OUT_DIR:-/app/data/ocr/zus_examples}"
API_SERVICE="${API_SERVICE:-api}"

cd "$REPO_DIR"

echo "[1/4] Install poppler (PDF->PNG) in $API_SERVICE container"
docker compose exec "$API_SERVICE" sh -c "apt-get update && apt-get install -y poppler-utils"

echo "[2/4] Ensure pdf2image installed"
docker compose exec "$API_SERVICE" sh -c "uv pip show pdf2image >/dev/null 2>&1 || uv add pdf2image"
docker compose exec "$API_SERVICE" sh -c "uv sync"

echo "[3/4] Run OCR on $SRC_DIR -> $OUT_DIR"
docker compose exec "$API_SERVICE" sh -c "uv run python - <<'PY'
from pathlib import Path
from pdf2image import convert_from_path
from app.pipeline.ingestion.ocr_pipeline import ocr_images

import os

src_root = Path(os.environ.get('SRC_DIR', '$SRC_DIR'))
out_root = Path(os.environ.get('OUT_DIR', '$OUT_DIR'))
out_root.mkdir(parents=True, exist_ok=True)

pdfs = sorted(src_root.rglob('*.pdf'))
if not pdfs:
    print('No PDFs under', src_root)
    raise SystemExit(0)

for pdf in pdfs:
    rel = pdf.relative_to(src_root)
    base = rel.with_suffix('').as_posix().replace('/', '_')
    print(f'Processing {rel}')
    images = convert_from_path(str(pdf), dpi=200)
    img_paths = []
    for i, img in enumerate(images):
        img_path = out_root / f\"{base}_p{i+1}.png\"
        img.save(img_path, 'PNG')
        img_paths.append(img_path)
    texts = ocr_images(img_paths)
    for name, text in texts.items():
        out_txt = out_root / f\"{name}.txt\"
        out_txt.write_text(text, encoding='utf-8')
        print(f'  -> {out_txt} ({len(text)} chars)')
PY"

echo "[4/4] Done. Sample output files:"
docker compose exec "$API_SERVICE" sh -c "ls -1 $OUT_DIR | head"

