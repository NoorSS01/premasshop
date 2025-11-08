import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kpyvndiqvwushuhwxvon.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtweXZuZGlxdnd1c2h1aHd4dm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODU0OTIsImV4cCI6MjA3ODE2MTQ5Mn0.TqoLz-r-XZpRvyWhBXyKKQjTrpSGX4bGwQHIM3kGTMs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

