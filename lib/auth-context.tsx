"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getTrialInfo, startTrial as startTrialHelper, type TrialInfo } from './trial';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPro: boolean;
  isProTrial: boolean;
  trialInfo: TrialInfo | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  usageCount: number;
  maxUsage: number;
  canGenerate: boolean;
  incrementUsage: () => void;
  checkSubscription: () => Promise<void>;
  startTrial: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_DAILY_LIMIT = 5;
const REGISTERED_MONTHLY_LIMIT = 10;
const USAGE_KEY = 'testcraft-monthly-usage';
const USAGE_DATE_KEY = 'testcraft-usage-month';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageCount, setUsageCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);

  // Check and reset monthly usage
  const checkMonthlyUsage = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const savedMonth = localStorage.getItem(USAGE_DATE_KEY);

    if (savedMonth !== currentMonth) {
      localStorage.setItem(USAGE_DATE_KEY, currentMonth);
      localStorage.setItem(USAGE_KEY, '0');
      setUsageCount(0);
    } else {
      const saved = localStorage.getItem(USAGE_KEY);
      setUsageCount(saved ? parseInt(saved) : 0);
    }
  };

  // Check subscription status
  const checkSubscription = useCallback(async () => {
    if (!user) {
      setIsPro(false);
      return;
    }

    try {
      const response = await fetch(`/api/subscription?userId=${user.id}`);
      const data = await response.json();
      setIsPro(data.isPro);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsPro(false);
    }
  }, [user]);

  useEffect(() => {
    // Get initial session
    const supabase = createClientComponentClient();

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

    // Check monthly usage
    checkMonthlyUsage();

    return () => subscription.unsubscribe();
  }, []);

  // Check subscription when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
      // También verificar trial
      const trial = getTrialInfo(user.id);
      setTrialInfo(trial);
    } else {
      setIsPro(false);
      setTrialInfo(null);
    }
  }, [user, checkSubscription]);

  // Check for successful payment on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Refresh subscription status
      setTimeout(() => {
        checkSubscription();
      }, 1000);
      // Clean URL
      window.history.replaceState({}, '', '/');
    }
  }, [user, checkSubscription]);

  const signInWithGoogle = async () => {
    const supabase = createClientComponentClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) console.error('Error signing in:', error);
  };

  const signOut = async () => {
    const supabase = createClientComponentClient();

    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    setIsPro(false);
  };

  const incrementUsage = () => {
    if (isPro || isProTrial) return; // Pro users and trial users don't have limits

    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem(USAGE_KEY, newCount.toString());
  };

  const startTrial = (): boolean => {
    if (!user) return false;

    const success = startTrialHelper(user.id);
    if (success) {
      const trial = getTrialInfo(user.id);
      setTrialInfo(trial);
    }
    return success;
  };

  // Determinar si el usuario tiene acceso a features Pro (vía trial o subscription)
  const isProTrial = trialInfo?.isActive ?? false;

  // Calculate limits based on plan
  const maxUsage = (isPro || isProTrial) ? Infinity : (user ? REGISTERED_MONTHLY_LIMIT : FREE_DAILY_LIMIT);
  const canGenerate = isPro || isProTrial || usageCount < maxUsage;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isPro,
      isProTrial,
      trialInfo,
      signInWithGoogle,
      signOut,
      usageCount,
      maxUsage,
      canGenerate,
      incrementUsage,
      checkSubscription,
      startTrial
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
