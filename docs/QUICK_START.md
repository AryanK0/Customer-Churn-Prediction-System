# Churn Prediction AI - Quick Start Guide

Get up and running in 5 minutes!

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/churn-prediction-ai.git
cd churn-prediction-ai
```

## 2. Install Dependencies

### Option A: Automated Setup (Recommended)

**Windows (PowerShell)**:
```powershell
.\setup.ps1
```

**Linux/Mac**:
```bash
chmod +x setup.sh
./setup.sh
```

### Option B: Manual Setup

**Frontend**:
```bash
npm install
```

**Backend**:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Configure Environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get Supabase Credentials**:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free tier)
3. Go to Project Settings → API
4. Copy URL and anon key

## 4. Set Up Database

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run"

## 5. Start Development Server

### Option A: Full-stack with Vercel CLI (Recommended)
```bash
npm i -g vercel
vercel dev
```
Opens at `http://localhost:3000`

### Option B: Separate servers

**Terminal 1 (Frontend)**:
```bash
npm run dev
```
Opens at `http://localhost:5173`

**Terminal 2 (Backend - optional)**:
```bash
uvicorn api.predict:app --reload --port 8000
```
API at `http://localhost:8000`

## 6. Test the Application

1. Open browser to `http://localhost:3000` (or 5173)
2. Navigate to **Predict** page
3. Fill in customer details
4. Click "Predict Churn"
5. View results!

## 7. Deploy to Production

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Deploy to Vercel
# Go to vercel.com/new
# Import your GitHub repo
# Add environment variables
# Deploy!
```

## Common Issues

### "Missing Supabase environment variables"
- Make sure `.env` file exists
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
- Restart dev server after changing .env

### Dashboard shows 0 for all stats
- Make at least one prediction first
- Check browser console for errors
- Verify Supabase connection

### API not working
- Check if backend is running (if using separate servers)
- Verify API URL in .env
- Check browser network tab for errors

## Next Steps

- Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
- Read [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Read [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Need Help?

- Check [README.md](README.md) for detailed documentation
- Open an issue on GitHub
- Review Vercel and Supabase documentation

Happy coding! 🚀
