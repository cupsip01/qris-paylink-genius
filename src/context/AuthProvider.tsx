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
          const targetUrl = `https://pay.keuanganpribadi.web.id/auth/callback${hashPart}`;
          window.location.replace(targetUrl);
          return true;
        }
      }
      return false;
    };

    const handleHashFragment = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
        return true;
      }
      return false;
    };

    const wasRedirected = cleanupSupabaseUrl();
    const hadHash = handleHashFragment();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN') {
          console.log('User signed in, redirecting...');
          toast({
            title: 'Login berhasil',
            description: 'Selamat datang kembali!',
          });
          // Only redirect if we're on the auth page
          if (location.pathname.startsWith('/auth')) {
            navigate('/', { replace: true });
          }
        }

        if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting to auth...');
          toast({
            title: 'Logout berhasil',
            description: 'Sampai jumpa!',
          });
          navigate('/auth', { replace: true });
        }
      }
    );

    // Fetch current session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('Initial session check:', initialSession?.user?.email);
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);

      if ((wasRedirected || hadHash) && initialSession) {
        navigate('/', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

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
