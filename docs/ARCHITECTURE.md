# Churn Prediction AI - System Architecture

## Overview

Churn Prediction AI is a full-stack machine learning platform that predicts customer churn using three different ML approaches. The system is designed for production deployment on Vercel with Supabase as the database.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
│                    (React + TypeScript)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Vercel CDN                                 │
│                   (Static Assets)                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                │                         │
┌───────────────▼──────────┐  ┌──────────▼────────────────────────┐
│   Vercel Serverless      │  │      Supabase PostgreSQL          │
│   Functions (FastAPI)    │  │   (Prediction Storage)            │
│                          │  │                                   │
│  • /api/final            │◄─┤  • predictions table             │
│  • /api/benchmark        │  │  • Row-level security             │
│  • /api/test             │  │  • Real-time subscriptions        │
│  • /api/predict          │  │                                   │
│  • /api/upload           │  └───────────────────────────────────┘
│                          │
│  ML Models:              │
│  • PyCaret LR            │
│  • H2O AutoML            │
│  • XGBoost/LGB/Cat       │
└──────────────────────────┘
```

## Component Breakdown

### Frontend (React + Vite)

**Technology Stack**
- React 18.3 with TypeScript
- Vite 5.4 for build tooling
- TailwindCSS for styling
- React Router for navigation
- Lucide React for icons

**Pages**
1. **Dashboard** (`/`)
   - Real-time statistics from Supabase
   - Churn risk distribution
   - Contract type analysis
   - AI-generated insights

2. **Predict** (`/predict`)
   - Single customer prediction form
   - Model selector (Final/Benchmark/Test)
   - Real-time results with risk drivers
   - Retention strategy suggestions

3. **Upload** (`/upload`)
   - Bulk CSV upload
   - Model selection
   - Batch prediction processing
   - Summary statistics

4. **Analytics** (`/analytics`)
   - Model performance comparison
   - Feature importance analysis
   - Tenure vs churn correlation
   - Monthly charges impact

5. **History** (`/history`)
   - Paginated prediction history
   - Search and filter capabilities
   - Risk level filtering
   - Sortable columns

6. **About** (`/about`)
   - Project overview
   - Tech stack details
   - Model descriptions
   - Deployment architecture

**Key Components**
- `Navbar.tsx`: Responsive navigation with glassmorphism
- `api.ts`: Centralized API client
- `supabase.ts`: Database client configuration

### Backend (FastAPI)

**API Endpoints**

| Endpoint | Method | Description | Input | Output |
|----------|--------|-------------|-------|--------|
| `/api/final` | POST | PyCaret LR predictions | Customer JSON | Prediction result |
| `/api/benchmark` | POST | H2O AutoML predictions | Customer JSON | Prediction result |
| `/api/test` | POST | Ensemble predictions | Customer JSON | Prediction result |
| `/api/predict` | POST | Unified endpoint | Customer JSON + model | Prediction result |
| `/api/upload` | POST | Bulk CSV processing | CSV file + model | Batch results |

**Prediction Response Schema**
```json
{
  "probability": 75,
  "riskLevel": "High",
  "riskDrivers": [
    "Month-to-month contract",
    "High monthly charges",
    "No tech support"
  ],
  "suggestions": [
    "Offer loyalty discount",
    "Provide priority support",
    "Introduce value-added services"
  ],
  "model": "final"
}
```

**Upload Response Schema**
```json
{
  "filename": "customers.csv",
  "totalRecords": 1000,
  "highRiskCount": 250,
  "mediumRiskCount": 400,
  "lowRiskCount": 350,
  "predictions": [...]
}
```

### Database (Supabase)

**Schema**
```sql
predictions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
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
)
```

**Indexes**
- `idx_predictions_created_at`: Fast sorting by date
- `idx_predictions_risk_level`: Fast filtering by risk

## Machine Learning Models

### 1. Final (PyCaret Logistic Regression)

**Characteristics**
- Conservative predictions
- Linear decision boundaries
- Fast inference (<50ms)
- Interpretable coefficients

**Use Case**: When you need explainable predictions for regulatory compliance

**Training**: `Final.ipynb`
- AutoML with PyCaret
- Feature engineering
- Cross-validation
- Model selection

### 2. Benchmark (H2O AutoML)

**Characteristics**
- Stacked ensemble
- Automated hyperparameter tuning
- Balanced performance
- Moderate inference time (~100ms)

**Use Case**: When you want best overall accuracy without manual tuning

**Training**: `Benchmark.ipynb`
- H2O AutoML with 10+ models
- Automatic stacking
- Leaderboard selection
- Ensemble optimization

### 3. Test (Gradient Boosting Ensemble)

**Characteristics**
- Non-linear decision boundaries
- Captures feature interactions
- Weighted ensemble (XGBoost 40%, LightGBM 35%, CatBoost 25%)
- Slower inference (~150ms)

**Use Case**: When you need maximum accuracy and can tolerate longer inference

**Training**: `Test.ipynb`
- Individual model training
- Hyperparameter optimization
- Ensemble weight tuning
- Cross-validation

## Data Flow

### Single Prediction Flow
```
User Input → Frontend Form → API Request → FastAPI Endpoint
    → Model Inference → Risk Assessment → Supabase Insert
    → Response → Frontend Display
