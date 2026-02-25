# ChurnFlix AI SaaS Dashboard

React (Vite) frontend + FastAPI backend, deployable to Vercel.

## Project Structure (Vercel-ready)

```
AI/
├── src/                    # React frontend (Vite) - at root for Vercel
│   ├── components/
│   ├── lib/
│   │   ├── api.ts          # API client → /api/*
│   │   └── supabase.ts
│   └── pages/
├── api/                    # FastAPI serverless (Vercel)
│   ├── __init__.py
│   ├── models.py           # Shared logic from Final, Benchmark, Test
│   ├── index.py            # GET /api (health)
│   ├── final.py            # POST /api/final  (Final.ipynb - PyCaret LR)
│   ├── benchmark.py        # POST /api/benchmark (Benchmark.ipynb - H2O)
│   ├── test.py             # POST /api/test (Test.ipynb - XGBoost/LGB/Cat)
│   ├── predict.py          # POST /api/predict (model: final|benchmark|test)
│   └── upload.py           # POST /api/upload (model: final|benchmark|test)
├── vercel.json             # Build & output config
├── requirements.txt
├── package.json
├── Final.ipynb
├── Benchmark.ipynb
└── Test.ipynb
```

## How Vercel Uses This

- **Frontend**: Root `package.json` → Vite build → `dist/` output
- **Backend**: `api/*.py` → Python serverless functions at `/api/*`
- **Same origin**: Frontend and API are on the same domain; no CORS issues

## Deploy to Vercel

1. Push to GitHub
2. [Import the project](https://vercel.com/new) and connect the repo
3. Vercel auto-detects Vite + Python
4. Add env vars in Project Settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

`VITE_API_URL` can stay empty (uses relative `/api` on Vercel).

## Local Development

```bash
# Terminal 1: Frontend
npm install && npm run dev

# Terminal 2: Backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn api.predict:app --reload --port 8000
uvicorn api.upload:app --reload --port 8000   # Or run both
```

Or use `vercel dev` for local full-stack:

```bash
npm i -g vercel
vercel dev
```

## Three Notebook APIs

Each notebook is exposed as its own FastAPI endpoint:

| Endpoint      | Notebook      | Model style                  |
|---------------|---------------|------------------------------|
| POST /api/final    | Final.ipynb   | PyCaret Logistic Regression  |
| POST /api/benchmark| Benchmark.ipynb| H2O AutoML ensemble         |
| POST /api/test     | Test.ipynb    | XGBoost/LightGBM/CatBoost   |

`/api/predict` and `/api/upload` accept `model: "final"|"benchmark"|"test"` in the body/form.

The frontend has a model selector on Predict and Upload pages.

## Replacing with Real Model Inference

1. In your notebooks, save trained models: `joblib.dump(model, "models/final.pkl")`
2. In `api/models.py`, load and call the real model instead of rule-based logic
3. Add the model file to the repo or fetch from storage at cold start
