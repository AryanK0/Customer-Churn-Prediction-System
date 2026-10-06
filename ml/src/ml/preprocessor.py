"""
=============================================================================
PHASE 2: SYLLABUS-COMPLIANT PREPROCESSING PIPELINE
Customer Churn Prediction AI - Enterprise ML Platform
=============================================================================
Implements a strict, leak-free sklearn Pipeline / ColumnTransformer covering:
  - Data Cleaning (Median/Mode imputation)
  - Data Transformation (OHE, Yeo-Johnson, Log1p)
  - Dimensionality Reduction (MI Feature Selection, RFE, PCA)
  - Feature Scaling (StandardScaler vs MinMaxScaler)
  - Class Imbalance (SMOTE-NC / class_weight='balanced')
  - Stratified Train/Val/Test Split (70/15/15)

Usage:
  from src.ml.preprocessor import ChurnPreprocessor
  pre = ChurnPreprocessor()
  X_train, X_val, X_test, y_train, y_val, y_test = pre.fit_transform_split(df)
=============================================================================
"""

import json
import logging
import warnings
from pathlib import Path
from typing import Tuple, Dict, Any, Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import PCA
from sklearn.feature_selection import (
    SelectKBest,
    mutual_info_classif,
    RFE,
)
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    MinMaxScaler,
    OneHotEncoder,
    PowerTransformer,
    StandardScaler,
)

warnings.filterwarnings("ignore")

log = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models" / "saved"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# -- Feature Groups (canonical schema) ----------------------------------------
BINARY_FEATURES = [
    "gender", "senior_citizen", "partner", "dependents",
    "phone_service", "online_security", "device_protection",
    "tech_support", "streaming_tv", "streaming_movies", "paperless_billing",
]

CATEGORICAL_FEATURES = [
    "multiple_lines", "internet_service",
    "contract_type", "payment_method",
]

NUMERIC_FEATURES = [
    "tenure_months", "monthly_charges", "total_charges",
    "call_frequency_or_usage", "complaints_logged",
]

# Columns to drop before training (non-predictive metadata)
DROP_COLS = ["customer_id", "source_dataset"]
TARGET = "churn"

SKEWED_NUMERIC = ["monthly_charges", "total_charges", "call_frequency_or_usage"]


# =============================================================================
# PREPROCESSING PIPELINES
# =============================================================================

def build_numeric_pipeline(scaler_type: str = "standard") -> Pipeline:
    """
    Numeric pipeline:
      1. Median imputation
      2. Yeo-Johnson power transform (handles skewed distributions)
      3. StandardScaler or MinMaxScaler
    """
    scaler = StandardScaler() if scaler_type == "standard" else MinMaxScaler()
    return Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("power_transform", PowerTransformer(method="yeo-johnson", standardize=False)),
        ("scale", scaler),
    ])


def build_binary_pipeline() -> Pipeline:
    """Binary features: just impute with mode (already 0/1)."""
    return Pipeline([
        ("impute", SimpleImputer(strategy="most_frequent")),
    ])


def build_categorical_pipeline() -> Pipeline:
    """
    Categorical pipeline:
      1. Mode imputation
      2. One-Hot Encoding (handle_unknown='ignore' to prevent data leakage)
    """
    return Pipeline([
        ("impute", SimpleImputer(strategy="most_frequent")),
        ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])


def build_column_transformer(scaler_type: str = "standard") -> ColumnTransformer:
    """Combine all feature-group pipelines into a ColumnTransformer."""
    return ColumnTransformer(
        transformers=[
            ("num", build_numeric_pipeline(scaler_type), NUMERIC_FEATURES),
            ("bin", build_binary_pipeline(), BINARY_FEATURES),
            ("cat", build_categorical_pipeline(), CATEGORICAL_FEATURES),
        ],
        remainder="drop",
        verbose_feature_names_out=True,
    )


# =============================================================================
# MAIN PREPROCESSOR CLASS
# =============================================================================

