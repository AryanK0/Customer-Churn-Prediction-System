"""
/api/test - Churn prediction using Test.ipynb logic (XGBoost/LightGBM/CatBoost ensemble style).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.models import predict_test

app = FastAPI(title="Churn Prediction AI Test API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/api/test")
def info():
    return {"model": "test", "source": "Test.ipynb", "description": "XGBoost/LightGBM/CatBoost ensemble style"}


@app.post("/api/test")
def predict(data: dict):
    """Churn prediction - Test notebook logic."""
    return predict_test(data)
