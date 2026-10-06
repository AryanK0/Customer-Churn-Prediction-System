# 🎬 CCP - Customer Churn Prediction Platform

<div align="center">

![CCP Platform](https://img.shields.io/badge/CCP-Platform-E50914?style=for-the-badge&logo=robot)

A full-stack, enterprise-grade machine learning platform for predicting customer churn in telecom services. Featuring real-time predictions, bulk CSV processing, and comprehensive glassmorphism UI analytics.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](#) | [Documentation](START_HERE.md) | [API Docs](API_DOCUMENTATION.md)

</div>

---

## Features

- **Real-time Predictions**: Instant churn probability with detailed risk assessment.
- **Three ML Models**: Compare our Primary Ensemble (CatBoost), AutoML Benchmark (LightGBM), and Baseline (Logistic Regression).
- **Bulk CSV Upload**: Process thousands of customers at once.
- **Model Comparison**: Side-by-side performance metrics and interactive graphs.
- **Prediction History**: Track and analyze past predictions with row expansion for deep inspection.
- **Analytics Dashboard**: Feature importance (SHAP), churn patterns, and actionable insights.
- **Premium UI**: Modern glassmorphism design with responsive micro-animations.
- **Serverless Architecture**: Production-ready deployment.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast builds
- **TailwindCSS** for styling (Glassmorphism & animations)
- **React Router** for navigation
- **Lucide Icons** for UI elements

### Backend
- **FastAPI** for high-performance serverless API endpoints
- **CatBoost** for our primary gradient boosting ensemble
- **LightGBM** as our AutoML benchmark
- **Scikit-learn** for Logistic Regression baseline
- **Pandas & NumPy** for data processing

### Database & Infrastructure
- **Supabase** (PostgreSQL) for seamless history tracking
- **Vercel** for frontend hosting and serverless functions
- **GitHub** for version control

## Project Structure

```
CCP/
├── backend/                      # FastAPI serverless functions & ML inference
│   ├── api/
│   │   ├── main.py               # Main application entry point
│   │   ├── models.py             # Shared ML logic
│   │   ├── predict.py            # Unified prediction endpoint
│   │   └── upload.py             # Bulk CSV processing
├── frontend/                     # React frontend (Vite)
│   ├── public/
│   │   └── sample_template.csv   # Demo CSV for bulk upload
│   ├── src/
│   │   ├── components/           # Reusable UI elements
│   │   ├── pages/                # Route views (Dashboard, Analytics, etc.)
│   │   └── lib/                  # API clients and utilities
├── ml/                           # Data science and ML training pipelines
│   ├── data/                     # Raw and processed datasets
│   ├── models/                   # Serialized ML models (.joblib)
│   └── scripts/                  # Data integration and preprocessing scripts
├── scripts/                      # Project-level automation scripts
│   ├── run_all.ps1               # Dev server startup script
│   ├── setup.ps1                 # Windows environment setup
│   └── setup.sh                  # Unix environment setup
└── supabase/                     # Database migrations and configurations
```

## Model Comparison

| Model | Accuracy | ROC-AUC | Approach |
|-------|----------|---------|----------|
| **CatBoost** | 95.39% | 98.83% | Primary Gradient Boosting Ensemble |
| **LightGBM** | 94.10% | 97.80% | AutoML Benchmark |
| **Logistic Regression** | 80.30% | 84.50% | Statistical Baseline |

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Supabase account (free tier)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/AryanK0/ccp.git
cd ccp
```

2. **Environment Setup**
We provide automated scripts for setting up your environment:
- Windows: `.\scripts\setup.ps1`
- Unix: `./scripts/setup.sh`

*Alternatively, manually install dependencies:*
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
python -m venv venv
# Windows: venv\Scripts\activate | Unix: source venv/bin/activate
pip install -r requirements.txt
```

3. **Configure environment variables**
Create a `.env` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000
```

4. **Set up Supabase database**
Run the following SQL in your Supabase project:
```sql
CREATE TABLE predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  gender TEXT,
  senior_citizen INTEGER,
  partner TEXT,
  dependents TEXT,
  tenure INTEGER,
  phone_service TEXT,
  multiple_lines TEXT,
  internet_service TEXT,
  online_security TEXT,
  device_protection TEXT,
  tech_support TEXT,
  streaming_tv TEXT,
  streaming_movies TEXT,
  contract_type TEXT,
  paperless_billing TEXT,
  payment_method TEXT,
  monthly_charges NUMERIC,
  total_charges NUMERIC,
  churn_probability NUMERIC,
  risk_level TEXT
);
```

5. **Run the development servers**
Use the provided runner script (Windows):
```powershell
.\scripts\run_all.ps1
```
*Or manually:*
Terminal 1 (Frontend): `cd frontend && npm run dev`
Terminal 2 (Backend): `cd backend && uvicorn api.main:app --reload --port 8000`

## Usage Guide

### Single Prediction
Navigate to the **Predict** page, select an ML model architecture, fill in the customer's attributes, and click "Predict Churn". You will receive an instant probability score, risk tier, and key drivers.

### Bulk Upload
Go to the **Upload** page, download the `sample_template.csv` if needed, select your target model, and upload a dataset. The system will batch-process all customers and return a downloadable CSV with embedded risk predictions.

### Analytics & History
The **Analytics** dashboard provides dynamic SHAP feature importance charts, model performance comparisons, and churn heatmaps. The **History** view allows you to browse all past requests and expand rows for deep input inspections.

## License

MIT License - free to use for educational and commercial purposes.

---

Built with ❤️ using React, FastAPI, and Advanced ML Frameworks