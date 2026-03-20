"""
extractor.py — ScreenAI
Reads uploaded PDF files and returns clean extracted text.
Run with: uvicorn main:app --reload
"""

# ─────────────────────────────────────────
# IMPORTS
# ─────────────────────────────────────────
import io
import re
import pdfplumber
from fastapi import UploadFile


# ─────────────────────────────────────────
# HELPER 1 — Clean extracted text
# ─────────────────────────────────────────
def clean_text(text: str) -> str:
    """
    Cleans messy text from pdfplumber.
    Removes weird characters, extra spaces, blank lines.
    """
    # Remove non-printable characters
    text = re.sub(r"[^\x20-\x7E\n]", " ", text)

    # Replace multiple spaces with one
    text = re.sub(r" {2,}", " ", text)

    # Replace 3+ blank lines with one
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Strip each line
    lines = [line.strip() for line in text.splitlines()]
    text  = "\n".join(lines).strip()

    return text


# ─────────────────────────────────────────
# HELPER 2 — Extract text from PDF bytes
# ─────────────────────────────────────────
def extract_from_bytes(pdf_bytes: bytes, filename: str = "file.pdf") -> str:
    """
    Takes raw PDF bytes → returns all text from every page.
    """
    text_parts = []

    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            total_pages = len(pdf.pages)

            if total_pages == 0:
                return f"[{filename} has 0 pages]"

            for page_num, page in enumerate(pdf.pages, start=1):
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text_parts.append(page_text)
                else:
                    print(f"⚠️  Page {page_num} of {filename} has no readable text.")

    except Exception as e:
        return f"[Could not read {filename}: {str(e)}]"

    full_text = "\n\n".join(text_parts)

    if not full_text.strip():
        return f"[{filename} appears to be a scanned image — no text extracted]"

    return clean_text(full_text)


# ─────────────────────────────────────────
# MAIN FUNCTION — extract_text()
# Call this from main.py for one file
# ─────────────────────────────────────────
async def extract_text(file: UploadFile) -> dict:
    """
    Receives one FastAPI UploadFile (PDF).
    Returns dict with filename + extracted text.

    Usage in main.py:
        from extractor import extract_text
        result = await extract_text(file)
        print(result["filename"])
        print(result["text"])
    """

    # Step 1 — Check it's a PDF
    if not file.filename.lower().endswith(".pdf"):
        return {
            "filename": file.filename,
            "text":     f"[{file.filename} is not a PDF — skipped]",
            "pages":    0,
            "success":  False
        }

    # Step 2 — Read file bytes
    try:
        pdf_bytes = await file.read()
    except Exception as e:
        return {
            "filename": file.filename,
            "text":     f"[Failed to read {file.filename}: {e}]",
            "pages":    0,
            "success":  False
        }

    # Step 3 — Check file is not empty
    if len(pdf_bytes) == 0:
        return {
            "filename": file.filename,
            "text":     f"[{file.filename} is an empty file]",
            "pages":    0,
            "success":  False
        }

    # Step 4 — Count pages + extract text
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            total_pages = len(pdf.pages)

        extracted = extract_from_bytes(pdf_bytes, file.filename)

    except Exception as e:
        return {
            "filename": file.filename,
            "text":     f"[Error processing {file.filename}: {e}]",
            "pages":    0,
            "success":  False
        }

    print(f"📄 {file.filename} | Pages: {total_pages} | Chars: {len(extracted)}")

    return {
        "filename": file.filename,
        "text":     extracted,
        "pages":    total_pages,
        "success":  True
    }


# ─────────────────────────────────────────
# BATCH FUNCTION — extract_all()
# Call this from main.py for all CVs at once
# ─────────────────────────────────────────
async def extract_all(files: list) -> list:
    """
    Takes a list of UploadFile objects.
    Returns a list of dicts — one per file.

    Usage in main.py:
        from extractor import extract_all
        cv_data = await extract_all(cvs)
    """
    results = []

    for file in files:
        result = await extract_text(file)
        results.append(result)

    success_count = sum(1 for r in results if r["success"])
    print(f"✅ Extracted {success_count}/{len(files)} CVs successfully.")

    return results