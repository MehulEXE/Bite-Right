"""
Bite-Right Backend API
Flask server providing OCR scanning and ingredient analysis endpoints.
"""

import os
import tempfile
import traceback

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import google.generativeai as genai

from ocr_engine import extract_text, parse_ingredients_list
from ingredient_analyzer import IngredientAnalyzer

# ── Load environment variables from .env ─────────────────────────────────────
load_dotenv()

# ── App Setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Config
UPLOAD_FOLDER = os.path.join(tempfile.gettempdir(), 'bite-right-uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

MAX_UPLOAD_MB = int(os.getenv('MAX_UPLOAD_SIZE_MB', '16'))
app.config['MAX_CONTENT_LENGTH'] = MAX_UPLOAD_MB * 1024 * 1024

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

# Initialize the ingredient analyzer with the Excel database
analyzer = IngredientAnalyzer()

# Configure Gemini AI from environment variable
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in .env file. Diet planner will not work.")
else:
    genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-3-flash-preview')


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ── API Endpoints ────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'service': 'Bite-Right OCR Backend',
        'products_loaded': len(analyzer.products)
    })


@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products from the database."""
    products = analyzer.get_all_products()
    return jsonify({
        'success': True,
        'count': len(products),
        'products': products
    })


@app.route('/api/products/search', methods=['GET'])
def search_products():
    """Search products by name."""
    query = request.args.get('q', '').strip().lower()
    if not query:
        return jsonify({'success': False, 'error': 'Query parameter "q" is required'}), 400

    results = []
    for product in analyzer.products:
        if query in product['name'].lower():
            results.append(product)

    return jsonify({
        'success': True,
        'count': len(results),
        'products': results
    })


@app.route('/api/scan', methods=['POST'])
def scan_label():
    """
    Main OCR scanning endpoint.
    Accepts an image file and user profile data.
    Returns OCR text extraction + ingredient analysis with flagging.
    """
    # ── Validate file upload ─────────────────────────────────────
    if 'image' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No image file provided. Send as "image" in multipart form data.'
        }), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'No file selected.'
        }), 400

    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'error': f'Invalid file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400

    # ── Get user profile from form data ──────────────────────────
    user_allergies = request.form.getlist('allergies')
    # Also accept JSON-encoded allergies
    if not user_allergies and request.form.get('allergies_json'):
        import json
        try:
            user_allergies = json.loads(request.form.get('allergies_json'))
        except:
            user_allergies = []

    user_conditions = request.form.getlist('conditions')
    if not user_conditions and request.form.get('conditions_json'):
        import json
        try:
            user_conditions = json.loads(request.form.get('conditions_json'))
        except:
            user_conditions = []

    user_diet = request.form.getlist('diet')
    if not user_diet and request.form.get('diet_json'):
        import json
        try:
            user_diet = json.loads(request.form.get('diet_json'))
        except:
            user_diet = []

    try:
        # ── Save uploaded file temporarily ───────────────────────
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # ── Run OCR ──────────────────────────────────────────────
        ocr_result = extract_text(filepath)

        if not ocr_result['success']:
            return jsonify({
                'success': False,
                'error': ocr_result.get('error', 'OCR processing failed')
            }), 500

        # ── Parse ingredients ────────────────────────────────────
        ingredients_text = ocr_result['ingredients_text']
        ingredients_list = parse_ingredients_list(ingredients_text)

        # ── Analyze ingredients ──────────────────────────────────
        analysis = analyzer.analyze_ingredients(
            ingredients_text=ingredients_text,
            user_allergies=user_allergies,
            user_conditions=user_conditions,
            user_diet=user_diet
        )

        # ── Clean up temp file ───────────────────────────────────
        try:
            os.remove(filepath)
        except:
            pass

        # ── Build response ───────────────────────────────────────
        return jsonify({
            'success': True,
            'ocr': {
                'raw_text': ocr_result['raw_text'],
                'cleaned_text': ocr_result['cleaned_text'],
                'ingredients_text': ingredients_text,
                'ingredients_list': ingredients_list
            },
            'analysis': {
                'overall_risk': analysis['overall_risk'],
                'risk_color': analysis['risk_color'],
                'summary': analysis['summary'],
                'total_flags': analysis['total_flags'],
                'flagged_ingredients': analysis['flagged_ingredients'],
                'allergen_matches': analysis['allergen_matches'],
                'dietary_concerns': analysis['dietary_concerns'],
                'condition_concerns': analysis['condition_concerns'],
                'matched_product': analysis.get('matched_product'),
                'db_allergens': analysis.get('db_allergens', [])
            }
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    """
    Analyze raw ingredient text (no OCR needed).
    Useful for manual text input or testing.
    """
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({
            'success': False,
            'error': 'JSON body with "text" field is required.'
        }), 400

    text = data['text']
    user_allergies = data.get('allergies', [])
    user_conditions = data.get('conditions', [])
    user_diet = data.get('diet', [])

    ingredients_list = parse_ingredients_list(text)
    analysis = analyzer.analyze_ingredients(
        ingredients_text=text,
        user_allergies=user_allergies,
        user_conditions=user_conditions,
        user_diet=user_diet
    )

    return jsonify({
        'success': True,
        'ingredients_list': ingredients_list,
        'analysis': {
            'overall_risk': analysis['overall_risk'],
            'risk_color': analysis['risk_color'],
            'summary': analysis['summary'],
            'total_flags': analysis['total_flags'],
            'flagged_ingredients': analysis['flagged_ingredients'],
            'allergen_matches': analysis['allergen_matches'],
            'dietary_concerns': analysis['dietary_concerns'],
            'condition_concerns': analysis['condition_concerns'],
            'matched_product': analysis.get('matched_product'),
            'db_allergens': analysis.get('db_allergens', [])
        }
    })

@app.route('/api/diet-plan', methods=['POST'])
def generate_diet_plan():
    """
    Generate a personalized diet plan using Gemini AI, 
    accounting for user allergies, medical conditions, diet, and bodybuilding goals.
    """
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No JSON payload provided'}), 400

    allergies = data.get('allergies', [])
    conditions = data.get('conditions', [])
    diet = data.get('diet', [])
    is_bodybuilding = data.get('is_bodybuilding', False)

    prompt = (
        "You are an expert clinical nutritionist and digital sommelier for food safety. "
        "Create a personalized daily diet plan (Breakfast, Lunch, Dinner, and 2 Snacks) "
        "with the following constraints:\n"
    )
    
    if allergies:
        prompt += f"- STRICTLY AVOID: {', '.join(allergies)} (Severe Allergies)\n"
    if conditions:
        prompt += f"- Manage and account for medical conditions: {', '.join(conditions)}\n"
    if diet:
        prompt += f"- Follow dietary preferences: {', '.join(diet)}\n"
        
    if is_bodybuilding:
        prompt += (
            "- Primary Goal: BODYBUILDING/MUSCLE GAIN. The plan must be exceptionally high in protein. "
            "Ensure macronutrients are optimized for muscle hypertrophy while adhering strictly "
            "to all allergy and medical constraints.\n"
        )
    else:
        prompt += "- General Health: Ensure a balanced macronutrient profile for everyday energy.\n"
        
    prompt += (
        "\nFormat the output in clean, readable Markdown. Include the macros (Protein, Carbs, Fats) "
        "for each meal. Do not include introductory conversational filler, just the plan."
    )

    try:
        response = model.generate_content(prompt)
        return jsonify({
            'success': True,
            'plan_markdown': response.text
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Failed to generate diet plan: {str(e)}'
        }), 500



# ── Run ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    debug = os.getenv('FLASK_DEBUG', 'False').lower() in ('true', '1', 'yes')
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', '5000'))

    print("=" * 60)
    print("  Bite-Right OCR Backend")
    print(f"  Products loaded: {len(analyzer.products)}")
    print(f"  Running on http://{host}:{port}")
    print(f"  Debug mode: {debug}")
    print("=" * 60)
    app.run(debug=debug, host=host, port=port)
