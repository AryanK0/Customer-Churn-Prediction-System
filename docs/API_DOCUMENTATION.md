# Churn Prediction AI - API Documentation

## Base URL

**Production**: `https://your-project.vercel.app/api`
**Local Development**: `http://localhost:8000/api`

## Authentication

Currently, the API is open (no authentication required). For production, consider adding API keys or OAuth.

## Endpoints

### 1. Health Check

**Endpoint**: `GET /api`

**Description**: Check if the API is running

**Response**:
```json
{
  "status": "ok",
  "message": "Churn Prediction AI API is running"
}
```

---

### 2. Final Model Prediction

**Endpoint**: `POST /api/final`

**Description**: Get churn prediction using PyCaret Logistic Regression model

**Request Body**:
```json
{
  "gender": "Male",
  "seniorCitizen": 0,
  "partner": "Yes",
  "dependents": "No",
  "tenure": 12,
  "phoneService": "Yes",
  "multipleLines": "No",
  "internetService": "Fiber optic",
  "onlineSecurity": "No",
  "deviceProtection": "No",
  "techSupport": "No",
  "streamingTV": "No",
  "streamingMovies": "No",
  "contractType": "Month-to-month",
  "paperlessBilling": "Yes",
  "paymentMethod": "Electronic check",
  "monthlyCharges": 70.5,
  "totalCharges": 846.0
}
```

**Response**:
```json
{
  "probability": 75,
  "riskLevel": "High",
  "riskDrivers": [
    "Month-to-month contract",
    "High monthly charges",
    "No tech support",
    "Short tenure"
  ],
  "suggestions": [
    "Offer loyalty discount",
    "Upgrade to annual plan",
    "Introduce value-added services",
    "Provide priority support"
  ],
  "model": "final"
}
```

---

### 3. Benchmark Model Prediction

**Endpoint**: `POST /api/benchmark`

**Description**: Get churn prediction using H2O AutoML ensemble model

**Request/Response**: Same as `/api/final` but with `"model": "benchmark"`

---

### 4. Test Model Prediction

**Endpoint**: `POST /api/test`

**Description**: Get churn prediction using XGBoost/LightGBM/CatBoost ensemble

**Request/Response**: Same as `/api/final` but with `"model": "test"`

---

### 5. Unified Prediction

**Endpoint**: `POST /api/predict`

**Description**: Get churn prediction with model selection

**Request Body**:
```json
{
  "model": "final",
  "data": {
    "gender": "Male",
    "seniorCitizen": 0,
    ...
  }
}
```

**Model Options**: `"final"`, `"benchmark"`, `"test"`

**Response**: Same as individual model endpoints

---

### 6. Bulk CSV Upload

**Endpoint**: `POST /api/upload`

**Description**: Process bulk predictions from CSV file

**Request**: `multipart/form-data`
- `file`: CSV file (required)
- `model`: Model selection - "final", "benchmark", or "test" (optional, defaults to "final")

**CSV Format**:
```csv
gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,MultipleLines,InternetService,OnlineSecurity,DeviceProtection,TechSupport,StreamingTV,StreamingMovies,Contract,PaperlessBilling,PaymentMethod,MonthlyCharges,TotalCharges
Male,0,Yes,No,12,Yes,No,Fiber optic,No,No,No,No,No,Month-to-month,Yes,Electronic check,70.5,846.0
```

**Response**:
```json
{
  "filename": "customers.csv",
  "totalRecords": 1000,
  "highRiskCount": 250,
  "mediumRiskCount": 400,
  "lowRiskCount": 350,
  "predictions": [
    {
      "probability": 75,
      "riskLevel": "High",
      "riskDrivers": [...],
      "suggestions": [...]
    },
    ...
  ]
}
```

---

## Field Specifications

### Input Fields

