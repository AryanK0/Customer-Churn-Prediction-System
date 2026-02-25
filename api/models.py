"""
Shared prediction logic derived from Final, Benchmark, Test notebooks.
Each function approximates that notebook's model behavior for churn prediction.
"""


def _base_prob(data: dict) -> float:
    """Base probability from common risk factors."""
    p = 0.25
    if data.get("contractType") == "Month-to-month":
        p += 0.22
    if data.get("monthlyCharges", 0) > 70:
        p += 0.12
    if data.get("techSupport") == "No":
        p += 0.12
    if data.get("tenure", 0) < 12:
        p += 0.12
    if data.get("paymentMethod") == "Electronic check":
        p += 0.08
    if data.get("internetService") == "Fiber optic":
        p += 0.06
    if data.get("gender") == "Female":
        p += 0.02
    return min(p, 0.95)


def predict_final(data: dict) -> dict:
    """
    Final.ipynb - PyCaret Logistic Regression style.
    LR tends to be more conservative, linear combination.
    """
    p = _base_prob(data)
    p = p * 0.95  # LR slightly more conservative
    p = min(max(p, 0.05), 0.92)
    risk = "High" if p > 0.7 else "Medium" if p > 0.4 else "Low"
    drivers, suggestions = _risk_suggestions(data)
    return {
        "probability": round(p * 100),
        "riskLevel": risk,
        "riskDrivers": drivers,
        "suggestions": suggestions,
        "model": "final",
    }


def predict_benchmark(data: dict) -> dict:
    """
    Benchmark.ipynb - H2O AutoML ensemble style.
    H2O stacked ensembles tend to be more aggressive on edge cases.
    """
    p = _base_prob(data)
    p = p * 1.02  # Ensemble slightly more sensitive
    p = min(max(p, 0.03), 0.94)
    risk = "High" if p > 0.68 else "Medium" if p > 0.38 else "Low"
    drivers, suggestions = _risk_suggestions(data)
    return {
        "probability": round(p * 100),
        "riskLevel": risk,
        "riskDrivers": drivers,
        "suggestions": suggestions,
        "model": "benchmark",
    }


def predict_test(data: dict) -> dict:
    """
    Test.ipynb - XGBoost/LightGBM/CatBoost ensemble style.
    Tree models capture non-linear interactions.
    """
    p = _base_prob(data)
    # Tree-like: tenure and contract interact strongly
    if data.get("tenure", 0) < 6 and data.get("contractType") == "Month-to-month":
        p += 0.1
    if data.get("internetService") == "Fiber optic" and data.get("techSupport") == "No":
        p += 0.05
    p = min(max(p, 0.04), 0.93)
    risk = "High" if p > 0.65 else "Medium" if p > 0.35 else "Low"
    drivers, suggestions = _risk_suggestions(data)
    return {
        "probability": round(p * 100),
        "riskLevel": risk,
        "riskDrivers": drivers,
        "suggestions": suggestions,
        "model": "test",
    }


def _risk_suggestions(data: dict) -> tuple[list[str], list[str]]:
    drivers = []
    suggestions = []
    if data.get("contractType") == "Month-to-month":
        drivers.append("Month-to-month contract")
        suggestions.extend(["Offer loyalty discount", "Upgrade to annual plan"])
    if data.get("monthlyCharges", 0) > 70:
        drivers.append("High monthly charges")
        suggestions.append("Introduce value-added services")
    if data.get("techSupport") == "No":
        drivers.append("No tech support")
        suggestions.append("Provide priority support")
    if data.get("tenure", 0) < 12:
        drivers.append("Short tenure")
    return drivers, suggestions


def run_prediction(data: dict, model: str = "final") -> dict:
    """Route to the appropriate notebook model."""
    if model == "benchmark":
        return predict_benchmark(data)
    if model == "test":
        return predict_test(data)
    return predict_final(data)
