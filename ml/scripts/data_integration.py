import os
import glob
import json
import logging
import warnings
from pathlib import Path

import kagglehub
import pandas as pd
import numpy as np

warnings.filterwarnings("ignore")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
RAW_DIR.mkdir(parents=True, exist_ok=True)

CANONICAL_COLUMNS = [
    "customer_id", "source_dataset",
    "gender", "senior_citizen", "partner", "dependents",
    "tenure_months", "phone_service", "multiple_lines",
    "internet_service", "online_security", "device_protection",
    "tech_support", "streaming_tv", "streaming_movies",
    "contract_type", "paperless_billing", "payment_method",
    "monthly_charges", "total_charges",
    "call_frequency_or_usage", "complaints_logged", "churn",
]

def fetch_datasets():
    print("[1/5] Downloading IBM Telco...")
    path1 = kagglehub.dataset_download("yeanzc/telco-customer-churn-ibm-dataset")
    
    print("[2/5] Downloading Cell2Cell / Telecom...")
    path2 = kagglehub.dataset_download("jpacse/datasets-for-churn-telecom")
    
    print("[3/5] Downloading Iranian Telecom Churn...")
    path3 = kagglehub.dataset_download("alinoranianesfahani/iranian-churn-dataset")
    
    print("[4/5] Downloading Orange Telecom Churn...")
    path4 = kagglehub.dataset_download("mnassrib/telecom-churn-datasets")
    
    print("[5/5] Downloading Synthetic Telecom Corpus...")
    path5 = kagglehub.dataset_download("sergiobuilds/synthetic-telecom-customer-churn")
    
    return [path1, path2, path3, path4, path5]

def find_csv(dir_path):
    files = glob.glob(os.path.join(dir_path, "**/*.csv"), recursive=True)
    return files[0] if files else None

def _safe_binary(series, mapping):
    return series.map(mapping).fillna(0).astype(int)

def _to_numeric_safe(series):
    return pd.to_numeric(series.astype(str).str.strip().replace("", np.nan), errors="coerce")

def harmonize_ibm_telco(df):
    out = pd.DataFrame()
    n = len(df)
    out["customer_id"] = ["IBM_" + str(i) for i in range(n)]
    out["source_dataset"] = "ibm_telco"
    out["gender"] = df.get("gender", pd.Series(["Male"]*n)).map({"Male": 0, "Female": 1, "male": 0, "female": 1}).fillna(0).astype(int)
    out["senior_citizen"] = df.get("SeniorCitizen", pd.Series([0]*n)).astype(int)
    yes_no = {"Yes": 1, "No": 0, "yes": 1, "no": 0}
    out["partner"] = _safe_binary(df.get("Partner", pd.Series(["No"]*n)), yes_no)
    out["dependents"] = _safe_binary(df.get("Dependents", pd.Series(["No"]*n)), yes_no)
    out["tenure_months"] = _to_numeric_safe(df.get("tenure", pd.Series([12]*n)))
    out["phone_service"] = _safe_binary(df.get("PhoneService", pd.Series(["Yes"]*n)), yes_no)
    out["multiple_lines"] = df.get("MultipleLines", pd.Series(["No"]*n)).map({"Yes": "Yes", "No": "No", "No phone service": "No phone service"}).fillna("No")
    out["internet_service"] = df.get("InternetService", pd.Series(["None"]*n)).map({"DSL": "DSL", "Fiber optic": "Fiber optic", "No": "None"}).fillna("None")
    no_inet = {"Yes": 1, "No": 0, "No internet service": 0}
    out["online_security"] = df.get("OnlineSecurity", pd.Series(["No"]*n)).map(no_inet).fillna(0).astype(int)
    out["device_protection"] = df.get("DeviceProtection", pd.Series(["No"]*n)).map(no_inet).fillna(0).astype(int)
    out["tech_support"] = df.get("TechSupport", pd.Series(["No"]*n)).map(no_inet).fillna(0).astype(int)
    out["streaming_tv"] = df.get("StreamingTV", pd.Series(["No"]*n)).map(no_inet).fillna(0).astype(int)
    out["streaming_movies"] = df.get("StreamingMovies", pd.Series(["No"]*n)).map(no_inet).fillna(0).astype(int)
    out["contract_type"] = df.get("Contract", pd.Series(["Month-to-month"]*n)).map({"Month-to-month": "Month-to-month", "One year": "One year", "Two year": "Two year"}).fillna("Month-to-month")
    out["paperless_billing"] = _safe_binary(df.get("PaperlessBilling", pd.Series(["Yes"]*n)), yes_no)
    out["payment_method"] = df.get("PaymentMethod", pd.Series(["Electronic check"]*n)).map({
        "Electronic check": "Electronic check", "Mailed check": "Mailed check",
        "Bank transfer (automatic)": "Bank transfer", "Credit card (automatic)": "Credit card"
    }).fillna("Electronic check")
    out["monthly_charges"] = _to_numeric_safe(df.get("MonthlyCharges", pd.Series([50.0]*n)))
    out["total_charges"] = _to_numeric_safe(df.get("TotalCharges", pd.Series([""]*n)))
    mask = out["total_charges"].isna() | (out["total_charges"] <= 0)
    out.loc[mask, "total_charges"] = out.loc[mask, "monthly_charges"] * out.loc[mask, "tenure_months"]
    out["call_frequency_or_usage"] = np.nan
    out["complaints_logged"] = 0
    out["churn"] = _safe_binary(df.get("Churn", pd.Series(["No"]*n)), yes_no)
    return out

