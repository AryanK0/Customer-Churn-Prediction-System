"""
/api/predict - Unified churn prediction endpoint.
Accepts model: "final" | "benchmark" | "test" to choose notebook logic.
"""

import sys
from pathlib import Path

# Add project root directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.models import run_prediction

app = FastAPI(title="Churn Prediction AI Predict API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.post("/api/predict")
def predict(data: dict):
    """Predict churn. Include "model": "final"|"benchmark"|"test" in body (default: final)."""
    model = data.pop("model", "final")
    if model not in ("final", "benchmark", "test"):
        model = "final"
    return run_prediction(data, model=model)