| Field | Type | Required | Options/Range | Description |
|-------|------|----------|---------------|-------------|
| `gender` | string | Yes | Male, Female | Customer gender |
| `seniorCitizen` | integer | Yes | 0, 1 | Is senior citizen (0=No, 1=Yes) |
| `partner` | string | Yes | Yes, No | Has partner |
| `dependents` | string | Yes | Yes, No | Has dependents |
| `tenure` | integer | Yes | 0-72 | Months with company |
| `phoneService` | string | Yes | Yes, No | Has phone service |
| `multipleLines` | string | Yes | Yes, No, No phone service | Has multiple lines |
| `internetService` | string | Yes | DSL, Fiber optic, No | Internet service type |
| `onlineSecurity` | string | Yes | Yes, No, No internet service | Has online security |
| `deviceProtection` | string | Yes | Yes, No, No internet service | Has device protection |
| `techSupport` | string | Yes | Yes, No, No internet service | Has tech support |
| `streamingTV` | string | Yes | Yes, No, No internet service | Has streaming TV |
| `streamingMovies` | string | Yes | Yes, No, No internet service | Has streaming movies |
| `contractType` | string | Yes | Month-to-month, One year, Two year | Contract type |
| `paperlessBilling` | string | Yes | Yes, No | Uses paperless billing |
| `paymentMethod` | string | Yes | Electronic check, Mailed check, Bank transfer (automatic), Credit card (automatic) | Payment method |
| `monthlyCharges` | number | Yes | 0-150 | Monthly charges in USD |
| `totalCharges` | number | Yes | 0-10000 | Total charges in USD |

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `probability` | integer | Churn probability (0-100) |
| `riskLevel` | string | Risk level: Low, Medium, High |
| `riskDrivers` | array | Top factors contributing to churn risk |
| `suggestions` | array | Recommended retention strategies |
| `model` | string | Model used: final, benchmark, test |

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input: missing required field 'tenure'"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "monthlyCharges"],
      "msg": "value is not a valid float",
      "type": "type_error.float"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Model inference failed"
}
```

## Rate Limits

**Vercel Free Tier**
- 100 serverless function invocations per day
- 10 second timeout per function
- 1024 MB memory per function

**Recommended**: Implement client-side rate limiting or upgrade to Vercel Pro

## CORS

The API allows requests from any origin. For production, configure CORS in FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)
```

## Examples

### cURL Example

```bash
curl -X POST https://your-project.vercel.app/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "model": "final",
    "data": {
      "gender": "Male",
      "seniorCitizen": 0,
      "partner": "Yes",
      "dependents": "No",
      "tenure": 12,
      "phoneService": "Yes",
      "multipleLines": "No",
      "internetService": "Fiber optic",
      "onlineSecurity": "No",
      "deviceProtection": "No",
      "techSupport": "No",
      "streamingTV": "No",
      "streamingMovies": "No",
      "contractType": "Month-to-month",
      "paperlessBilling": "Yes",
      "paymentMethod": "Electronic check",
      "monthlyCharges": 70.5,
      "totalCharges": 846.0
    }
  }'
```

### JavaScript Example

```javascript
const response = await fetch('https://your-project.vercel.app/api/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'final',
    data: {
      gender: 'Male',
      seniorCitizen: 0,
      partner: 'Yes',
      dependents: 'No',
      tenure: 12,
      phoneService: 'Yes',
      multipleLines: 'No',
      internetService: 'Fiber optic',
      onlineSecurity: 'No',
      deviceProtection: 'No',
      techSupport: 'No',
      streamingTV: 'No',
      streamingMovies: 'No',
      contractType: 'Month-to-month',
      paperlessBilling: 'Yes',
      paymentMethod: 'Electronic check',
      monthlyCharges: 70.5,
      totalCharges: 846.0,
    },
  }),
});

const result = await response.json();
console.log(result);
```

### Python Example

```python
import requests

url = "https://your-project.vercel.app/api/predict"
payload = {
    "model": "final",
    "data": {
        "gender": "Male",
        "seniorCitizen": 0,
        "partner": "Yes",
        "dependents": "No",
        "tenure": 12,
        "phoneService": "Yes",
        "multipleLines": "No",
        "internetService": "Fiber optic",
        "onlineSecurity": "No",
        "deviceProtection": "No",
        "techSupport": "No",
        "streamingTV": "No",
        "streamingMovies": "No",
        "contractType": "Month-to-month",
        "paperlessBilling": "Yes",
        "paymentMethod": "Electronic check",
        "monthlyCharges": 70.5,
        "totalCharges": 846.0
    }
}

response = requests.post(url, json=payload)
result = response.json()
print(result)
```

## Model Differences

### Final (PyCaret LR)
- **Best for**: Explainability and regulatory compliance
- **Speed**: Fastest (~50ms)
- **Accuracy**: 80.3%
- **Behavior**: Conservative, linear predictions

### Benchmark (H2O AutoML)
- **Best for**: Balanced accuracy and speed
- **Speed**: Medium (~100ms)
- **Accuracy**: 80.0%
- **Behavior**: Ensemble approach, robust

### Test (Ensemble)
- **Best for**: Maximum accuracy
- **Speed**: Slower (~150ms)
- **Accuracy**: 80.2%
- **Behavior**: Non-linear, captures interactions

## Support

For API issues or questions:
- Open an issue on GitHub
- Check the troubleshooting section in DEPLOYMENT.md
- Review Vercel function logs

## Changelog

### v1.0.0 (2026-02-26)
- Initial release
- Three ML model endpoints
- Unified prediction endpoint
- Bulk CSV upload
- Supabase integration
