# 🛡️ Bite-Right — AI-Powered Food Allergen Detection

Bite-Right is an AI-powered food safety scanner that detects allergens and flags unsafe ingredients based on your personal health profile. It uses **OCR** (Tesseract) to scan food labels, cross-references ingredients against an allergen database, and provides instant Safe/Unsafe/Risk verdicts.
.
<img width="1366" height="606" alt="image" src="https://github.com/user-attachments/assets/0fcaccef-75e3-4460-90c2-1d713c5aa4d8" />

<img width="1366" height="552" alt="image" src="https://github.com/user-attachments/assets/5ec4a67f-4c1b-4588-8b67-dcdebd5de6f9" />

<img width="1366" height="558" alt="image" src="https://github.com/user-attachments/assets/d0e6a324-eb61-474c-9fcf-f1c5ac9a72a9" />

<img width="791" height="554" alt="image" src="https://github.com/user-attachments/assets/afd76adf-b3de-41b1-ba3e-433f42941934" />

<img width="1091" height="499" alt="image" src="https://github.com/user-attachments/assets/2ad8dac9-1424-46f7-9710-312666d49a53" />






---

## 📂 Project Structure

```
bite-right/
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
│
├── backend/                    # Python Flask API
│   ├── .env                    # Environment variables (not committed)
│   ├── app.py                  # Flask server & API endpoints
│   ├── ingredient_analyzer.py  # Allergen detection engine
│   ├── ocr_engine.py           # Tesseract OCR text extraction
│   ├── requirements.txt        # Python dependencies
│   └── data/
│       └── pbl.xlsx            # Product allergen database (39+ products)
│
└── frontend/                   # Static frontend (React via CDN)
    ├── index.html              # Main HTML entry point
    ├── styles.css              # Custom CSS styles
    ├── config.js               # Firebase & API config (not committed)
    ├── config.example.js       # Config template (committed)
    ├── assets/
    │   └── hero-bg.png         # Hero section background image
    └── src/
        └── app.jsx             # React components (Dashboard, Scanner, etc.)
```

---

## ⚡ Quick Start

### Prerequisites

- **Python 3.9+**
- **Tesseract OCR** installed and available in your PATH
  - Windows: [Download installer](https://github.com/UB-Mannheim/tesseract/wiki)
  - macOS: `brew install tesseract`
  - Linux: `sudo apt install tesseract-ocr`

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/bite-right.git
cd bite-right
```

### 2. Set Up the Backend

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

**Backend** — Create a `.env` file in the `backend/` directory (a template is provided):

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
FLASK_DEBUG=True
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
MAX_UPLOAD_SIZE_MB=16
```

**Frontend** — Copy the config template and fill in your Firebase credentials:

```bash
cd frontend
cp config.example.js config.js
```

Then edit `config.js` with your Firebase project values. This file is gitignored to keep your keys safe.

### 4. Start the Backend Server

```bash
cd backend
python app.py
```

The API will be running at `http://localhost:5000`.

### 5. Start the Frontend

Open a new terminal:

```bash
cd frontend
python -m http.server 8080
```

Then open **http://localhost:8080** in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint               | Description                           |
| ------ | ---------------------- | ------------------------------------- |
| GET    | `/api/health`          | Health check & product count          |
| GET    | `/api/products`        | List all products in database         |
| GET    | `/api/products/search` | Search products by name (`?q=query`)  |
| POST   | `/api/scan`            | Upload image for OCR + analysis       |
| POST   | `/api/analyze-text`    | Analyze raw ingredient text           |
| POST   | `/api/diet-plan`       | Generate AI diet plan (Gemini)        |

---

## 🔑 Key Features

- **OCR Label Scanning** — Snap a photo of any food label, AI extracts every ingredient
- **Allergen Detection** — Cross-references against 12+ major allergen categories
- **Health Profiles** — Configure allergies, medical conditions, and dietary preferences
- **Product Database** — 39+ Indian food products pre-loaded with allergen data
- **AI Diet Planner** — Personalized meal plans powered by Google Gemini AI
- **Camera Scanning** — Use device camera for real-time label scanning
- **Firebase Auth** — Google Sign-In authentication

---

## 🛠️ Tech Stack

| Layer     | Technology                                    |
| --------- | --------------------------------------------- |
| Frontend  | React 18 (CDN), Tailwind CSS, Framer Motion   |
| Backend   | Python, Flask, Flask-CORS                      |
| OCR       | Tesseract (pytesseract)                        |
| AI        | Google Gemini API                              |
| Auth      | Firebase Authentication                        |
| Database  | Excel (openpyxl) — product allergen data       |
| Icons     | Lucide Icons                                   |

---

## 🔒 Security Notes

- **Never commit `.env` files** — they contain API keys
- Firebase config in `index.html` is client-side (safe to expose)
- The Gemini API key should be kept server-side only (in `.env`)

---

## 📝 License

This project is for educational and personal use.

---

Built with ❤️ for safer eating.
#
