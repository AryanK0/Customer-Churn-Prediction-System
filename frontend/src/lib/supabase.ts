import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url-so-app-does-not-crash.supabase.co';
// The Supabase client strictly requires the anon key to be a valid JWT format (header.payload.signature)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.dummy_signature_that_wont_be_verified';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables! Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to see real data. Using placeholder values for now.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