def harmonize_cell2cell(df):
    out = pd.DataFrame()
    n = len(df)
    out["customer_id"] = ["C2C_" + str(i) for i in range(n)]
    out["source_dataset"] = "cell2cell"
    out["gender"] = df.get("Gender", pd.Series(["Male"]*n)).map({"M": 0, "F": 1}).fillna(0).astype(int)
    out["senior_citizen"] = 0
    yes_no = {"Yes": 1, "No": 0, "Y": 1, "N": 0}
    out["partner"] = 0
    out["dependents"] = 0
    out["tenure_months"] = _to_numeric_safe(df.get("MonthsInService", pd.Series([12]*n)))
    out["phone_service"] = 1
    out["multiple_lines"] = "No"
    out["internet_service"] = "None"
    out["online_security"] = 0
    out["device_protection"] = 0
    out["tech_support"] = 0
    out["streaming_tv"] = 0
    out["streaming_movies"] = 0
    out["contract_type"] = "Month-to-month"
    out["paperless_billing"] = 0
    out["payment_method"] = "Electronic check"
    out["monthly_charges"] = _to_numeric_safe(df.get("MonthlyRevenue", pd.Series([50.0]*n)))
    out["total_charges"] = _to_numeric_safe(df.get("TotalRecurringCharge", pd.Series([""]*n)))
    mask = out["total_charges"].isna() | (out["total_charges"] <= 0)
    out.loc[mask, "total_charges"] = out.loc[mask, "monthly_charges"] * out.loc[mask, "tenure_months"]
    out["call_frequency_or_usage"] = 0
    out["complaints_logged"] = _to_numeric_safe(df.get("CustomerCareCalls", df.get("CustomerServiceCalls", pd.Series([0]*n)))).fillna(0).astype(int)
    out["churn"] = _safe_binary(df.get("Churn", pd.Series(["No"]*n)), yes_no)
    return out

def harmonize_iranian(df):
    out = pd.DataFrame()
    n = len(df)
    out["customer_id"] = ["IRN_" + str(i) for i in range(n)]
    out["source_dataset"] = "iranian"
    out["gender"] = 0
    out["senior_citizen"] = 0
    out["partner"] = 0
    out["dependents"] = 0
    out["tenure_months"] = _to_numeric_safe(df.get("Subscription  Length", pd.Series([12]*n)))
    out["phone_service"] = 1
    out["multiple_lines"] = "No"
    out["internet_service"] = "None"
    out["online_security"] = 0
    out["device_protection"] = 0
    out["tech_support"] = 0
    out["streaming_tv"] = 0
    out["streaming_movies"] = 0
    out["contract_type"] = "Month-to-month"
    out["paperless_billing"] = 0
    out["payment_method"] = "Electronic check"
    out["monthly_charges"] = _to_numeric_safe(df.get("Charge  Amount", pd.Series([50.0]*n)))
    out["total_charges"] = out["monthly_charges"] * out["tenure_months"]
    out["call_frequency_or_usage"] = _to_numeric_safe(df.get("Seconds of Use", df.get("Frequency of use", pd.Series([0]*n))))
    out["complaints_logged"] = _to_numeric_safe(df.get("Complains", pd.Series([0]*n))).fillna(0).astype(int)
    out["churn"] = _safe_binary(df.get("Churn", pd.Series(["No"]*n)), {1: 1, 0: 0, "1": 1, "0": 0})
    return out

