FROM python:3.12-slim

# System dependencies (tesseract for OCR, poppler for PDF->image)
RUN apt-get update && apt-get install -y \
tesseract-ocr \
tesseract-ocr-pol \
tesseract-ocr-eng \
poppler-utils 

ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency files
COPY pyproject.toml ./
COPY uv.lock* ./

# Copy app code and migrations/config for Alembic
COPY app/ ./app/
COPY alembic.ini ./
COPY migrations/ ./migrations/

# Install dependencies (--frozen only if lock file exists)
RUN if [ -f uv.lock ]; then uv sync --frozen; else uv sync; fi

# Expose port
EXPOSE 8000

# Run the application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

