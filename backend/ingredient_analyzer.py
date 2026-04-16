"""
Ingredient Analyzer for Bite-Right
Loads food product data from Excel and analyzes/flags ingredients
based on user's health profile (allergies, conditions, dietary preferences).
"""

import openpyxl
import re
import os
from difflib import SequenceMatcher


# ── Common allergen keyword database (expanded) ─────────────────────────────
ALLERGEN_KEYWORDS = {
    'Peanuts': [
        'peanut', 'groundnut', 'arachis', 'monkey nut', 'earth nut',
        'groundnut oil', 'peanut oil', 'peanut butter'
    ],
    'Tree nuts': [
        'almond', 'cashew', 'walnut', 'pistachio', 'pecan', 'hazelnut',
        'macadamia', 'brazil nut', 'chestnut', 'pine nut', 'praline',
        'marzipan', 'nougat', 'tree nut'
    ],
    'Milk': [
        'milk', 'dairy', 'cream', 'butter', 'cheese', 'whey', 'casein',
        'lactose', 'lactalbumin', 'ghee', 'curd', 'yogurt', 'paneer',
        'milk solids', 'milk powder', 'skimmed milk', 'whole milk',
        'condensed milk', 'evaporated milk', 'buttermilk'
    ],
    'Eggs': [
        'egg', 'albumin', 'globulin', 'lysozyme', 'mayonnaise', 'meringue',
        'ovalbumin', 'ovomucin', 'ovomucoid', 'ovovitellin', 'egg white',
        'egg yolk', 'egg powder'
    ],
    'Soy': [
        'soy', 'soya', 'soybean', 'soja', 'edamame', 'miso', 'tempeh',
        'tofu', 'soy lecithin', 'soya lecithin', 'soybean oil', 'soy sauce',
        'soy protein'
    ],
    'Wheat / Gluten': [
        'wheat', 'gluten', 'flour', 'maida', 'atta', 'semolina', 'suji',
        'bread', 'roti', 'naan', 'pasta', 'noodle', 'seitan', 'spelt',
        'durum', 'emmer', 'farina', 'kamut', 'wheat flour', 'refined wheat',
        'whole wheat'
    ],
    'Shellfish': [
        'shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'scallop',
        'clam', 'mussel', 'oyster', 'squid', 'octopus', 'shellfish',
        'crustacean'
    ],
    'Fish': [
        'fish', 'anchovy', 'bass', 'catfish', 'cod', 'flounder', 'haddock',
        'hake', 'herring', 'mackerel', 'perch', 'pike', 'pollock', 'salmon',
        'sole', 'snapper', 'swordfish', 'tilapia', 'trout', 'tuna',
        'fish sauce', 'fish oil', 'surimi'
    ],
    'Sesame': [
        'sesame', 'tahini', 'til', 'gingelly', 'sesame oil', 'sesame seed'
    ],
    'Mustard': [
        'mustard', 'mustard seed', 'mustard oil', 'mustard powder'
    ],
    'Celery': [
        'celery', 'celeriac', 'celery salt', 'celery seed'
    ],
    'Sulphites': [
        'sulphite', 'sulfite', 'sulphur dioxide', 'sulfur dioxide',
        'sodium metabisulphite', 'sodium metabisulfite', 'potassium metabisulphite',
        'e220', 'e221', 'e222', 'e223', 'e224', 'e225', 'e226', 'e227', 'e228',
        '223', '224', '225', '226', '227', '228'
    ]
}

# Dietary concern keywords
DIETARY_KEYWORDS = {
    'Vegan': [
        'milk', 'dairy', 'cream', 'butter', 'cheese', 'whey', 'casein',
        'lactose', 'ghee', 'curd', 'yogurt', 'paneer', 'egg', 'honey',
        'gelatin', 'animal', 'meat', 'fish', 'shellfish', 'milk solids'
    ],
    'Vegetarian': [
        'gelatin', 'animal fat', 'lard', 'tallow', 'meat', 'fish',
        'shellfish', 'anchovy', 'rennet'
    ],
    'Keto': [
        'sugar', 'glucose', 'fructose', 'sucrose', 'maltodextrin',
        'corn syrup', 'dextrose', 'maltose', 'starch', 'flour',
        'wheat', 'rice', 'corn', 'potato'
    ],
    'Low sugar': [
        'sugar', 'glucose', 'fructose', 'sucrose', 'maltodextrin',
        'corn syrup', 'dextrose', 'maltose', 'invert sugar', 'jaggery',
        'honey', 'molasses', 'high fructose'
    ],
    'Low carb': [
        'sugar', 'flour', 'wheat', 'rice', 'corn', 'potato', 'starch',
        'maltodextrin', 'dextrose', 'glucose'
    ]
}