def harmonize_orange(df):
    out = pd.DataFrame()
    n = len(df)
    out["customer_id"] = ["ORG_" + str(i) for i in range(n)]
    out["source_dataset"] = "orange"
    out["gender"] = 0
    out["senior_citizen"] = 0
    out["partner"] = 0
    out["dependents"] = 0
    out["tenure_months"] = _to_numeric_safe(df.get("account length", pd.Series([12]*n)))
    out["phone_service"] = 1
    out["multiple_lines"] = "No"
    out["internet_service"] = "None"
    out["online_security"] = 0
    out["device_protection"] = 0
    out["tech_support"] = 0
    out["streaming_tv"] = 0
    out["streaming_movies"] = 0
    out["contract_type"] = "Month-to-month"
    out["paperless_billing"] = 0
    out["payment_method"] = "Electronic check"
    out["monthly_charges"] = 50.0
    out["total_charges"] = out["monthly_charges"] * out["tenure_months"]
    day_min = _to_numeric_safe(df.get("total day minutes", pd.Series([0]*n)))
    eve_min = _to_numeric_safe(df.get("total eve minutes", pd.Series([0]*n)))
    out["call_frequency_or_usage"] = day_min + eve_min
    out["complaints_logged"] = _to_numeric_safe(df.get("customer service calls", pd.Series([0]*n))).fillna(0).astype(int)
    churn_map = {True: 1, False: 0, "True": 1, "False": 0, "yes": 1, "no": 0}
    out["churn"] = _safe_binary(df.get("churn", df.get("Churn", pd.Series([False]*n))), churn_map)
    return out

def harmonize_synthetic(df):
    out = pd.DataFrame()
    n = len(df)
    out["customer_id"] = ["SYN_" + str(i) for i in range(n)]
    out["source_dataset"] = "synthetic_telecom"
    out["gender"] = df.get("gender", pd.Series(["Male"]*n)).map({"Male": 0, "Female": 1}).fillna(0).astype(int)
    out["senior_citizen"] = _to_numeric_safe(df.get("senior_citizen", pd.Series([0]*n))).fillna(0).astype(int)
    yes_no = {"Yes": 1, "No": 0, "yes": 1, "no": 0}
    out["partner"] = _safe_binary(df.get("partner", pd.Series(["No"]*n)), yes_no)
    out["dependents"] = _safe_binary(df.get("dependents", pd.Series(["No"]*n)), yes_no)
    out["tenure_months"] = _to_numeric_safe(df.get("tenure_months", df.get("tenure", pd.Series([12]*n))))
    out["phone_service"] = _safe_binary(df.get("phone_service", pd.Series(["Yes"]*n)), yes_no)
    out["multiple_lines"] = df.get("multiple_lines", pd.Series(["No"]*n)).map({"Yes": "Yes", "No": "No", "No phone service": "No phone service"}).fillna("No")
    out["internet_service"] = df.get("internet_service", pd.Series(["None"]*n)).map({"DSL": "DSL", "Fiber optic": "Fiber optic", "No": "None"}).fillna("None")
    out["online_security"] = _safe_binary(df.get("online_security", pd.Series(["No"]*n)), yes_no)
    out["device_protection"] = _safe_binary(df.get("device_protection", pd.Series(["No"]*n)), yes_no)
    out["tech_support"] = _safe_binary(df.get("tech_support", pd.Series(["No"]*n)), yes_no)
    out["streaming_tv"] = _safe_binary(df.get("streaming_tv", pd.Series(["No"]*n)), yes_no)
    out["streaming_movies"] = _safe_binary(df.get("streaming_movies", pd.Series(["No"]*n)), yes_no)
    out["contract_type"] = df.get("contract_type", df.get("contract", pd.Series(["Month-to-month"]*n))).map({"Month-to-month": "Month-to-month", "One year": "One year", "Two year": "Two year"}).fillna("Month-to-month")
    out["paperless_billing"] = _safe_binary(df.get("paperless_billing", pd.Series(["Yes"]*n)), yes_no)
    out["payment_method"] = df.get("payment_method", pd.Series(["Electronic check"]*n)).fillna("Electronic check")
    out["monthly_charges"] = _to_numeric_safe(df.get("monthly_charges", pd.Series([50.0]*n)))
    out["total_charges"] = _to_numeric_safe(df.get("total_charges", pd.Series([""]*n)))
    mask = out["total_charges"].isna() | (out["total_charges"] <= 0)
    out.loc[mask, "total_charges"] = out.loc[mask, "monthly_charges"] * out.loc[mask, "tenure_months"]
    out["call_frequency_or_usage"] = _to_numeric_safe(df.get("call_frequency_or_usage", pd.Series([np.nan]*n)))
    out["complaints_logged"] = _to_numeric_safe(df.get("complaints_logged", pd.Series([0]*n))).fillna(0).astype(int)
    out["churn"] = _safe_binary(df.get("churn", pd.Series(["No"]*n)), yes_no)
    return out

