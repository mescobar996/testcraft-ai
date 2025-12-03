"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  usageCount: number;
  maxUsage: number;
  canGenerate: boolean;
  incrementUsage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_DAILY_LIMIT = 5;
const USAGE_KEY = 'testcraft-daily-usage';
const USAGE_DATE_KEY = 'testcraft-usage-date';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageCount, setUsageCount] = useState(0);

  // Check and reset daily usage
  const checkDailyUsage = () => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem(USAGE_DATE_KEY);
    
    if (savedDate !== today) {
      // New day, reset usage
      localStorage.setItem(USAGE_DATE_KEY, today);
      localStorage.setItem(USAGE_KEY, '0');
      setUsageCount(0);
    } else {
      const saved = localStorage.getItem(USAGE_KEY);
      setUsageCount(saved ? parseInt(saved) : 0);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check daily usage
    checkDailyUsage();

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) console.error('Error signing in:', error);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem(USAGE_KEY, newCount.toString());
  };

  // Logged in users get more generations (or unlimited for premium - future)
  const maxUsage = user ? 20 : FREE_DAILY_LIMIT;
  const canGenerate = usageCount < maxUsage;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithGoogle,
      signOut,
      usageCount,
      maxUsage,
      canGenerate,
      incrementUsage
    }}>
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