# Medical condition concern keywords
CONDITION_KEYWORDS = {
    'Diabetes': [
        'sugar', 'glucose', 'fructose', 'sucrose', 'maltodextrin',
        'corn syrup', 'dextrose', 'maltose', 'invert sugar', 'jaggery',
        'honey', 'high fructose'
    ],
    'High blood pressure': [
        'salt', 'sodium', 'msg', 'monosodium glutamate', 'soy sauce',
        'iodised salt', 'black salt', 'rock salt', 'sodium chloride',
        'baking soda', 'sodium bicarbonate'
    ],
    'Lactose intolerance': [
        'milk', 'dairy', 'cream', 'butter', 'cheese', 'whey', 'casein',
        'lactose', 'ghee', 'curd', 'yogurt', 'paneer', 'milk solids',
        'milk powder', 'buttermilk'
    ],
    'Gluten intolerance': [
        'wheat', 'gluten', 'flour', 'maida', 'atta', 'semolina', 'suji',
        'barley', 'rye', 'oats', 'spelt', 'seitan'
    ],
    'Food sensitivities': [
        'msg', 'monosodium glutamate', 'artificial colour', 'artificial color',
        'artificial flavour', 'artificial flavor', 'preservative', 'sulfite',
        'sulphite', 'nitrate', 'nitrite', 'benzoate', 'bha', 'bht',
        'aspartame', 'saccharin'
    ]
}


