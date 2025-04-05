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
    const cleanupSupabaseUrl = () => {
      const currentUrl = window.location.href;
      if (currentUrl.includes('supabase.co')) {
        const hashIndex = currentUrl.indexOf('#');
        if (hashIndex !== -1) {
          const hashPart = currentUrl.substring(hashIndex);
          const baseUrl = window.location.origin;
          const cleanUrl = `${baseUrl}/auth/callback${hashPart}`;
          window.location.replace(cleanUrl);
          return true;
        }
      }
      return false;
    };

    const handleHashFragment = () => {
      const hash = window.location.hash;
      if (hash.includes('access_token')) {
        // Clean up URL to remove hash
        window.history.replaceState(null, '', window.location.pathname);
        return true;
      }
      return false;
    };

    const wasRedirected = cleanupSupabaseUrl();
    const hadHash = handleHashFragment();

    // Fetch current session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);

      if ((wasRedirected || hadHash) && initialSession) {
        navigate('/', { replace: true });
      }
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN') {
          toast({
            title: 'Login berhasil',
            description: 'Selamat datang kembali!',
          });
          setTimeout(() => navigate('/'), 100);
        }

        if (event === 'SIGNED_OUT') {
          toast({
            title: 'Logout berhasil',
            description: 'Sampai jumpa!',
          });
          setTimeout(() => navigate('/auth'), 100);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
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
