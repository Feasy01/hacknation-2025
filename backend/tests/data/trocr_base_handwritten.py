"""Comprehensive OCR experiment for handwritten Polish PDFs.

This script mirrors the exploratory Colab notebook that compared
``microsoft/trocr`` checkpoints with a Tesseract baseline. It is now a
plain Python CLI that can be executed locally. The workflow is:

1. Find PDF files in ``--data-dir`` (defaults to ``backend/tests/data``).
2. Rasterize each PDF page via ``pdf2image``/Poppler.
3. Run OCR with
   - ``microsoft/trocr-base-handwritten`` (always on),
   - ``microsoft/trocr-large-handwritten`` (optional `--with-large`),
   - Tesseract with the Polish language pack (unless ``--skip-tesseract``)
4. Store consolidated results as ``.txt`` (human-friendly) and ``.json``
   (structured) files in ``--output-dir``.

Prerequisites
-------------
- Python deps: ``pip install -r backend/requirements.txt``
- System deps: ``poppler-utils`` (for ``pdf2image``) and ``tesseract-ocr``
  with ``tesseract-ocr-pol`` should be installed via apt/brew/etc.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import shutil
from collections import defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence

import pytesseract
import torch
from pdf2image import convert_from_path
from pdf2image.exceptions import PDFInfoNotInstalledError
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel


ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
OUTPUT_DIR = ROOT_DIR / "output"

DEFAULT_BASE_MODEL = "microsoft/trocr-base-handwritten"
DEFAULT_LARGE_MODEL = "microsoft/trocr-large-handwritten"


@dataclass
class PageResult:
    pdf_name: str
    pdf_path: str
    page_index: int
    trocr_base_text: Optional[str] = None
    trocr_large_text: Optional[str] = None
    tesseract_text: Optional[str] = None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DATA_DIR, help="Directory containing source PDF files.")
    parser.add_argument("--output-dir", type=Path, default=OUTPUT_DIR, help="Directory for generated OCR files.")
    parser.add_argument("--dpi", type=int, default=300, help="Rendering DPI for pdf2image.")
    parser.add_argument("--max-pages", type=int, default=None, help="Optional limit of pages per PDF (useful for smoke tests).")
    parser.add_argument(
        "--device",
        default="cuda" if torch.cuda.is_available() else "cpu",
        choices=["cpu", "cuda"],
        help="Computation device for TrOCR models.",
    )
    parser.add_argument("--base-model", default=DEFAULT_BASE_MODEL, help="Hugging Face id for the base TrOCR model.")
    parser.add_argument("--large-model", default=DEFAULT_LARGE_MODEL, help="Hugging Face id for the large TrOCR model.")
    parser.add_argument("--with-large", action="store_true", help="Enable the large TrOCR model (downloads ~2.7GB).")
    parser.add_argument("--skip-tesseract", action="store_true", help="Skip pytesseract OCR (not recommended for Polish text).")
    parser.add_argument(
        "--prefer-order",
        default="tesseract,base,large",
        help="Comma-separated order to choose the primary text source written into TXT outputs.",
    )
    parser.add_argument(
        "--language",
        default="pol",
        help="Language code passed to Tesseract (default: Polish).",
    )
    parser.add_argument(
        "--poppler-path",
        default=None,
        help="Explicit path to the Poppler bin directory if it is not on PATH.",
    )
    parser.add_argument("--verbose", action="store_true", help="Enable debug logs.")
    return parser.parse_args()


def resolve_poppler_path(explicit: Optional[str]) -> Optional[str]:
    if explicit:
        return explicit
    pdftoppm = shutil.which("pdftoppm")
    return os.path.dirname(pdftoppm) if pdftoppm else None


def ensure_data_dir(data_dir: Path) -> List[Path]:
    if not data_dir.exists():
        raise FileNotFoundError(f"Input directory {data_dir} does not exist")
    pdfs = sorted(p for p in data_dir.rglob("*.pdf"))
    if not pdfs:
        raise FileNotFoundError(f"No PDF files found under {data_dir}")
    return pdfs


def convert_pdf_to_images(pdf_path: Path, dpi: int, poppler_path: Optional[str]) -> List[Image.Image]:
    try:
        return convert_from_path(pdf_path, dpi=dpi, poppler_path=poppler_path)
    except PDFInfoNotInstalledError as exc:  # pragma: no cover - depends on system packages
        raise RuntimeError(
            "Poppler binaries not found. Install 'poppler-utils' (Linux), "
            "'brew install poppler' (macOS), or place pdftoppm in PATH."
        ) from exc


def load_trocr(model_id: str, device: str) -> tuple[TrOCRProcessor, VisionEncoderDecoderModel]:
    processor = TrOCRProcessor.from_pretrained(model_id)
    model = VisionEncoderDecoderModel.from_pretrained(model_id)
    model.to(device)
    model.eval()
    return processor, model


def run_trocr(image: Image.Image, processor: TrOCRProcessor, model: VisionEncoderDecoderModel, device: str) -> str:
    with torch.inference_mode():
        pixel_values = processor(images=image, return_tensors="pt").pixel_values.to(device)
        generated_ids = model.generate(pixel_values, max_new_tokens=512)
    return processor.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()


def run_tesseract(image: Image.Image, language: str) -> str:
    return pytesseract.image_to_string(image, lang=language).strip()


def preferred_text(result: PageResult, order: Sequence[str]) -> str:
    mapping = {
        "tesseract": result.tesseract_text,
        "base": result.trocr_base_text,
        "large": result.trocr_large_text,
    }
    for key in order:
        value = mapping.get(key)
        if value:
            return value
    return ""


def write_outputs(results: Iterable[PageResult], output_dir: Path, order: Sequence[str]) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    grouped: Dict[str, List[PageResult]] = defaultdict(list)
    for res in results:
        grouped[res.pdf_name].append(res)

    for pdf_name, pages in grouped.items():
        pages.sort(key=lambda r: r.page_index)
        txt_lines: List[str] = []
        for page in pages:
            txt_lines.append(f"# Page {page.page_index + 1}")
            text = preferred_text(page, order)
            txt_lines.append(text if text else "[no text extracted]")
            txt_lines.append("")

        txt_path = output_dir / f"{pdf_name}.txt"
        txt_path.write_text("\n".join(txt_lines).strip() + "\n", encoding="utf-8")

        json_path = output_dir / f"{pdf_name}.json"
        json_path.write_text(json.dumps([asdict(p) for p in pages], ensure_ascii=False, indent=2), encoding="utf-8")
        logging.info("Saved %s and %s", txt_path.name, json_path.name)


def process(args: argparse.Namespace) -> None:
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO, format="%(levelname)s: %(message)s")

    poppler_path = resolve_poppler_path(args.poppler_path)
    if not poppler_path:
        logging.warning("Poppler binaries not detected on PATH. pdf2image may fail if pdftoppm is missing.")

    pdf_files = ensure_data_dir(args.data_dir.resolve())
    output_dir = args.output_dir.resolve()

    base_processor, base_model = load_trocr(args.base_model, args.device)
    large_bundle = None
    if args.with_large:
        logging.info("Loading large model %s", args.large_model)
        large_bundle = load_trocr(args.large_model, args.device)

    prefer_order = [token.strip().lower() for token in args.prefer_order.split(",") if token.strip()]

    results: List[PageResult] = []
    for pdf_path in pdf_files:
        logging.info("Processing %s", pdf_path)
        try:
            images = convert_pdf_to_images(pdf_path, dpi=args.dpi, poppler_path=poppler_path)
        except Exception:  # pragma: no cover - relies on environment
            logging.exception("Failed to rasterize %s", pdf_path)
            continue

        for page_index, image in enumerate(images):
            if args.max_pages is not None and page_index >= args.max_pages:
                break
            page_result = PageResult(pdf_name=pdf_path.stem, pdf_path=str(pdf_path), page_index=page_index)

            try:
                page_result.trocr_base_text = run_trocr(image, base_processor, base_model, args.device)
            except Exception:
                logging.exception("Base TrOCR failed on %s page %d", pdf_path, page_index + 1)

            if args.with_large and large_bundle is not None:
                try:
                    page_result.trocr_large_text = run_trocr(image, large_bundle[0], large_bundle[1], args.device)
                except Exception:
                    logging.exception("Large TrOCR failed on %s page %d", pdf_path, page_index + 1)

            if not args.skip_tesseract:
                try:
                    page_result.tesseract_text = run_tesseract(image, args.language)
                except Exception:
                    logging.exception("Tesseract failed on %s page %d", pdf_path, page_index + 1)

            results.append(page_result)

    if not results:
        logging.warning("No OCR results to write.")
        return

    write_outputs(results, output_dir, prefer_order)


def main() -> None:
    args = parse_args()
    process(args)


if __name__ == "__main__":
    main()
