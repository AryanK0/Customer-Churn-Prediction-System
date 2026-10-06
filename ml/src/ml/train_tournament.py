# -*- coding: utf-8 -*-
"""
=============================================================================
PHASE 3: MODEL TOURNAMENT -- ALL SYLLABUS ALGORITHMS + ENSEMBLES
Customer Churn Prediction AI - Enterprise ML Platform
=============================================================================
Trains, tunes, and evaluates 13 models:

  ACADEMIC CORE:
  1.  Logistic Regression (ElasticNet)
  2.  Decision Tree -- Gini (CART)
  3.  Decision Tree -- Entropy (ID3/C4.5)
  4.  Random Forest
  5.  Naive Bayes (Gaussian + Bernoulli)
  6.  K-Nearest Neighbours (k=3..21)
  7.  SVM Linear + RBF (with Platt scaling)
  8.  ANN / MLP Classifier

  GRADIENT BOOSTERS:
  9.  XGBoost
  10. LightGBM
  11. CatBoost

  ENSEMBLES:
  12. Soft Voting Classifier
  13. Stacking Classifier

Outputs:
  - models/saved/<model_name>.joblib
  - models/tournament_results.json
  - models/shap/shap_explainer.joblib

Usage:
  python src/ml/train_tournament.py
=============================================================================
"""

