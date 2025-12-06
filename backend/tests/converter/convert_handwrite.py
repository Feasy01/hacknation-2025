"""CLI helper for converting handwritten PDF forms into text outputs.

The script scans ``/data`` (relative to this file) for PDF documents,
renders each page to an image, and feeds it through the Hugging Face
``microsoft/trocr-base-handwritten`` model (or any compatible
VisionEncoderDecoder handwriting OCR). Plain-text outputs are stored in
``/output`` with the same base filename as the source PDF.

Usage examples::

    python backend/tests/converter/convert_handwrite.py
    python backend/tests/converter/convert_handwrite.py --model-id microsoft/trocr-large-handwritten
    python backend/tests/converter/convert_handwrite.py --data-dir /custom/data --output-dir /tmp/out

The script also exposes ``--list-models`` to print the curated model
options gathered from Hugging Face searches.
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path
from typing import Iterable, List

import torch
from pdf2image import convert_from_path
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel


# Curated OCR choices (based on HF catalog queries run in this task).
MODEL_SUGGESTIONS = {
    "microsoft/trocr-base-handwritten": (
        "https://huggingface.co/microsoft/trocr-base-handwritten",
        "Baseline handwriting OCR; good balance between quality and speed.",
    ),
    "microsoft/trocr-large-handwritten": (
        "https://huggingface.co/microsoft/trocr-large-handwritten",
        "Bigger TroCR checkpoint with better accuracy for messy forms.",
    ),
    "naver-clova-ix/donut-base": (
        "https://huggingface.co/naver-clova-ix/donut-base",
        "Multilingual document-understanding OCR that copes well with form layouts.",
    ),
    "PaddlePaddle/latin_PP-OCRv5_mobile_rec": (
        "https://huggingface.co/PaddlePaddle/latin_PP-OCRv5_mobile_rec",
        "ONNX-compatible PP-OCRv5 recognizer tuned for Latin scripts (incl. Polish).",
    ),
    "cycloneboy/Multilingual_PP-OCRv3_det_infer": (
        "https://huggingface.co/cycloneboy/Multilingual_PP-OCRv3_det_infer",
        "Detection backbone to pair with PP-OCR recognizers for multilingual docs.",
    ),
}

DEFAULT_MODEL_ID = "microsoft/trocr-base-handwritten"
DATA_DIR = Path(__file__).resolve().parents[1] / "data"
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert handwritten PDF forms into plain text using a Hugging Face OCR model.",
    )
    parser.add_argument("--data-dir", type=Path, default=DATA_DIR, help="Directory containing input PDF files.")
    parser.add_argument("--output-dir", type=Path, default=OUTPUT_DIR, help="Directory for generated TXT files.")
    parser.add_argument(
        "--model-id",
        default=DEFAULT_MODEL_ID,
        help="Hugging Face model id (VisionEncoderDecoder / TroCR compatible).",
    )
    parser.add_argument(
        "--device",
        default="cuda" if torch.cuda.is_available() else "cpu",
        choices=["cpu", "cuda"],
        help="Computation device. Defaults to CUDA when available.",
    )
    parser.add_argument("--dpi", type=int, default=300, help="Rendering DPI when rasterizing PDF pages.")
    parser.add_argument(
        "--max-pages",
        type=int,
        default=None,
        help="Optional limit for number of pages processed per PDF (useful for quick tests).",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite any existing TXT output instead of skipping it.",
    )
    parser.add_argument(
        "--list-models",
        action="store_true",
        help="Print curated OCR model suggestions with links and exit.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Increase log verbosity.",
    )
    return parser.parse_args()


def list_model_options() -> None:
    payload = [
        {
            "id": model_id,
            "link": data[0],
            "why": data[1],
        }
        for model_id, data in MODEL_SUGGESTIONS.items()
    ]
    print(json.dumps(payload, ensure_ascii=False, indent=2))


def iter_pdfs(data_dir: Path) -> Iterable[Path]:
    if not data_dir.exists():
        raise FileNotFoundError(f"Input directory {data_dir} does not exist")
    return sorted(data_dir.rglob("*.pdf"))


def load_models(model_id: str, device: str) -> tuple[TrOCRProcessor, VisionEncoderDecoderModel]:
    processor = TrOCRProcessor.from_pretrained(model_id)
    model = VisionEncoderDecoderModel.from_pretrained(model_id)
    model.to(device)
    model.eval()
    return processor, model


def pdf_pages(pdf_path: Path, dpi: int) -> List[Image.Image]:
    return convert_from_path(pdf_path, dpi=dpi)


def run_recognition(
    image,
    processor: TrOCRProcessor,
    model: VisionEncoderDecoderModel,
    device: str,
) -> str:
    with torch.inference_mode():
        pixel_values = processor(images=image, return_tensors="pt").pixel_values.to(device)
        generated_ids = model.generate(pixel_values, max_new_tokens=256)
    text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return text.strip()


def convert_pdf(
    pdf_path: Path,
    output_path: Path,
    processor: TrOCRProcessor,
    model: VisionEncoderDecoderModel,
    device: str,
    dpi: int,
    max_pages: int | None,
) -> None:
    logging.info("Converting %s", pdf_path)
    try:
        images = pdf_pages(pdf_path, dpi)
    except Exception:
        logging.exception("Failed to rasterize %s", pdf_path)
        return

    page_chunks: List[str] = []
    for idx, image in enumerate(images):
        if max_pages is not None and idx >= max_pages:
            break
        try:
            text = run_recognition(image, processor, model, device)
        except Exception:
            logging.exception("Inference error on %s page %d", pdf_path, idx + 1)
            continue
        page_chunks.append(f"# Page {idx + 1}\n{text}\n")

    if not page_chunks:
        logging.warning("No text extracted from %s", pdf_path)
        return

    output_path.write_text("\n".join(page_chunks), encoding="utf-8")
    logging.info("Saved %s", output_path)


def main() -> None:
    args = parse_args()
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO, format="%(levelname)s: %(message)s")

    if args.list_models:
        list_model_options()
        return

    data_dir = args.data_dir.resolve()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    pdf_files = list(iter_pdfs(data_dir))
    if not pdf_files:
        logging.warning("No PDF files found in %s", data_dir)
        return

    logging.info("Loading model %s on %s", args.model_id, args.device)
    processor, model = load_models(args.model_id, args.device)

    for pdf_path in pdf_files:
        output_path = output_dir / (pdf_path.stem + ".txt")
        if output_path.exists() and not args.overwrite:
            logging.info("Skipping %s (already exists). Use --overwrite to regenerate.", output_path)
            continue
        convert_pdf(
            pdf_path=pdf_path,
            output_path=output_path,
            processor=processor,
            model=model,
            device=args.device,
            dpi=args.dpi,
            max_pages=args.max_pages,
        )


if __name__ == "__main__":
    main()
