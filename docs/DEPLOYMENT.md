# Deployment Guide - Churn Prediction AI

This guide walks you through deploying Churn Prediction AI to Vercel with Supabase.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Supabase account (free tier available)
- Git installed locally

## Step 1: Set Up Supabase

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and project name
   - Set database password (save it!)
   - Select region closest to your users

2. **Create the predictions table**
   - Go to SQL Editor in Supabase dashboard
   - Run this SQL:

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

-- Add index for faster queries
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX idx_predictions_risk_level ON predictions(risk_level);
```

3. **Get your Supabase credentials**
   - Go to Project Settings → API
   - Copy the "Project URL" (VITE_SUPABASE_URL)
   - Copy the "anon public" key (VITE_SUPABASE_ANON_KEY)

## Step 2: Push to GitHub

1. **Initialize git repository** (if not already done)
```bash
cd AI
git init
git add .
git commit -m "Initial commit: Churn Prediction AI platform"
```

2. **Create GitHub repository**
   - Go to [github.com/new](https://github.com/new)
   - Name: `churn-prediction-ai` (or your preferred name)
   - Make it public or private
   - Don't initialize with README (we already have one)

3. **Push to GitHub**
```bash
git remote add origin https://github.com/yourusername/churn-prediction-ai.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

1. **Import project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Vercel will auto-detect Vite + Python

2. **Configure build settings** (usually auto-detected)
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add environment variables**
   - In the "Environment Variables" section, add:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - Leave `VITE_API_URL` empty (Vercel uses relative paths)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `your-project.vercel.app`

## Step 4: Verify Deployment

1. **Test the frontend**
   - Visit your Vercel URL
   - Navigate through all pages
   - Check that UI loads correctly

2. **Test predictions**
   - Go to Predict page
   - Fill in customer details
   - Click "Predict Churn"
   - Verify results appear

3. **Test history**
   - Go to History page
   - Check if predictions are saved
   - Test filtering and search

4. **Test bulk upload**
   - Go to Upload page
   - Upload the `sample_template.csv`
   - Verify batch processing works

## Step 5: Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate provisioning

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify `requirements.txt` has all Python packages
- Check Vercel build logs for specific errors

### API Not Working
- Verify environment variables are set correctly
- Check that API files are in `/api` directory
- Ensure Python version is 3.10+ in Vercel settings

### Database Connection Issues
- Verify Supabase URL and key are correct
- Check that table exists with correct schema
- Ensure Supabase project is not paused

### Predictions Not Saving
- Check browser console for errors
- Verify Supabase credentials in environment variables
- Check Supabase logs for query errors

## Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Your changes will be live in 2-3 minutes!

## Monitoring

- **Vercel Dashboard**: View deployment logs, analytics, and errors
- **Supabase Dashboard**: Monitor database queries and performance
- **Browser DevTools**: Check for frontend errors

## Scaling Considerations

### Free Tier Limits
- Vercel: 100GB bandwidth/month, 100 serverless function executions/day
- Supabase: 500MB database, 2GB bandwidth/month

### Upgrading
- Vercel Pro: $20/month for unlimited bandwidth
- Supabase Pro: $25/month for 8GB database

## Security Best Practices

1. Never commit `.env` file to GitHub
2. Use environment variables for all secrets
3. Enable Row Level Security (RLS) in Supabase for production
4. Add rate limiting for API endpoints
5. Implement authentication for sensitive operations

## Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Check [Supabase Documentation](https://supabase.com/docs)
- Open an issue on GitHub

Happy deploying!