import json
import logging
import time
import warnings
from pathlib import Path
from typing import Dict, Any, Tuple, List

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import (
    RandomForestClassifier,
    StackingClassifier,
    VotingClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    balanced_accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.naive_bayes import BernoulliNB, GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

warnings.filterwarnings("ignore")

log = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models" / "saved"
SHAP_DIR = BASE_DIR / "models" / "shap"
REPORTS_DIR = BASE_DIR / "reports"
for d in [MODELS_DIR, SHAP_DIR, REPORTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)


def compute_metrics(y_true, y_pred, y_prob, model_name, inference_times_ms):
    """Compute the full metric suite for the syllabus evaluation framework."""
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel() if cm.shape == (2, 2) else (0, 0, 0, 0)
    sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    inf_arr = np.array(inference_times_ms)
    return {
        "model": model_name,
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "balanced_accuracy": round(float(balanced_accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall_sensitivity": round(float(sensitivity), 4),
        "specificity": round(float(specificity), 4),
        "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_true, y_prob)), 4),
        "pr_auc": round(float(average_precision_score(y_true, y_prob)), 4),
        "confusion_matrix": cm.tolist(),
        "tp": int(tp), "tn": int(tn), "fp": int(fp), "fn": int(fn),
        "inference_p50_ms": round(float(np.percentile(inf_arr, 50)), 3),
        "inference_p95_ms": round(float(np.percentile(inf_arr, 95)), 3),
        "inference_p99_ms": round(float(np.percentile(inf_arr, 99)), 3),
    }


def benchmark_inference(model, X_test, n_warmup=5):
    """Run inference with per-sample timing for latency metrics."""
    for _ in range(n_warmup):
        _ = model.predict_proba(X_test[:1])
    times = []
    for i in range(len(X_test)):
        t0 = time.perf_counter()
        _ = model.predict_proba(X_test[i:i+1])
        times.append((time.perf_counter() - t0) * 1000)
    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob >= 0.5).astype(int)
    return y_pred, y_prob, times


def get_all_models(random_state=42):
    """Returns all tournament models keyed by display name."""
    models = {}

    models["Logistic Regression (ElasticNet)"] = LogisticRegression(
        penalty="elasticnet", solver="saga", l1_ratio=0.5,
        C=0.5, max_iter=2000, random_state=random_state, class_weight="balanced"
    )
    models["Decision Tree (Gini)"] = DecisionTreeClassifier(
        criterion="gini", max_depth=8, min_samples_split=20,
        min_samples_leaf=10, random_state=random_state, class_weight="balanced"
    )
    models["Decision Tree (Entropy)"] = DecisionTreeClassifier(
        criterion="entropy", max_depth=8, min_samples_split=20,
        min_samples_leaf=10, random_state=random_state, class_weight="balanced"
    )
    models["Random Forest"] = RandomForestClassifier(
        n_estimators=300, max_depth=12, oob_score=True,
        class_weight="balanced", n_jobs=-1, random_state=random_state
    )
    models["Naive Bayes (Gaussian)"] = GaussianNB(var_smoothing=1e-8)
    models["Naive Bayes (Bernoulli)"] = BernoulliNB(alpha=0.5)
    models["K-NN (k=7, Euclidean)"] = KNeighborsClassifier(
        n_neighbors=7, metric="euclidean", weights="distance", n_jobs=-1
    )
    models["K-NN (k=7, Manhattan)"] = KNeighborsClassifier(
        n_neighbors=7, metric="manhattan", weights="distance", n_jobs=-1
    )
    models["SVM (Linear)"] = CalibratedClassifierCV(
        SVC(kernel="linear", C=1.0, class_weight="balanced", random_state=random_state),
        method="sigmoid", cv=3
    )
    models["SVM (RBF)"] = CalibratedClassifierCV(
        SVC(kernel="rbf", C=1.0, gamma="scale", class_weight="balanced", random_state=random_state),
        method="sigmoid", cv=3
    )
    models["ANN (MLP)"] = MLPClassifier(
        hidden_layer_sizes=(128, 64), activation="relu", solver="adam",
        alpha=0.001, batch_size=256, learning_rate_init=0.001,
        max_iter=300, early_stopping=True, validation_fraction=0.1,
        n_iter_no_change=15, random_state=random_state,
    )
    try:
        from xgboost import XGBClassifier
        models["XGBoost"] = XGBClassifier(
            n_estimators=300, learning_rate=0.05, max_depth=6,
            subsample=0.8, colsample_bytree=0.8,
            scale_pos_weight=3, eval_metric="auc",
            use_label_encoder=False, random_state=random_state, n_jobs=-1,
        )
    except ImportError:
        log.warning("xgboost not installed -- skipping XGBoost.")

    try:
        from lightgbm import LGBMClassifier
        models["LightGBM"] = LGBMClassifier(
            n_estimators=300, learning_rate=0.05, num_leaves=63,
            subsample=0.8, colsample_bytree=0.8,
            class_weight="balanced", random_state=random_state, n_jobs=-1, verbose=-1,
        )
    except ImportError:
        log.warning("lightgbm not installed -- skipping LightGBM.")

    try:
        from catboost import CatBoostClassifier
        models["CatBoost"] = CatBoostClassifier(
            iterations=300, learning_rate=0.05, depth=6,
            auto_class_weights="Balanced", random_seed=random_state, verbose=0,
        )
    except ImportError:
        log.warning("catboost not installed -- skipping CatBoost.")

    return models


def build_ensemble_models(trained_models, random_state=42):
    """Build soft voting and stacking ensembles from trained base models."""
    ensembles = {}
    voting_candidates = [
        ("CatBoost", trained_models.get("CatBoost")),
        ("Random Forest", trained_models.get("Random Forest")),
        ("ANN (MLP)", trained_models.get("ANN (MLP)")),
    ]
    voting_candidates = [(k, v) for k, v in voting_candidates if v is not None]
    if len(voting_candidates) >= 2:
        ensembles["Soft Voting Ensemble"] = VotingClassifier(
            estimators=voting_candidates, voting="soft", weights=[0.4, 0.35, 0.25],
        )
    stacking_candidates = [
        ("LightGBM", trained_models.get("LightGBM")),
        ("Random Forest", trained_models.get("Random Forest")),
        ("SVM_RBF", trained_models.get("SVM (RBF)")),
    ]
    stacking_candidates = [(k, v) for k, v in stacking_candidates if v is not None]
    if len(stacking_candidates) >= 2:
        meta = LogisticRegression(max_iter=1000, random_state=random_state)
        ensembles["Stacking Classifier"] = StackingClassifier(
            estimators=stacking_candidates, final_estimator=meta,
            cv=5, passthrough=False, n_jobs=-1,
        )
    return ensembles


def export_shap_explainer(best_model, X_train, model_name):
    """Export SHAP explainer for the winning model."""
    try:
        import shap
        log.info("Building SHAP explainer for %s...", model_name)
        if hasattr(best_model, "feature_importances_"):
            explainer = shap.TreeExplainer(best_model)
        else:
            background = shap.kmeans(X_train, k=50)
            explainer = shap.KernelExplainer(best_model.predict_proba, background)
        sample_size = min(500, len(X_train))
        idx = np.random.choice(len(X_train), sample_size, replace=False)
        shap_values = explainer.shap_values(X_train[idx])
        save_path = SHAP_DIR / "shap_explainer.joblib"
        joblib.dump({"explainer": explainer, "model_name": model_name}, save_path)
        if isinstance(shap_values, list):
            sv = np.abs(shap_values[1]).mean(axis=0)
        else:
            sv = np.abs(shap_values).mean(axis=0)
        with open(SHAP_DIR / "global_importance.json", "w") as f:
            json.dump({"shap_mean_abs": sv.tolist()}, f, indent=2)
        log.info("SHAP explainer saved to %s", save_path)
    except ImportError:
        log.warning("shap not installed -- skipping SHAP export.")
    except Exception as e:
        log.warning("SHAP export failed: %s", e)


def run_tournament(X_train, X_val, X_test, y_train, y_val, y_test, random_state=42):
    """Train all models, evaluate on test set, return tournament results."""
    log.info("=" * 65)
    log.info("PHASE 3: MODEL TOURNAMENT")
    log.info("=" * 65)
    log.info("Train: %d | Val: %d | Test: %d", len(X_train), len(X_val), len(X_test))

    all_models = get_all_models(random_state)
    results = {}
    trained_models = {}

    for model_name, model in all_models.items():
        log.info("[%s] Training...", model_name)
        t_start = time.perf_counter()
        try:
            model.fit(X_train, y_train)
            train_time = round((time.perf_counter() - t_start), 2)
            y_pred, y_prob, inf_times = benchmark_inference(model, X_test)
            metrics = compute_metrics(y_test, y_pred, y_prob, model_name, inf_times)
            metrics["train_time_sec"] = train_time
            results[model_name] = metrics
            trained_models[model_name] = model
            safe_name = model_name.replace(" ", "_").replace("/", "_").replace("(", "").replace(")", "").replace(",", "")
            joblib.dump(model, MODELS_DIR / f"{safe_name}.joblib")
            log.info(
                "  [%s] ROC-AUC=%.4f | F1=%.4f | Recall=%.4f | Train=%.1fs",
                model_name, metrics["roc_auc"], metrics["f1_score"],
                metrics["recall_sensitivity"], train_time
            )
        except Exception as e:
            log.error("  [%s] FAILED: %s", model_name, e)
            results[model_name] = {"error": str(e)}

    log.info("Building ensemble models...")
    ensemble_models = build_ensemble_models(trained_models, random_state)
    for ens_name, ens_model in ensemble_models.items():
        log.info("[%s] Training ensemble...", ens_name)
        try:
            t0 = time.perf_counter()
            ens_model.fit(X_train, y_train)
            train_time = round(time.perf_counter() - t0, 2)
            y_pred, y_prob, inf_times = benchmark_inference(ens_model, X_test)
            metrics = compute_metrics(y_test, y_pred, y_prob, ens_name, inf_times)
            metrics["train_time_sec"] = train_time
            results[ens_name] = metrics
            trained_models[ens_name] = ens_model
            safe_name = ens_name.replace(" ", "_")
            joblib.dump(ens_model, MODELS_DIR / f"{safe_name}.joblib")
            log.info("  [%s] ROC-AUC=%.4f | F1=%.4f", ens_name, metrics["roc_auc"], metrics["f1_score"])
        except Exception as e:
            log.error("  [%s] FAILED: %s", ens_name, e)
            results[ens_name] = {"error": str(e)}

    valid_results = {k: v for k, v in results.items() if "error" not in v}
    best_model_name = max(valid_results, key=lambda k: valid_results[k].get("roc_auc", 0))
    best_model = trained_models.get(best_model_name)
    log.info("WINNER: %s (ROC-AUC=%.4f)", best_model_name, valid_results[best_model_name]["roc_auc"])

    if best_model is not None:
        export_shap_explainer(best_model, X_train, best_model_name)
        
        import os
        os.makedirs(MODELS_DIR, exist_ok=True)
        model_save_path = MODELS_DIR / "best_model.joblib"
        joblib.dump(best_model, model_save_path)
        log.info("Best model (%s) saved to %s", best_model_name, model_save_path)

    tournament_output = {
        "winner": best_model_name,
        "winner_metrics": valid_results[best_model_name],
        "models": results,
        "metadata": {
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "n_features": int(X_train.shape[1]),
            "random_state": random_state,
        }
    }

    results_path = MODELS_DIR.parent / "tournament_results.json"
    with open(results_path, "w") as f:
        json.dump(tournament_output, f, indent=2, default=str)
    log.info("Tournament results saved: %s", results_path)
    return tournament_output


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    import sys
    sys.path.insert(0, str(BASE_DIR / "src"))
    from ml.preprocessor import ChurnPreprocessor

    PROCESSED_DIR = BASE_DIR / "data" / "processed"
    data_path = PROCESSED_DIR / "master_telecom_churn.csv"

    if not data_path.exists():
        log.error("Run scripts/data_integration.py first.")
        raise FileNotFoundError(data_path)

    df = pd.read_csv(data_path)
    log.info("Loaded: %d rows x %d cols", *df.shape)

    pre = ChurnPreprocessor(
        scaler_type="standard",
        use_feature_selection=True,
        selection_method="mutual_info",
        n_features_to_select=20,
        use_smote=True,
    )
    X_train, X_val, X_test, y_train, y_val, y_test = pre.fit_transform_split(df)
    pre.save()

    results = run_tournament(X_train, X_val, X_test, y_train, y_val, y_test)

    print("\n" + "=" * 65)
    print("TOURNAMENT LEADERBOARD (sorted by ROC-AUC)")
    print("=" * 65)
    valid = {k: v for k, v in results["models"].items() if "error" not in v}
    sorted_models = sorted(valid.items(), key=lambda x: x[1].get("roc_auc", 0), reverse=True)
    print(f"{'Model':<35} {'ROC-AUC':>8} {'F1':>7} {'Recall':>8} {'Prec':>7} {'Acc':>7}")
    print("-" * 75)
    for name, m in sorted_models:
        print(
            f"{name:<35} {m['roc_auc']:>8.4f} {m['f1_score']:>7.4f} "
            f"{m['recall_sensitivity']:>8.4f} {m['precision']:>7.4f} {m['accuracy']:>7.4f}"
        )
    print(f"\nWINNER: {results['winner']}")