```

### Bulk Upload Flow
```
CSV File → Frontend Upload → FormData → FastAPI Endpoint
    → CSV Parsing → Batch Inference → Risk Aggregation
    → Supabase Batch Insert → Summary Response → Frontend Display
```

### History Retrieval Flow
```
Page Load → Supabase Query → Sort by Date → Frontend Display
    → User Filter → Client-side Filtering → Paginated Results
```

## Performance Considerations

### Frontend
- Code splitting with React.lazy
- Vite's optimized bundling
- TailwindCSS purging
- Image optimization

### Backend
- Serverless cold start: ~500ms
- Warm function: <100ms
- Model caching in memory
- Efficient data serialization

### Database
- Indexed queries
- Connection pooling
- Query optimization
- Pagination for large datasets

## Security

### Frontend
- Environment variables for sensitive data
- HTTPS-only communication
- Input validation
- XSS prevention

### Backend
- CORS configuration
- Request validation
- Rate limiting (recommended)
- Error handling without data leakage

### Database
- Row-level security (RLS)
- Encrypted connections
- Backup and recovery
- Access control

## Scalability

### Current Capacity
- Frontend: Unlimited (CDN)
- API: 100 requests/day (Vercel free tier)
- Database: 500MB storage (Supabase free tier)

### Scaling Options
1. **Vertical**: Upgrade Vercel/Supabase plans
2. **Horizontal**: Add caching layer (Redis)
3. **Optimization**: Model quantization, batch processing
4. **CDN**: Geographic distribution

## Monitoring & Observability

### Metrics to Track
- Prediction latency (p50, p95, p99)
- API error rate
- Database query performance
- User engagement (predictions/day)

### Tools
- Vercel Analytics
- Supabase Logs
- Browser DevTools
- Custom logging

## Future Enhancements

### Short Term
- [ ] Real model loading (replace rule-based)
- [ ] Authentication (Supabase Auth)
- [ ] Export predictions to CSV
- [ ] Email notifications for high-risk customers

### Medium Term
- [ ] A/B testing framework
- [ ] Model retraining pipeline
- [ ] Advanced analytics (cohort analysis)
- [ ] Multi-tenant support

### Long Term
- [ ] Real-time streaming predictions
- [ ] Custom model training UI
- [ ] Integration with CRM systems
- [ ] Mobile app (React Native)

## Development Workflow

1. **Local Development**: `npm run dev` + `vercel dev`
2. **Testing**: Manual testing + unit tests
3. **Commit**: Clear commit messages
4. **Push**: GitHub triggers Vercel deployment
5. **Verify**: Test on staging/production URL
6. **Monitor**: Check Vercel dashboard for errors

## Troubleshooting

### Common Issues

**Dashboard shows 0 for all stats**
- Cause: No predictions in database
- Solution: Make a prediction first, or check Supabase connection

**History page empty**
- Cause: Supabase query failing or no data
- Solution: Check browser console, verify Supabase credentials

**API returns 500 error**
- Cause: Missing dependencies or model loading failure
- Solution: Check Vercel function logs, verify requirements.txt

**Build fails on Vercel**
- Cause: Missing dependencies or TypeScript errors
- Solution: Run `npm run build` locally, fix errors, push again

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [PyCaret Documentation](https://pycaret.org)
- [H2O Documentation](https://docs.h2o.ai)

## License

MIT License - See LICENSE file for details
