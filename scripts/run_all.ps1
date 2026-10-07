# ==============================================================================
# RUN ALL PHASES - Customer Churn Prediction AI
# ==============================================================================
# Prerequisites:
#   pip install -r backend/requirements.txt
#
# Run from project root (c:\Users\FRIDAY\OneDrive\Desktop\CCP)
# ==============================================================================

Write-Host "=== PHASE 1: DATA INGESTION (KAGGLEHUB) ===" -ForegroundColor Cyan
python ml/scripts/data_integration.py

Write-Host "=== PHASE 2+3: MODEL TOURNAMENT ===" -ForegroundColor Cyan
python ml/src/ml/train_tournament.py

Write-Host "=== PHASE 3B: AUTOML BENCHMARK ===" -ForegroundColor Yellow
python ml/src/ml/automl_benchmark.py

Write-Host "=== PHASE 4: START API SERVER ==="
$env:PYTHONPATH = ".;.\backend"
cd .. # go to root directory where app.py is
python app.py
