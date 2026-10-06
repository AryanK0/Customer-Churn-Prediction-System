"""
=============================================================================
PHASE 3B: AUTOML CEILING BENCHMARK
Customer Churn Prediction AI - Enterprise ML Platform
=============================================================================
Runs FLAML AutoML (lightweight, no Java) with a 15-minute compute budget
to establish the empirical performance ceiling vs. custom-trained models.

Falls back to PyCaret AutoML if FLAML is unavailable.

Output:
  - models/tournament_results.json  (automl_benchmark key appended)
  - models/saved/automl_best.joblib

Usage:
  python src/ml/automl_benchmark.py
=============================================================================
"""

import json
import logging
import time
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

log = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models" / "saved"
MODELS_DIR.mkdir(parents=True, exist_ok=True)


def run_flaml_automl(X_train, y_train, X_test, y_test, time_budget_sec=900):
    """Run FLAML AutoML benchmark."""
    try:
        from flaml import AutoML

        log.info("Starting FLAML AutoML (budget: %ds)...", time_budget_sec)
        automl = AutoML()
        automl.fit(
            X_train, y_train,
            task="classification",
            metric="roc_auc",
            time_budget=time_budget_sec,
            eval_method="cv",
            n_splits=5,
            log_file_name=str(BASE_DIR / "reports" / "flaml_log.txt"),
            verbose=1,
        )
        y_prob = automl.predict_proba(X_test)[:, 1]
        y_pred = (y_prob >= 0.5).astype(int)

        from sklearn.metrics import roc_auc_score, f1_score, accuracy_score
        from sklearn.metrics import precision_score, recall_score

        result = {
            "framework": "FLAML",
            "best_estimator": automl.best_estimator,
            "best_config": str(automl.best_config),
            "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
            "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        }
        joblib.dump(automl, MODELS_DIR / "automl_best.joblib")
        log.info("FLAML done. Best: %s | ROC-AUC: %.4f", automl.best_estimator, result["roc_auc"])
        return automl, result

    except ImportError:
        log.warning("FLAML not installed. Trying PyCaret fallback...")
        return run_pycaret_automl(X_train, y_train, X_test, y_test, time_budget_sec)


def run_pycaret_automl(X_train, y_train, X_test, y_test, time_budget_sec=900):
    """PyCaret AutoML fallback."""
    try:
        import pycaret.classification as pc

        df_train = pd.DataFrame(X_train, columns=[f"f_{i}" for i in range(X_train.shape[1])])
        df_train["target"] = y_train

        log.info("Running PyCaret AutoML...")
        pc.setup(df_train, target="target", silent=True, html=False, verbose=False, session_id=42)
        best = pc.compare_models(n_select=1, sort="AUC", budget_time=time_budget_sec / 60)
        pc.save_model(best, str(MODELS_DIR / "automl_best_pycaret"))

        df_test = pd.DataFrame(X_test, columns=[f"f_{i}" for i in range(X_test.shape[1])])
        preds = pc.predict_model(best, data=df_test)
        y_prob = preds["Score"].values if "Score" in preds.columns else preds.iloc[:, -1].values
        y_pred = (y_prob >= 0.5).astype(int)

        from sklearn.metrics import roc_auc_score, f1_score, accuracy_score
        result = {
            "framework": "PyCaret",
            "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        }
        log.info("PyCaret done. ROC-AUC: %.4f", result["roc_auc"])
        return best, result

    except ImportError:
        log.warning("Neither FLAML nor PyCaret installed. Returning baseline.")
        return None, {"framework": "unavailable", "roc_auc": None}


def compute_ceiling_comparison(custom_results: dict, automl_result: dict) -> dict:
    """Compute how close custom models are to the AutoML ceiling."""
    automl_auc = automl_result.get("roc_auc")
    if automl_auc is None:
        return {"error": "AutoML ceiling unavailable"}

    valid = {k: v for k, v in custom_results.items() if isinstance(v, dict) and "roc_auc" in v}
    sorted_models = sorted(valid.items(), key=lambda x: x[1]["roc_auc"], reverse=True)

    comparisons = []
    for name, metrics in sorted_models:
        gap = automl_auc - metrics["roc_auc"]
        pct_of_ceiling = round((metrics["roc_auc"] / automl_auc) * 100, 2) if automl_auc > 0 else 0
        comparisons.append({
            "model": name,
            "roc_auc": metrics["roc_auc"],
            "gap_to_ceiling": round(gap, 4),
            "pct_of_ceiling": pct_of_ceiling,
        })

    return {
        "automl_ceiling": automl_auc,
        "framework": automl_result.get("framework"),
        "best_custom_model": sorted_models[0][0] if sorted_models else None,
        "best_custom_auc": sorted_models[0][1]["roc_auc"] if sorted_models else None,
        "comparisons": comparisons,
    }


def run_automl_benchmark(X_train, X_val, X_test, y_train, y_val, y_test, time_budget_sec=900):
    """Main AutoML benchmark runner."""
    log.info("=" * 65)
    log.info("AUTOML CEILING BENCHMARK")
    log.info("=" * 65)

    best_model, automl_metrics = run_flaml_automl(
        X_train, y_train, X_test, y_test, time_budget_sec
    )

    # Load existing tournament results and append
    results_path = MODELS_DIR.parent / "tournament_results.json"
    if results_path.exists():
        with open(results_path) as f:
            existing = json.load(f)
        comparison = compute_ceiling_comparison(existing.get("models", {}), automl_metrics)
        existing["automl_benchmark"] = automl_metrics
        existing["automl_ceiling_comparison"] = comparison
        with open(results_path, "w") as f:
            json.dump(existing, f, indent=2, default=str)
        log.info("Tournament results updated with AutoML benchmark.")
        return existing
    else:
        output = {
            "automl_benchmark": automl_metrics,
            "models": {},
        }
        with open(results_path, "w") as f:
            json.dump(output, f, indent=2, default=str)
        return output


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

    import sys
    sys.path.insert(0, str(BASE_DIR / "src"))
    from ml.preprocessor import ChurnPreprocessor

    PROCESSED_DIR = BASE_DIR / "data" / "processed"
    data_path = PROCESSED_DIR / "master_telecom_churn.parquet"

    if not data_path.exists():
        log.error("Run data_integration.py first.")
        raise FileNotFoundError(data_path)

    df = pd.read_parquet(data_path)
    pre = ChurnPreprocessor()
    pre.load()
    X_train, X_val, X_test, y_train, y_val, y_test = pre.fit_transform_split(df)

    results = run_automl_benchmark(X_train, X_val, X_test, y_train, y_val, y_test)
    print("\nAutoML Benchmark:", results.get("automl_benchmark"))

