-- Churn Prediction AI AI - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Demographics
  gender TEXT,
  senior_citizen INTEGER,
  partner TEXT,
  dependents TEXT,
  
  -- Services
  tenure INTEGER,
  phone_service TEXT,
  multiple_lines TEXT,
  internet_service TEXT,
  online_security TEXT,
  device_protection TEXT,
  tech_support TEXT,
  streaming_tv TEXT,
  streaming_movies TEXT,
  
  -- Account
  contract_type TEXT,
  paperless_billing TEXT,
  payment_method TEXT,
  
  -- Financial
  monthly_charges NUMERIC,
  total_charges NUMERIC,
  
  -- Prediction Results
  churn_probability NUMERIC,
  risk_level TEXT,
  
  -- Metadata
  model_used TEXT DEFAULT 'final'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_level ON predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_predictions_contract_type ON predictions(contract_type);
CREATE INDEX IF NOT EXISTS idx_predictions_model ON predictions(model_used);

-- Add Row Level Security (RLS) - Optional but recommended for production
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for demo purposes)
-- For production, replace with authenticated user policies
CREATE POLICY "Allow anonymous inserts" ON predictions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anonymous reads (for demo purposes)
CREATE POLICY "Allow anonymous reads" ON predictions
  FOR SELECT
  TO anon
  USING (true);

-- Optional: Create a view for analytics
CREATE OR REPLACE VIEW prediction_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_predictions,
  AVG(churn_probability) as avg_churn_probability,
  COUNT(*) FILTER (WHERE risk_level = 'High') as high_risk_count,
  COUNT(*) FILTER (WHERE risk_level = 'Medium') as medium_risk_count,
  COUNT(*) FILTER (WHERE risk_level = 'Low') as low_risk_count,
  model_used
FROM predictions
GROUP BY DATE_TRUNC('day', created_at), model_used
ORDER BY date DESC;

-- Optional: Create a function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalCustomers', COUNT(*),
    'churnRate', ROUND(AVG(churn_probability) * 100),
    'highRiskCount', COUNT(*) FILTER (WHERE risk_level = 'High'),
    'retentionOpportunity', ROUND((COUNT(*) FILTER (WHERE risk_level = 'High')::NUMERIC / NULLIF(COUNT(*), 0)) * 100)
  )
  INTO result
  FROM predictions;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Churn Prediction AI AI database schema created successfully!';
  RAISE NOTICE 'Tables: predictions';
  RAISE NOTICE 'Indexes: 4 indexes created';
  RAISE NOTICE 'Views: prediction_analytics';
  RAISE NOTICE 'Functions: get_dashboard_stats()';
END $$;
