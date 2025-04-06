import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { UserService } from '@/utils/userService';
import { Profile } from '@/types/profiles';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  hasUnlimitedAccess: boolean;
  signOut: () => Promise<void>;
  loginAsAdmin: (username: string, password: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnlimitedAccess, setHasUnlimitedAccess] = useState(false);
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

    // Fetch current session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        // Fetch user profile
        UserService.getProfile(initialSession.user.id).then(userProfile => {
          setProfile(userProfile);
          setIsAdmin(!!userProfile?.is_admin);
          setHasUnlimitedAccess(!!userProfile?.unlimited_access);
          
          // Check for admin status in localStorage as a fallback
          const storedAdminStatus = localStorage.getItem('isAdmin') === 'true';
          if (storedAdminStatus) {
            setIsAdmin(true);
          }
        });
      }
      
      setLoading(false);

      if ((wasRedirected || hadHash) && initialSession) {
        navigate('/', { replace: true });
      }
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile when auth state changes
          const userProfile = await UserService.getProfile(session.user.id);
          setProfile(userProfile);
          setIsAdmin(!!userProfile?.is_admin);
          setHasUnlimitedAccess(!!userProfile?.unlimited_access);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setHasUnlimitedAccess(false);
        }

        if (event === 'SIGNED_IN') {
          toast({
            title: 'Login berhasil',
            description: 'Selamat datang kembali!',
          });
          // Only redirect if we're on the auth page
          if (location.pathname === '/auth') {
            navigate('/');
          }
        }

        if (event === 'SIGNED_OUT') {
          toast({
            title: 'Logout berhasil',
            description: 'Sampai jumpa!',
          });
          navigate('/auth');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  const signOut = async () => {
    localStorage.removeItem('isAdmin'); // Clear admin status on logout
    await supabase.auth.signOut();
  };
  
  const loginAsAdmin = async (username: string, password: string) => {
    try {
      const success = await UserService.loginAsAdmin(username, password);
      
      if (success) {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true'); // Store admin status
        
        toast({
          title: 'Admin login successful',
          description: 'Welcome to the admin dashboard',
        });
        navigate('/admin');
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in admin login:", error);
      return false;
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isAdmin,
    hasUnlimitedAccess,
    signOut,
    loginAsAdmin
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
