"""
OCR Engine for Bite-Right
Uses Tesseract OCR with image preprocessing for accurate ingredient extraction.
"""

import pytesseract
from PIL import Image, ImageFilter, ImageEnhance, ImageOps
import re
import os
import sys


# Auto-detect Tesseract on Windows
if sys.platform == 'win32':
    tesseract_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        r'C:\Users\{}\AppData\Local\Tesseract-OCR\tesseract.exe'.format(os.getenv('USERNAME', '')),
    ]
    for path in tesseract_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break


def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Preprocess image for better OCR accuracy.
    Steps: Resize -> Grayscale -> Contrast Enhancement -> Sharpen -> Threshold
    """
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Resize if too small (upscale for better OCR)
    width, height = image.size
    if width < 800:
        scale = 800 / width
        image = image.resize((int(width * scale), int(height * scale)), Image.LANCZOS)

    # Convert to grayscale
    gray = ImageOps.grayscale(image)

    # Enhance contrast
    enhancer = ImageEnhance.Contrast(gray)
    gray = enhancer.enhance(2.0)

    # Enhance sharpness
    enhancer = ImageEnhance.Sharpness(gray)
    gray = enhancer.enhance(2.0)

    # Apply slight denoise
    gray = gray.filter(ImageFilter.MedianFilter(size=3))

    # Apply adaptive-like thresholding via point operation
    threshold = 140
    gray = gray.point(lambda p: 255 if p > threshold else 0)

    return gray


def extract_text(image_path: str) -> dict:
    """
    Extract text from an image using Tesseract OCR.
    Returns dict with raw_text, cleaned_text, and confidence info.
    """
    try:
        image = Image.open(image_path)
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to open image: {str(e)}',
            'raw_text': '',
            'cleaned_text': '',
            'ingredients_text': ''
        }

    # Preprocess
    processed = preprocess_image(image)

    # OCR with detailed data
    try:
        # Get full text
        raw_text = pytesseract.image_to_string(
            processed,
            config='--oem 3 --psm 6'
        )

        # Also try with different page segmentation mode for better results
        raw_text_alt = pytesseract.image_to_string(
            processed,
            config='--oem 3 --psm 4'
        )

        # Use the longer result (likely more complete)
        if len(raw_text_alt) > len(raw_text):
            raw_text = raw_text_alt

    except Exception as e:
        return {
            'success': False,
            'error': f'OCR failed: {str(e)}',
            'raw_text': '',
            'cleaned_text': '',
            'ingredients_text': ''
        }

    # Clean up the text
    cleaned = clean_text(raw_text)

    # Extract ingredients section specifically
    ingredients_text = extract_ingredients_section(cleaned)

    return {
        'success': True,
        'raw_text': raw_text,
        'cleaned_text': cleaned,
        'ingredients_text': ingredients_text
    }


def clean_text(text: str) -> str:
    """Clean OCR output text."""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove stray special chars that OCR might produce
    text = re.sub(r'[|{}[\]~`]', '', text)
    # Fix common OCR misreads
    text = text.replace('0il', 'Oil')
    text = text.replace('0i1', 'Oil')
    text = text.replace('$ugar', 'Sugar')
    text = text.replace('$alt', 'Salt')
    text = text.replace('FI0ur', 'Flour')
    text = text.replace('Fl0ur', 'Flour')
    return text.strip()


def extract_ingredients_section(text: str) -> str:
    """
    Try to extract just the ingredients section from full label text.
    Looks for common keywords like 'Ingredients:', 'Contains:', etc.
    """
    text_lower = text.lower()

    # Common ingredient section markers
    markers = [
        r'ingredients?\s*[:\-]',
        r'contains?\s*[:\-]',
        r'composition\s*[:\-]',
        r'made\s+(?:from|with)\s*[:\-]?',
    ]

    for marker in markers:
        match = re.search(marker, text_lower)
        if match:
            # Return everything after the marker
            start = match.end()
            section = text[start:].strip()

            # Try to find the end of ingredients section
            end_markers = [
                r'nutrition(?:al)?\s*(?:facts?|info|information|value)',
                r'best\s+before',
                r'mfg\s+date',
                r'manufactured\s+by',
                r'net\s+(?:weight|wt|qty|quantity)',
                r'storage\s+(?:instructions?|conditions?)',
                r'allergen\s+(?:info|information|warning|advice)',
                r'directions?\s+for\s+use',
                r'serving\s+(?:size|suggestion)',
            ]

            for end_marker in end_markers:
                end_match = re.search(end_marker, section.lower())
                if end_match:
                    section = section[:end_match.start()].strip()
                    break

            return section

    # If no markers found, return the whole text (likely just an ingredients photo)
    return text


def parse_ingredients_list(ingredients_text: str) -> list:
    """
    Parse ingredients text into a list of individual ingredients.
    """
    if not ingredients_text:
        return []

    # Split by common delimiters
    # Handle parentheses content (don't split inside parentheses)
    ingredients = []
    current = ''
    depth = 0

    for char in ingredients_text:
        if char == '(':
            depth += 1
            current += char
        elif char == ')':
            depth -= 1
            current += char
        elif char == ',' and depth == 0:
            cleaned = current.strip().strip('.')
            if cleaned and len(cleaned) > 1:
                ingredients.append(cleaned)
            current = ''
        else:
            current += char

    # Don't forget the last item
    if current.strip():
        cleaned = current.strip().strip('.')
        if cleaned and len(cleaned) > 1:
            ingredients.append(cleaned)

    return ingredients
