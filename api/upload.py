"""
/api/upload - Bulk CSV upload for churn prediction.
Uses Final, Benchmark, or Test model logic (default: final).
"""
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import csv
import io

from api.models import run_prediction

app = FastAPI(title="Churn Prediction AI Upload API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def _row_to_data(row: dict) -> dict:
    """Map CSV columns (Dataset.csv, excluding customerID) to prediction input format."""
    return {
        "gender": row.get("gender", "Male"),
        "seniorCitizen": int(float(row.get("SeniorCitizen", 0) or 0)),
        "partner": row.get("Partner", "No"),
        "dependents": row.get("Dependents", "No"),
        "tenure": int(float(row.get("tenure", 0) or 0)),
        "phoneService": row.get("PhoneService", "Yes"),
        "multipleLines": row.get("MultipleLines", "No"),
        "internetService": row.get("InternetService", "DSL"),
        "onlineSecurity": row.get("OnlineSecurity", "No"),
        "deviceProtection": row.get("DeviceProtection", "No"),
        "techSupport": row.get("TechSupport", "No"),
        "streamingTV": row.get("StreamingTV", "No"),
        "streamingMovies": row.get("StreamingMovies", "No"),
        "contractType": row.get("Contract", row.get("contract_type", "Month-to-month")),
        "paperlessBilling": row.get("PaperlessBilling", "Yes"),
        "paymentMethod": row.get("PaymentMethod", row.get("payment_method", "Electronic check")),
        "monthlyCharges": float(row.get("MonthlyCharges", row.get("monthly_charges", 0)) or 0),
        "totalCharges": float(row.get("TotalCharges", row.get("total_charges", 0)) or 0),
    }


@app.post("/api/upload")
async def upload(file: UploadFile = File(...), model: str = Form("final")):
    """Process CSV upload - returns prediction counts. Pass model=final|benchmark|test."""
    if not file.filename.endswith(".csv"):
        return {"error": "CSV files only"}

    content = await file.read()
    try:
        reader = csv.DictReader(io.StringIO(content.decode()))
        rows = list(reader)
    except Exception as e:
        return {"error": str(e)}

    if model not in ("final", "benchmark", "test"):
        model = "final"

    high, medium, low = 0, 0, 0
    for row in rows:
        try:
            data = _row_to_data(row)
            res = run_prediction(data, model=model)
            rl = res.get("riskLevel", "Low")
            if rl == "High":
                high += 1
            elif rl == "Medium":
                medium += 1
            else:
                low += 1
        except Exception:
            pass

    return {
        "filename": file.filename,
        "totalRecords": len(rows),
        "highRiskCount": high,
        "mediumRiskCount": medium,
        "lowRiskCount": low,
        "model": model,
    }
