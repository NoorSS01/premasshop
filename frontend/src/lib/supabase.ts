import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = 'https://kpyvndiqvwushuhwxvon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtweXZuZGlxdnd1c2h1aHd4dm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODU0OTIsImV4cCI6MjA3ODE2MTQ5Mn0.TqoLz-r-XZpRvyWhBXyKKQjTrpSGX4bGwQHIM3kGTMs';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

