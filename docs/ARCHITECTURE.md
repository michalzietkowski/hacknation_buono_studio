# ZANT II – Architektura (skrót)

- **Ingestion & OCR**: `app/pipeline/ingestion/ocr_pipeline.py`, `doc_classifier.py`
- **Extraction (Model 1)**: `app/pipeline/extraction/*` – schemat (`schema.py`), prompt (`extractor_prompt.py`), runner (`extractor_runner.py`)
- **Analysis (Model 2)**: `app/pipeline/analysis/*` – rozbieżności, legal reasoner (prompt + runner)
- **Generation (Model 3/4)**: `app/pipeline/generation/*` – opinia, karta, PDF exporter
- **Utils/RAG**: `app/pipeline/utils/*`
- **Dane**: `data/raw`, `data/ocr`, `data/processed`, `data/training`

Minimalny flow case’u:
1. OCR PDF → TXT (`ocr_pipeline.save_ocr_results`)
2. Klasyfikacja dokumentów (`doc_classifier`)
3. Ekstrakcja JSON (`extractor_runner` z `extractor_prompt`)
4. Rozbieżności + legal reasoner (`analysis/*`)
5. Generacja opinii/karty (`generation/*`)

Docelowe LLM/OCR należy podpiąć w runnerach (stuby).

## Manualny test pipeline (kontener)
- Skopiuj dane do `data/raw/zus_examples` (host), uruchom `docker compose up -d api`.
- W kontenerze OCR wykonasz skrypt: `./scripts/run_ocr_examples.sh` (używa `uv run`).
- Endpoint testowy: `POST /api/v1/pipeline/run?case_id=test` z załączonymi PDF (multipart) – zwróci JSON z OCR/ekstrakcją i opinią (stub).