def build_master():
    paths = fetch_datasets()
    frames = []
    
    ibm_file = find_csv(paths[0])
    if ibm_file:
        df = pd.read_csv(ibm_file, low_memory=False)
        frames.append(harmonize_ibm_telco(df))
        log.info(f"Harmonized IBM Telco: {len(df)} rows")
        
    c2c_file = find_csv(paths[1])
    if c2c_file:
        df = pd.read_csv(c2c_file, low_memory=False)
        frames.append(harmonize_cell2cell(df))
        log.info(f"Harmonized Cell2Cell: {len(df)} rows")
        
    irn_file = find_csv(paths[2])
    if irn_file:
        df = pd.read_csv(irn_file, low_memory=False)
        frames.append(harmonize_iranian(df))
        log.info(f"Harmonized Iranian: {len(df)} rows")
        
    org_file = find_csv(paths[3])
    if org_file:
        df = pd.read_csv(org_file, low_memory=False)
        frames.append(harmonize_orange(df))
        log.info(f"Harmonized Orange: {len(df)} rows")
        
    syn_file = find_csv(paths[4])
    if syn_file:
        df = pd.read_csv(syn_file, low_memory=False)
        frames.append(harmonize_synthetic(df))
        log.info(f"Harmonized Synthetic: {len(df)} rows")
        
    master = pd.concat(frames, ignore_index=True)
    master["customer_id"] = ["CUST_" + str(i).zfill(6) for i in range(len(master))]
    
    # Impute missing numeric values across combined
    for col in ["monthly_charges", "total_charges", "call_frequency_or_usage", "tenure_months"]:
        master[col] = master[col].fillna(master[col].median())
    
    log.info(f"Master dataset: {len(master)} total records")
    return master[CANONICAL_COLUMNS]

def main():
    log.info("=" * 65)
    log.info("PHASE 1: DATA INTEGRATION PIPELINE (KAGGLEHUB)")
    log.info("=" * 65)

    master = build_master()

    parquet_out = PROCESSED_DIR / "master_telecom_churn.parquet"
    csv_out = PROCESSED_DIR / "master_telecom_churn.csv"
    report_out = PROCESSED_DIR / "data_quality_report.json"

    master.to_parquet(parquet_out, index=False)
    master.to_csv(csv_out, index=False)
    
    report = {
        "final_records": len(master),
        "churn_rate_pct": round(master["churn"].mean() * 100, 2),
        "source_distribution": master["source_dataset"].value_counts().to_dict(),
        "missing_final": master.isnull().sum().to_dict(),
    }
    with open(report_out, "w") as f:
        json.dump(report, f, indent=2, default=str)

    log.info("=" * 65)
    log.info("DONE | Records: %d | Churn: %.2f%%", len(master), master["churn"].mean() * 100)
    log.info("=" * 65)
    print("\nSCHEMA:\n", master.dtypes)
    print("\nSOURCE DIST:\n", master["source_dataset"].value_counts())
    print("\nCHURN DIST:\n", master["churn"].value_counts())

if __name__ == "__main__":
    main()
