import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'delivery';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false); // NEVER LOADING!

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If user doesn't exist in public.users table, create a basic profile
        if (error.code === 'PGRST116') {
          console.log('User not found in public.users, will be created by trigger');
          return null;
        }
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Network error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // SUPER SIMPLE - Just get session and set user, no waiting
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch profile in background if user exists
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile).catch(() => {
          console.log('Profile fetch failed, continuing without profile');
        });
      }
    }).catch(() => {
      console.log('Session fetch failed, continuing without auth');
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const profileData = await fetchProfile(data.user.id);
      setProfile(profileData);
      console.log(`Welcome back, ${profileData?.full_name || 'User'}!`);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: 'customer',
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch the profile created by the trigger
      try {
        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
        console.log(`Welcome to Prema's Shop, ${fullName}!`);
      } catch (profileError) {
        console.error('Error fetching profile after signup:', profileError);
        console.log('Account created successfully!');
      }
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
  };

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      setLoading(true);
      
      // Show sign out notification
      console.log('Signed out successfully!');
      
      // Clear state immediately
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Clear all possible localStorage keys
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Supabase sign out error:', error);
      }
      
      console.log('Sign out completed, redirecting...');
      
      // Force redirect after a short delay
      setTimeout(() => {
        window.location.replace('/');
      }, 1500);
      
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force sign out even if there's an error
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

