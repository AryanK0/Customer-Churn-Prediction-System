import sys
import os
from pathlib import Path

# This dynamically finds the root "CCP" directory and adds it to the Python path
# Assuming main.py is in CCP/backend/api/main.py
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Also add the backend directory specifically if that's where 'api' lives
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# NOW you can do your imports
from api.model_loader import load_all_models, get_preprocessor, get_best_model, get_shap_explainer, get_tournament_results

import io
import time
import numpy as np
import pandas as pd
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from api.model_loader import load_all_models, get_preprocessor, get_best_model, get_shap_explainer, get_tournament_results

app = FastAPI(title="Churn Prediction AI", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "CCP Backend is running on Hugging Face Spaces"}

@app.on_event("startup")
async def startup_event():
    load_all_models()

class CustomerRecord(BaseModel):
    gender: int = Field(0, ge=0, le=1)
    senior_citizen: int = Field(0, ge=0, le=1)
    partner: int = Field(0, ge=0, le=1)
    dependents: int = Field(0, ge=0, le=1)
    tenure_months: float = Field(12.0, ge=0)
    phone_service: int = Field(1, ge=0, le=1)
    multiple_lines: str = Field("No")
    internet_service: str = Field("DSL")
    online_security: int = Field(0, ge=0, le=1)
    device_protection: int = Field(0, ge=0, le=1)
    tech_support: int = Field(0, ge=0, le=1)
    streaming_tv: int = Field(0, ge=0, le=1)
    streaming_movies: int = Field(0, ge=0, le=1)
    contract_type: str = Field("Month-to-month")
    paperless_billing: int = Field(1, ge=0, le=1)
    payment_method: str = Field("Electronic check")
    monthly_charges: float = Field(65.0, ge=0)
    total_charges: float = Field(780.0, ge=0)
    call_frequency_or_usage: float = Field(55.0, ge=0)
    complaints_logged: int = Field(0, ge=0)

def determine_risk_level(prob: float) -> str:
    if prob >= 0.80: return "Critical"
    if prob >= 0.50: return "High"
    if prob >= 0.20: return "Moderate"
    return "Low"

def compute_retention_strategy(prob: float, drivers: list) -> str:
    if prob > 0.7:
        return "Offer a discounted 1-year contract extension and customer loyalty waiver."
    if prob > 0.4:
        return "Proactive check-in call and 10% discount on next bill."
    return "Standard retention marketing."

@app.post("/api/predict")
async def predict_single(record: CustomerRecord):
    data = record.dict()
    df = pd.DataFrame([data])
    
    pre = get_preprocessor()
    model = get_best_model()
    explainer = get_shap_explainer()
    tournament = get_tournament_results()
    
    X = pre.transform(df)
    prob = float(model.predict_proba(X)[0, 1])
    
    # SHAP
    shap_vals = explainer.shap_values(X)
    if isinstance(shap_vals, list):
        sv = shap_vals[1][0]
    else:
        sv = shap_vals[0]
        
    feat_names = pre.feature_names_out
    top_idx = np.argsort(np.abs(sv))[::-1][:3]
    
    drivers = []
    for idx in top_idx:
        fname = feat_names[idx] if idx < len(feat_names) else f"feature_{idx}"
        drivers.append({"feature": fname, "impact": round(float(sv[idx]), 4)})
        
    strategy = compute_retention_strategy(prob, drivers)
    
    return {
      "churn_probability": round(prob, 4),
      "risk_level": determine_risk_level(prob),
      "model_used": tournament.get("winner", "Best Model"),
      "top_risk_drivers": drivers,
      "retention_strategy": strategy
    }

@app.post("/api/upload")
async def upload_bulk_csv(file: UploadFile = File(...)):
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV parse error: {e}")
        
    pre = get_preprocessor()
    model = get_best_model()
    
    X = pre.transform(df)
    probs = model.predict_proba(X)[:, 1]
    
    predictions = []
    for i, p in enumerate(probs):
        predictions.append({
            "row": i + 1,
            "churn_probability": round(float(p), 4),
            "risk_level": determine_risk_level(float(p))
        })
        
    return {
        "filename": file.filename,
        "total_records": len(df),
        "predictions": predictions
    }

@app.get("/api/models/tournament")
async def get_tournament():
    return get_tournament_results()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
