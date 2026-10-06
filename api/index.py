"""
FastAPI backend for Churn Prediction AI - Vercel serverless.
api/index.py → /api (health check)
api/predict.py → /api/predict
api/upload.py → /api/upload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Churn Prediction AI API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/api")
def api_root():
    return {"status": "ok", "message": "Churn Prediction AI API", "version": "1.0.0"}