class IngredientAnalyzer:
    def __init__(self, excel_path: str = None):
        if excel_path is None:
            # Default path: backend/data/pbl.xlsx
            excel_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                'data', 'pbl.xlsx'
            )
        self.excel_path = excel_path
        self.products = []
        self.load_database()

    def load_database(self):
        """Load product data from Excel file."""
        try:
            wb = openpyxl.load_workbook(self.excel_path)
            ws = wb.active

            self.products = []
            for row in ws.iter_rows(min_row=2):  # Skip header
                product = row[0].value
                ingredients = row[1].value
                allergic = row[2].value

                if product:  # Skip empty rows
                    self.products.append({
                        'name': str(product).strip(),
                        'ingredients': str(ingredients).strip() if ingredients else '',
                        'allergic_ingredients': str(allergic).strip() if allergic else ''
                    })

            wb.close()
            print(f"[IngredientAnalyzer] Loaded {len(self.products)} products from database")
        except Exception as e:
            print(f"[IngredientAnalyzer] Error loading database: {e}")
            self.products = []

    def get_all_products(self) -> list:
        """Return all products from database."""
        return self.products

    def find_product_match(self, text: str) -> dict | None:
        """
        Try to find a matching product in the database based on OCR text.
        Uses fuzzy matching to handle OCR imperfections.
        """
        text_lower = text.lower()
        best_match = None
        best_score = 0

        for product in self.products:
            product_name = product['name'].lower()
            # Check if product name appears in text
            if product_name in text_lower:
                return product

            # Fuzzy match
            score = SequenceMatcher(None, product_name, text_lower[:100]).ratio()
            # Also check individual words
            product_words = product_name.split()
            matching_words = sum(1 for w in product_words if w in text_lower)
            word_score = matching_words / max(len(product_words), 1)

            combined = max(score, word_score)
            if combined > best_score and combined > 0.4:
                best_score = combined
                best_match = product

        return best_match

    def analyze_ingredients(self, ingredients_text: str, user_allergies: list = None,
                            user_conditions: list = None, user_diet: list = None) -> dict:
        """
        Analyze ingredients text and flag items based on user profile.

        Returns a comprehensive analysis with:
        - overall_risk: 'Safe', 'Potential Risk', or 'Unsafe'
        - flagged_ingredients: list of flagged items with reasons
        - safe_ingredients: list of safe items
        - allergen_matches: specific allergen category matches
        """
        if not ingredients_text:
            return {
                'overall_risk': 'Unknown',
                'risk_color': 'gray',
                'flagged_ingredients': [],
                'safe_ingredients': [],
                'allergen_matches': [],
                'dietary_concerns': [],
                'condition_concerns': [],
                'summary': 'No ingredients text provided for analysis.'
            }

        user_allergies = user_allergies or []
        user_conditions = user_conditions or []
        user_diet = user_diet or []

        ingredients_lower = ingredients_text.lower()
        flagged = []
        safe = []
        allergen_matches = []
        dietary_concerns = []
        condition_concerns = []

        # ── Check against allergen database ──────────────────────────
        for allergen_name, keywords in ALLERGEN_KEYWORDS.items():
            # Check if user has this allergy
            user_has_allergy = any(
                allergen_name.lower() in ua.lower() or ua.lower() in allergen_name.lower()
                for ua in user_allergies
            )

            for keyword in keywords:
                if keyword.lower() in ingredients_lower:
                    entry = {
                        'ingredient': keyword.title(),
                        'allergen_category': allergen_name,
                        'user_allergic': user_has_allergy,
                        'risk': 'Unsafe' if user_has_allergy else 'Potential Risk'
                    }

                    if user_has_allergy:
                        entry['reason'] = f'You are allergic to {allergen_name} — this contains {keyword}'
                    else:
                        entry['reason'] = f'Contains {keyword} (common allergen: {allergen_name})'

                    flagged.append(entry)
                    if allergen_name not in allergen_matches:
                        allergen_matches.append(allergen_name)
                    break  # Only match one keyword per category

        # ── Check dietary preferences ────────────────────────────────
        for diet in user_diet:
            if diet in DIETARY_KEYWORDS:
                for keyword in DIETARY_KEYWORDS[diet]:
                    if keyword.lower() in ingredients_lower:
                        concern = {
                            'ingredient': keyword.title(),
                            'diet': diet,
                            'reason': f'Not suitable for {diet} diet — contains {keyword}'
                        }
                        dietary_concerns.append(concern)
                        break  # One match per diet is enough

        # ── Check medical conditions ─────────────────────────────────
        for condition in user_conditions:
            if condition in CONDITION_KEYWORDS:
                for keyword in CONDITION_KEYWORDS[condition]:
                    if keyword.lower() in ingredients_lower:
                        concern = {
                            'ingredient': keyword.title(),
                            'condition': condition,
                            'reason': f'May be problematic for {condition} — contains {keyword}'
                        }
                        condition_concerns.append(concern)
                        break

        # ── Check against product database ───────────────────────────
        matched_product = self.find_product_match(ingredients_text)
        db_allergens = []
        if matched_product and matched_product['allergic_ingredients']:
            db_allergens_raw = matched_product['allergic_ingredients']
            if db_allergens_raw.lower() != 'none':
                db_allergens = [
                    a.strip()
                    for a in re.split(r'[,\n]', db_allergens_raw)
                    if a.strip()
                ]

                for db_allergen in db_allergens:
                    # Check if already flagged
                    already_flagged = any(
                        db_allergen.lower() in f['ingredient'].lower() or
                        f['ingredient'].lower() in db_allergen.lower()
                        for f in flagged
                    )
                    if not already_flagged:
                        user_allergic = any(
                            ua.lower() in db_allergen.lower() or
                            db_allergen.lower() in ua.lower()
                            for ua in user_allergies
                        )
                        flagged.append({
                            'ingredient': db_allergen,
                            'allergen_category': 'Database Match',
                            'user_allergic': user_allergic,
                            'risk': 'Unsafe' if user_allergic else 'Potential Risk',
                            'reason': f'Flagged in product database as allergenic ingredient'
                        })

        # ── Determine overall risk level ─────────────────────────────
        has_unsafe = any(f['risk'] == 'Unsafe' for f in flagged)
        has_potential = any(f['risk'] == 'Potential Risk' for f in flagged)

        if has_unsafe:
            overall_risk = 'Unsafe'
            risk_color = 'red'
            summary = f'⚠️ HIGH RISK — This product contains ingredients you are allergic to ({", ".join(allergen_matches[:3])}). Avoid consumption.'
        elif has_potential or dietary_concerns or condition_concerns:
            overall_risk = 'Potential Risk'
            risk_color = 'yellow'
            concerns = []
            if has_potential:
                concerns.append(f'{len(flagged)} potential allergen(s) detected')
            if dietary_concerns:
                concerns.append(f'conflicts with your dietary preferences')
            if condition_concerns:
                concerns.append(f'may affect your medical conditions')
            summary = f'⚡ CAUTION — {"; ".join(concerns)}. Review flagged items carefully.'
        else:
            overall_risk = 'Safe'
            risk_color = 'green'
            summary = '✅ SAFE — No allergens or concerns detected based on your profile. Enjoy!'

        return {
            'overall_risk': overall_risk,
            'risk_color': risk_color,
            'flagged_ingredients': flagged,
            'safe_ingredients': safe,
            'allergen_matches': allergen_matches,
            'dietary_concerns': dietary_concerns,
            'condition_concerns': condition_concerns,
            'matched_product': matched_product,
            'db_allergens': db_allergens,
            'summary': summary,
            'total_flags': len(flagged) + len(dietary_concerns) + len(condition_concerns)
        }
