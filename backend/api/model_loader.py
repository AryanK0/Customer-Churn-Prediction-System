import sys
from pathlib import Path
import json
import logging
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Insert ml/src so we can import ml.preprocessor
ML_SRC_DIR = BASE_DIR / "ml" / "src"
if str(ML_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(ML_SRC_DIR))

from ml.preprocessor import ChurnPreprocessor

log = logging.getLogger(__name__)

MODELS_DIR = BASE_DIR / "ml" / "models" / "saved"
SHAP_DIR = BASE_DIR / "ml" / "models" / "shap"
TOURNAMENT_RESULTS = BASE_DIR / "ml" / "models" / "tournament_results.json"

MODEL_REGISTRY = {}
PREPROCESSOR = None
SHAP_EXPLAINER = None
GLOBAL_SHAP_IMPORTANCE = {}

def load_all_models():
    global MODEL_REGISTRY, PREPROCESSOR, SHAP_EXPLAINER, GLOBAL_SHAP_IMPORTANCE
    
    preprocessor_path = MODELS_DIR / "preprocessor.joblib"
    if not preprocessor_path.exists():
        raise FileNotFoundError(f"Preprocessor not found at: {preprocessor_path}")
        
    pre = ChurnPreprocessor()
    pre.load(preprocessor_path)
    PREPROCESSOR = pre
    log.info("Preprocessor loaded successfully.")
    
    best_model_path = MODELS_DIR / "best_model.joblib"
    if not best_model_path.exists():
        raise FileNotFoundError(f"Best model not found at: {best_model_path}")
    MODEL_REGISTRY["best_model"] = joblib.load(best_model_path)
    
    shap_path = SHAP_DIR / "shap_explainer.joblib"
    if not shap_path.exists():
        raise FileNotFoundError(f"SHAP explainer not found at: {shap_path}")
    shap_data = joblib.load(shap_path)
    SHAP_EXPLAINER = shap_data.get("explainer", shap_data)
    
    if TOURNAMENT_RESULTS.exists():
        with open(TOURNAMENT_RESULTS, "r") as f:
            MODEL_REGISTRY["tournament"] = json.load(f)
    else:
        raise FileNotFoundError(f"Tournament results not found at: {TOURNAMENT_RESULTS}")
        
    log.info("All models and explainers loaded successfully.")

def get_preprocessor():
    if PREPROCESSOR is None:
        raise RuntimeError("Preprocessor not loaded.")
    return PREPROCESSOR

def get_best_model():
    if "best_model" not in MODEL_REGISTRY:
        raise RuntimeError("Best model not loaded.")
    return MODEL_REGISTRY["best_model"]

def get_shap_explainer():
    if SHAP_EXPLAINER is None:
        raise RuntimeError("SHAP explainer not loaded.")
    return SHAP_EXPLAINER
    
def get_tournament_results():
    if "tournament" not in MODEL_REGISTRY:
        raise RuntimeError("Tournament results not loaded.")
    return MODEL_REGISTRY["tournament"]