class ChurnPreprocessor:
    """
    End-to-end preprocessing orchestrator.

    Steps:
      1. Drop non-predictive cols
      2. ColumnTransformer (impute + encode + scale)
      3. Optional: Feature Selection (MI / RFE)
      4. Optional: Dimensionality Reduction (PCA 95% variance)
      5. Class imbalance handling via SMOTE-NC or class_weight flag
      6. Stratified 70/15/15 split
    """

    def __init__(
        self,
        scaler_type: str = "standard",
        use_feature_selection: bool = True,
        selection_method: str = "mutual_info",  # 'mutual_info' | 'rfe'
        n_features_to_select: int = 20,
        use_pca: bool = False,
        pca_variance: float = 0.95,
        use_smote: bool = True,
        random_state: int = 42,
    ):
        self.scaler_type = scaler_type
        self.use_feature_selection = use_feature_selection
        self.selection_method = selection_method
        self.n_features_to_select = n_features_to_select
        self.use_pca = use_pca
        self.pca_variance = pca_variance
        self.use_smote = use_smote
        self.random_state = random_state

        self.col_transformer: Optional[ColumnTransformer] = None
        self.feature_selector = None
        self.pca_reducer: Optional[PCA] = None
        self.feature_names_out: list = []
        self.preprocessing_report: Dict[str, Any] = {}

    def _validate_and_clean(self, df: pd.DataFrame) -> pd.DataFrame:
        """Drop non-predictive columns and handle basic type corrections."""
        df = df.copy()
        for col in DROP_COLS:
            if col in df.columns:
                df.drop(columns=[col], inplace=True)
        # Ensure binary features are numeric
        for col in BINARY_FEATURES:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)
        # Ensure numeric features are float
        for col in NUMERIC_FEATURES:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        return df

    def fit_transform_split(
        self,
        df: pd.DataFrame,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray,
               np.ndarray, np.ndarray, np.ndarray]:
        """
        Full pipeline: clean -> split -> fit on train -> transform all.

        Returns:
            X_train, X_val, X_test, y_train, y_val, y_test
        """
        log.info("Starting preprocessing pipeline...")
        df = self._validate_and_clean(df)

        X = df.drop(columns=[TARGET])
        y = df[TARGET].astype(int).values

        # -- Stratified Split: 70 / 15 / 15 -----------------------------------
        X_train_val, X_test, y_train_val, y_test = train_test_split(
            X, y, test_size=0.15, stratify=y, random_state=self.random_state
        )
        # 15% of 85% remaining ˜ 17.6% ? yields ~15% of total
        val_ratio = 0.15 / 0.85
        X_train, X_val, y_train, y_val = train_test_split(
            X_train_val, y_train_val,
            test_size=val_ratio, stratify=y_train_val,
            random_state=self.random_state
        )
        log.info(
            "Split sizes -- Train: %d | Val: %d | Test: %d",
            len(X_train), len(X_val), len(X_test)
        )

        # -- ColumnTransformer: fit on train only ------------------------------
        self.col_transformer = build_column_transformer(self.scaler_type)
        X_train_t = self.col_transformer.fit_transform(X_train, y_train)
        X_val_t = self.col_transformer.transform(X_val)
        X_test_t = self.col_transformer.transform(X_test)

        # Get feature names after transformation
        try:
            self.feature_names_out = list(self.col_transformer.get_feature_names_out())
        except Exception:
            self.feature_names_out = [f"f_{i}" for i in range(X_train_t.shape[1])]

        log.info("ColumnTransformer output shape: %s", X_train_t.shape)

        # -- Feature Selection --------------------------------------------------
        if self.use_feature_selection:
            X_train_t, X_val_t, X_test_t = self._apply_feature_selection(
                X_train_t, y_train, X_val_t, X_test_t
            )

        # -- PCA Dimensionality Reduction ---------------------------------------
        if self.use_pca:
            X_train_t, X_val_t, X_test_t = self._apply_pca(
                X_train_t, X_val_t, X_test_t
            )

        # -- SMOTE-NC for class imbalance ---------------------------------------
        if self.use_smote:
            X_train_t, y_train = self._apply_smote(X_train_t, y_train)

        # Build preprocessing report
        self.preprocessing_report = {
            "train_size": int(len(X_train_t)),
            "val_size": int(len(X_val_t)),
            "test_size": int(len(X_test_t)),
            "features_after_transform": int(X_train_t.shape[1]),
            "scaler_type": self.scaler_type,
            "feature_selection": self.selection_method if self.use_feature_selection else None,
            "pca_applied": self.use_pca,
            "smote_applied": self.use_smote,
            "train_churn_rate": float(np.mean(y_train)),
            "val_churn_rate": float(np.mean(y_val)),
            "test_churn_rate": float(np.mean(y_test)),
        }

        log.info("Preprocessing complete. Output shape: %s", X_train_t.shape)
        return X_train_t, X_val_t, X_test_t, y_train, y_val, y_test

    def _apply_feature_selection(self, X_train, y_train, X_val, X_test):
        """Apply Mutual Information or RFE feature selection."""
        log.info("Applying feature selection: %s (top %d)...", self.selection_method, self.n_features_to_select)

        if self.selection_method == "mutual_info":
            self.feature_selector = SelectKBest(
                score_func=mutual_info_classif,
                k=min(self.n_features_to_select, X_train.shape[1])
            )
        elif self.selection_method == "rfe":
            base_estimator = LogisticRegression(
                max_iter=1000, random_state=self.random_state, class_weight="balanced"
            )
            self.feature_selector = RFE(
                estimator=base_estimator,
                n_features_to_select=min(self.n_features_to_select, X_train.shape[1]),
                step=0.1,
            )
        else:
            return X_train, X_val, X_test

        X_train_fs = self.feature_selector.fit_transform(X_train, y_train)
        X_val_fs = self.feature_selector.transform(X_val)
        X_test_fs = self.feature_selector.transform(X_test)
        log.info("Feature selection: %d -> %d features", X_train.shape[1], X_train_fs.shape[1])
        return X_train_fs, X_val_fs, X_test_fs

    def _apply_pca(self, X_train, X_val, X_test):
        """Apply PCA preserving pca_variance% of explained variance."""
        log.info("Applying PCA (%.0f%% variance retained)...", self.pca_variance * 100)
        self.pca_reducer = PCA(n_components=self.pca_variance, random_state=self.random_state)
        X_train_pca = self.pca_reducer.fit_transform(X_train)
        X_val_pca = self.pca_reducer.transform(X_val)
        X_test_pca = self.pca_reducer.transform(X_test)
        log.info(
            "PCA: %d -> %d components (%.2f%% variance explained)",
            X_train.shape[1], X_train_pca.shape[1],
            self.pca_reducer.explained_variance_ratio_.sum() * 100
        )
        return X_train_pca, X_val_pca, X_test_pca

    def _apply_smote(self, X_train, y_train):
        """Apply SMOTE-NC or plain SMOTE for class imbalance correction."""
        try:
            from imblearn.over_sampling import SMOTENC
            # Identify categorical feature indices in transformed array
            # After OHE, all features are numeric in the transformed space
            # Use plain SMOTE on fully numeric transformed data
            from imblearn.over_sampling import SMOTE
            smote = SMOTE(random_state=self.random_state, k_neighbors=5)
            X_resampled, y_resampled = smote.fit_resample(X_train, y_train)
            log.info(
                "SMOTE: %d -> %d samples | Churn rate: %.2f%% -> %.2f%%",
                len(X_train), len(X_resampled),
                np.mean(y_train) * 100, np.mean(y_resampled) * 100
            )
            return X_resampled, y_resampled
        except ImportError:
            log.warning("imbalanced-learn not installed; skipping SMOTE. Use class_weight='balanced' instead.")
            return X_train, y_train

    def save(self, path: Optional[Path] = None):
        """Persist the fitted preprocessor pipeline to disk."""
        save_path = path or (MODELS_DIR / "preprocessor.joblib")
        joblib.dump({
            "col_transformer": self.col_transformer,
            "feature_selector": self.feature_selector,
            "pca_reducer": self.pca_reducer,
            "feature_names_out": self.feature_names_out,
            "config": {
                "scaler_type": self.scaler_type,
                "use_feature_selection": self.use_feature_selection,
                "selection_method": self.selection_method,
                "n_features_to_select": self.n_features_to_select,
                "use_pca": self.use_pca,
            }
        }, save_path)
        log.info("Preprocessor saved to %s", save_path)

    def load(self, path: Optional[Path] = None):
        """Load a previously saved preprocessor from disk."""
        load_path = path or (MODELS_DIR / "preprocessor.joblib")
        data = joblib.load(load_path)
        self.col_transformer = data["col_transformer"]
        self.feature_selector = data["feature_selector"]
        self.pca_reducer = data["pca_reducer"]
        self.feature_names_out = data["feature_names_out"]
        log.info("Preprocessor loaded from %s", load_path)
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        """Transform new (inference) data using the fitted pipeline."""
        X = self._validate_and_clean(X.copy())
        if TARGET in X.columns:
            X = X.drop(columns=[TARGET])
        Xt = self.col_transformer.transform(X)
        if self.feature_selector is not None:
            Xt = self.feature_selector.transform(Xt)
        if self.pca_reducer is not None:
            Xt = self.pca_reducer.transform(Xt)
        return Xt

    def get_report(self) -> Dict:
        return self.preprocessing_report


# =============================================================================
# STANDALONE USAGE / TEST
# =============================================================================

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

    PROCESSED_DIR = BASE_DIR / "data" / "processed"
    data_path = PROCESSED_DIR / "master_telecom_churn.parquet"

    if not data_path.exists():
        log.error("Master dataset not found. Run scripts/data_integration.py first.")
        raise FileNotFoundError(data_path)

    df = pd.read_parquet(data_path)
    log.info("Loaded dataset: %d rows x %d cols", *df.shape)

    pre = ChurnPreprocessor(
        scaler_type="standard",
        use_feature_selection=True,
        selection_method="mutual_info",
        n_features_to_select=20,
        use_pca=False,
        use_smote=True,
    )
    X_train, X_val, X_test, y_train, y_val, y_test = pre.fit_transform_split(df)

    print("\n" + "=" * 60)
    print("PREPROCESSING REPORT")
    print("=" * 60)
    for k, v in pre.get_report().items():
        print(f"  {k:<35}: {v}")

    pre.save()
    print("\nPreprocessor saved to models/saved/preprocessor.joblib")

