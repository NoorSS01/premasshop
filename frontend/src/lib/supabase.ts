import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kpyvndiqvwushuhwxvon.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtweXZuZGlxdnd1c2h1aHd4dm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODU0OTIsImV4cCI6MjA3ODE2MTQ5Mn0.TqoLz-r-XZpRvyWhBXyKKQjTrpSGX4bGwQHIM3kGTMs';

// Create Supabase client with better configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('products').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
};

