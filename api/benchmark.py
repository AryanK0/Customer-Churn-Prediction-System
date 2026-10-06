"""
/api/benchmark - Churn prediction using Benchmark.ipynb logic (H2O AutoML style).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.models import predict_benchmark

app = FastAPI(title="Churn Prediction AI Benchmark API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/api/benchmark")
def info():
    return {"model": "benchmark", "source": "Benchmark.ipynb", "description": "H2O AutoML ensemble style"}


@app.post("/api/benchmark")
def predict(data: dict):
    """Churn prediction - Benchmark notebook logic."""
    return predict_benchmark(data)
