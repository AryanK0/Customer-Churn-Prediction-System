"""
/api/upload - Bulk CSV upload for churn prediction.
Uses Final, Benchmark, or Test model logic (default: final).
"""
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import csv
import io

from api.models import run_prediction

app = FastAPI(title="ChurnFlix Upload API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def _row_to_data(row: dict) -> dict:
    """Map CSV columns to prediction input format."""
    return {
        "gender": row.get("gender", "Male"),
        "contractType": row.get("contract_type", row.get("contractType", "Month-to-month")),
        "internetService": row.get("internet_service", row.get("internetService", "DSL")),
        "techSupport": row.get("tech_support", row.get("techSupport", "No")),
        "paymentMethod": row.get("payment_method", row.get("paymentMethod", "Electronic check")),
        "tenure": int(float(row.get("tenure", 0) or 0)),
        "monthlyCharges": float(row.get("monthly_charges", row.get("monthlyCharges", 0)) or 0),
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
