"""
/api/final - Churn prediction using Final.ipynb logic (PyCaret Logistic Regression style).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.models import predict_final

app = FastAPI(title="Churn Prediction AI Final API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/api/final")
def info():
    return {"model": "final", "source": "Final.ipynb", "description": "PyCaret Logistic Regression style"}


@app.post("/api/final")
def predict(data: dict):
    """Churn prediction - Final notebook logic."""
    return predict_final(data)
