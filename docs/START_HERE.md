# 🚀 START HERE - Churn Prediction AI

Welcome to Churn Prediction AI! This is your starting point.

## What is Churn Prediction AI?

A **production-ready** customer churn prediction platform featuring:
- 🤖 Three ML models (PyCaret, H2O, Ensemble)
- ⚡ Real-time predictions
- 📊 Comprehensive analytics
- 📁 Bulk CSV processing
- 🎨 Premium Netflix-inspired UI
- 🔒 Supabase database integration
- ☁️ Vercel serverless deployment

## Quick Navigation

### For First-Time Setup
👉 **[QUICK_START.md](QUICK_START.md)** - Get running in 5 minutes

### For Deployment
👉 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy to Vercel step-by-step

### For Understanding the System
👉 **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and data flow

### For API Integration
👉 **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference

### For Contributing
👉 **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute

### For GitHub Push
👉 **[GITHUB_READY.md](GITHUB_READY.md)** - Final checklist and push instructions

## 5-Minute Quick Start

```bash
# 1. Install dependencies
npm install
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Set up database
# Run supabase/schema.sql in Supabase SQL Editor

# 4. Start development server
npm run dev
# or
vercel dev
```

## Project Features

### Pages
1. **Dashboard** - Overview with real-time stats
2. **Predict** - Single customer prediction
3. **Upload** - Bulk CSV processing
4. **Analytics** - Model comparison and insights
5. **History** - Past predictions with filtering
6. **About** - Complete project documentation

### ML Models
1. **Final** - PyCaret Logistic Regression (80.3% accuracy)
2. **Benchmark** - H2O AutoML Ensemble (80.0% accuracy)
3. **Test** - XGBoost/LightGBM/CatBoost (80.2% accuracy)

## Ready to Push to GitHub?

```bash
git add .
git commit -m "Production-ready: Churn Prediction AI platform"
git push origin main
```

See **[GITHUB_READY.md](GITHUB_READY.md)** for detailed instructions!

---

*Built with ❤️ using React, FastAPI, and Machine Learning*
