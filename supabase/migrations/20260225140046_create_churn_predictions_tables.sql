/*
  # Churn Prediction AI AI Database Schema

  ## Overview
  Creates tables for storing customer churn predictions and upload history.

  ## New Tables
  
  ### `predictions`
  Stores individual churn predictions with all input features and results
  - `id` (uuid, primary key)
  - `created_at` (timestamptz) - Timestamp of prediction
  - `gender` (text) - Customer gender
  - `contract_type` (text) - Contract type (Month-to-month, One year, Two year)
  - `internet_service` (text) - Internet service type
  - `tech_support` (text) - Whether customer has tech support
  - `payment_method` (text) - Payment method used
  - `tenure` (integer) - Number of months as customer
  - `monthly_charges` (numeric) - Monthly charges amount
  - `churn_probability` (numeric) - Predicted churn probability (0-1)
  - `risk_level` (text) - Risk classification (Low, Medium, High)
  
  ### `bulk_uploads`
  Tracks CSV upload history and batch predictions
  - `id` (uuid, primary key)
  - `created_at` (timestamptz) - Upload timestamp
  - `filename` (text) - Original filename
  - `total_records` (integer) - Number of records processed
  - `high_risk_count` (integer) - Count of high-risk predictions
  - `status` (text) - Processing status
  
  ## Security
  - Enable RLS on all tables
  - Public read access for demo purposes (can be restricted later)
*/

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  gender text NOT NULL,
  contract_type text NOT NULL,
  internet_service text NOT NULL,
  tech_support text NOT NULL,
  payment_method text NOT NULL,
  tenure integer NOT NULL,
  monthly_charges numeric NOT NULL,
  churn_probability numeric NOT NULL,
  risk_level text NOT NULL
);

-- Create bulk uploads table
CREATE TABLE IF NOT EXISTS bulk_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  filename text NOT NULL,
  total_records integer DEFAULT 0,
  high_risk_count integer DEFAULT 0,
  status text DEFAULT 'completed'
);

-- Enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo mode)
CREATE POLICY "Allow public read access to predictions"
  ON predictions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to predictions"
  ON predictions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read access to bulk uploads"
  ON bulk_uploads
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to bulk uploads"
  ON bulk_uploads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_level ON predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_bulk_uploads_created_at ON bulk_uploads(created_at DESC);