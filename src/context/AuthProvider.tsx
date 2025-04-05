
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("Setting up auth provider");
    
    // Clean URL if it contains a Supabase URL
    const cleanupURLIfNeeded = () => {
      const currentUrl = window.location.href;
      if (currentUrl.includes('supabase.co')) {
        const hashIndex = currentUrl.indexOf('#');
        if (hashIndex !== -1) {
          // Get the access_token part
          const hashPart = currentUrl.substring(hashIndex);
          // Replace the entire URL with just your domain + hash fragment
          const baseUrl = window.location.origin;
          const cleanUrl = baseUrl + hashPart;
          
          // Replace URL without reloading page
          window.history.replaceState(null, '', cleanUrl);
          return true;
        }
      }
      return false;
    };
    
    // Handle hash fragment from OAuth redirects
    const handleHashFragment = () => {
      const hashFragment = window.location.hash;
      if (hashFragment && hashFragment.includes('access_token')) {
        // Remove the hash to clean up the URL without reloading the page
        window.history.replaceState(null, '', window.location.pathname);
        return true;
      }
      return false;
    };
    
    // First try to clean up a Supabase URL if we're on one
    const wasOnSupabaseUrl = cleanupURLIfNeeded();
    
    // Then check for and handle hash fragments
    const hadHashFragment = handleHashFragment();
    
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Redirect based on auth state
        if (event === 'SIGNED_IN') {
          console.log('User signed in, redirecting to home');
          toast({
            title: "Login berhasil",
            description: "Selamat datang kembali",
          });
          // Give a small delay to allow state to update
          setTimeout(() => navigate('/'), 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting to auth');
          toast({
            title: "Signed out",
            description: "You have been logged out",
          });
          setTimeout(() => navigate('/auth'), 100);
        }
      }
    );

    // Then check for an existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('Initial session check:', initialSession ? 'Found session' : 'No session');
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
      
      // If we cleaned up a URL or handled a hash fragment, and we have a session,
      // redirect to home page to ensure we're on the right URL
      if ((wasOnSupabaseUrl || hadHashFragment) && initialSession) {
        navigate('/', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    console.log('Signing out');
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
