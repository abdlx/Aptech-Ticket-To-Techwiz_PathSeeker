"""Render and validate every generated PathSeeker PDF for visual QA."""

from __future__ import annotations

import hashlib
import math
from pathlib import Path

import pymupdf as fitz
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[3]
ARTIFACT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "Project" / "frontend" / "public" / "assets" / "documents"
RENDER_DIR = ROOT / "tmp" / "pdfs"

EXPECTED = {
    "career-decision-workbook.pdf": 10,
    "ux-interview-checklist.pdf": 8,
    "data-analyst-roadmap.pdf": 9,
    "portfolio-guide.pdf": 9,
    "skills-gap-template.pdf": 7,
    "career-interview-preparation-pack.pdf": 8,
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    RENDER_DIR.mkdir(parents=True, exist_ok=True)
    failures: list[str] = []

    for filename, expected_pages in EXPECTED.items():
        artifact = ARTIFACT_DIR / filename
        public = PUBLIC_DIR / filename
        if not artifact.exists() or not public.exists():
            failures.append(f"{filename}: missing artifact or public copy")
            continue
        if digest(artifact) != digest(public):
            failures.append(f"{filename}: public copy differs from artifact")

        document = fitz.open(artifact)
        if document.page_count != expected_pages:
            failures.append(f"{filename}: expected {expected_pages} pages, found {document.page_count}")

        doc_dir = RENDER_DIR / artifact.stem
        doc_dir.mkdir(parents=True, exist_ok=True)
        thumbnails: list[Image.Image] = []
        extracted_chars = 0

        for page_number, page in enumerate(document, start=1):
            extracted_chars += len(page.get_text("text").strip())
            pixmap = page.get_pixmap(matrix=fitz.Matrix(1.6, 1.6), alpha=False)
            page_path = doc_dir / f"page-{page_number:02}.png"
            pixmap.save(page_path)
            image = Image.open(page_path).convert("RGB")
            image.thumbnail((470, 665), Image.Resampling.LANCZOS)
            tile = Image.new("RGB", (500, 710), "#EEF2EF")
            tile.paste(image, ((500 - image.width) // 2, 28))
            ImageDraw.Draw(tile).text((18, 684), f"Page {page_number}", fill="#31553F")
            thumbnails.append(tile)

        if extracted_chars < 1_000:
            failures.append(f"{filename}: suspiciously little selectable text ({extracted_chars} chars)")

        columns = 3
        rows = math.ceil(len(thumbnails) / columns)
        sheet = Image.new("RGB", (columns * 500, rows * 710), "white")
        for index, thumb in enumerate(thumbnails):
            sheet.paste(thumb, ((index % columns) * 500, (index // columns) * 710))
        sheet.save(RENDER_DIR / f"{artifact.stem}-contact-sheet.png", quality=92)
        print(f"{filename}: {document.page_count} pages, {extracted_chars:,} text chars")
        document.close()

    if failures:
        raise SystemExit("\n".join(failures))

    print(f"Rendered contact sheets and every page to {RENDER_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
