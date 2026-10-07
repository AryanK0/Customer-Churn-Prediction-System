---
title: CCP Backend
emoji: 🚀
colorFrom: blue
colorTo: red
sdk: gradio
app_file: app.py
pinned: false
---
# 🎬 CCP - Customer Churn Prediction Platform

<div align="center">

![CCP Platform](https://img.shields.io/badge/CCP-Platform-E50914?style=for-the-badge&logo=robot)

A full-stack, enterprise-grade machine learning platform for predicting customer churn in telecom services. Featuring real-time predictions, bulk CSV processing, and comprehensive glassmorphism UI analytics.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gradio](https://img.shields.io/badge/Gradio-API-FF7C00?style=flat&logo=gradio&logoColor=white)](https://gradio.app/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Frontend Demo](https://vercel.com/aryan230806-7319s-projects/churn_prediction) | [Hugging Face Space](https://huggingface.co/spaces/aryanK0/ccp-backend)

</div>

---

## 🌟 Features

- **Real-time Predictions**: Instant churn probability with detailed risk assessment.
- **Three ML Models**: Compare our Primary Ensemble (CatBoost), AutoML Benchmark (LightGBM), and Baseline (Logistic Regression).
- **Bulk CSV Upload**: Process thousands of customers at once.
- **Model Comparison**: Side-by-side performance metrics and interactive graphs.
- **Prediction History**: Track and analyze past predictions with row expansion for deep inspection.
- **Premium UI**: Modern glassmorphism design with responsive micro-animations.
- **ZeroGPU Compatible Architecture**: Our backend runs entirely on Hugging Face Spaces using a custom Gradio REST API architecture, effectively bypassing ZeroGPU port proxy restrictions.

## 💻 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast builds
- **TailwindCSS** for styling (Glassmorphism & animations)
- **@gradio/client** for seamless WebSockets & HTTP connections to the Hugging Face backend

### Backend
- **Gradio API** for high-performance ML serving
- **CatBoost** for our primary gradient boosting ensemble
- **LightGBM** as our AutoML benchmark
- **Scikit-learn** for Logistic Regression baseline
- **Pandas & NumPy** for data processing

### Databases & Infrastructure
- **Supabase** (PostgreSQL) for seamless history tracking
- **Vercel** for frontend hosting and serverless routing
- **Hugging Face Spaces** for GPU-accelerated backend model inference

## 📊 Datasets Used
The machine learning models have been trained on robust, real-world telecom data to ensure high generalizability:
- **IBM Telco Customer Churn**
- **Iranian Telecom Churn Dataset**
- **Orange Telecom Churn Dataset**

## 📂 Project Structure

```
CCP/
├── app.py                        # Gradio API entry point for Hugging Face
├── backend/                      # Backend AI logic
│   └── api/
│       ├── model_loader.py       # Serialized model unpickling
│       └── models.py             # ML prediction pipelines & logic
├── frontend/                     # React frontend (Vite)
│   ├── public/
│   │   └── sample_template.csv   # Demo CSV for bulk upload
│   └── src/
│       ├── components/           # Reusable UI elements
│       ├── pages/                # Route views (Dashboard, Analytics, etc.)
│       └── lib/                  # API clients (api.ts uses @gradio/client)
├── ml/                           # Data science and ML training pipelines
│   ├── data/                     # Raw and processed datasets
│   └── models/                   # Serialized ML models (.joblib)
└── supabase/                     # Database migrations and configurations
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/AryanK0/Customer-Churn-Prediction-System.git
cd Customer-Churn-Prediction-System
```

2. **Frontend Setup**
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:7860
```

3. **Backend Setup**
```bash
# From the project root directory
python -m venv venv
# Windows: venv\Scripts\activate | Unix: source venv/bin/activate
pip install -r requirements.txt
```

4. **Run the development servers**
Terminal 1 (Backend): `python app.py` (Runs the Gradio API on port 7860)
Terminal 2 (Frontend): `cd frontend && npm run dev`

## 📖 Usage Guide

### Single Prediction
Navigate to the **Predict** page, select an ML model architecture, fill in the customer's attributes, and click "Predict Churn". You will receive an instant probability score, risk tier, and key drivers.

### Bulk Upload
Go to the **Upload** page, download the `sample_template.csv` if needed, select your target model, and upload a dataset. The system will batch-process all customers and return a downloadable CSV with embedded risk predictions.

### Analytics & History
The **Analytics** dashboard provides dynamic model performance comparisons and churn heatmaps. The **History** view allows you to browse all past requests and expand rows for deep input inspections.

## 📄 License

MIT License - free to use for educational and commercial purposes.

---

<div align="center">
Built with ❤️ using React, Gradio, and Advanced ML Frameworks
</div>