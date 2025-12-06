from pathlib import Path
from pdf2image import convert_from_path
from app.pipeline.ingestion.ocr_pipeline import ocr_images


def main():
    src_root = Path("/app/data/raw/zus_examples")
    out_root = Path("/app/data/ocr/zus_examples")
    out_root.mkdir(parents=True, exist_ok=True)

    pdfs = sorted(src_root.rglob("*.pdf"))
    if not pdfs:
        print("No PDFs under", src_root)
        return

    for pdf in pdfs:
        rel = pdf.relative_to(src_root)
        base = rel.with_suffix("").as_posix().replace("/", "_")
        print(f"Processing {rel}")
        images = convert_from_path(str(pdf), dpi=200)
        image_paths = []
        for i, img in enumerate(images):
            img_path = out_root / f"{base}_p{i+1}.png"
            img.save(img_path, "PNG")
            image_paths.append(img_path)
        texts = ocr_images(image_paths)
        for name, text in texts.items():
            out_txt = out_root / f"{name}.txt"
            out_txt.write_text(text, encoding="utf-8")
            print(f"  -> {out_txt} ({len(text)} chars)")


if __name__ == "__main__":
    main()

