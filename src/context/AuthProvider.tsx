
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Profile } from '@/types/profiles';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    const profile = await fetchProfile(user.id);
    if (profile) {
      setProfile(profile);
      
      // Check if the user is an admin
      const isAdmin = profile.preferences?.isAdmin === true;
      setIsAdmin(isAdmin);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

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
        console.log('Auth state changed:', { event, email: session?.user?.email });
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch profile when user signs in
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            setProfile(profile);
            
            // Check if the user is an admin
            const isAdmin = profile.preferences?.isAdmin === true;
            setIsAdmin(isAdmin);
          }
        } else {
          setProfile(null);
          setIsAdmin(false);
        }

        if (event === 'SIGNED_IN') {
          console.log('User signed in successfully:', session?.user?.email);
          toast({
            title: 'Login berhasil',
            description: 'Selamat datang kembali!',
          });
          // Only redirect if we're on the auth page
          if (location.pathname.startsWith('/auth')) {
            console.log('Redirecting to home after sign in');
            navigate('/', { replace: true });
          }
        }

        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          toast({
            title: 'Logout berhasil',
            description: 'Sampai jumpa!',
          });
          navigate('/auth', { replace: true });
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for user:', session?.user?.email);
        }
      }
    );

    // Fetch current session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log('Initial session check:', {
        hasSession: !!initialSession,
        email: initialSession?.user?.email
      });
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      // Fetch profile for the initial session
      if (initialSession?.user) {
        const profile = await fetchProfile(initialSession.user.id);
        if (profile) {
          setProfile(profile);
          
          // Check if the user is an admin
          const isAdmin = profile.preferences?.isAdmin === true;
          setIsAdmin(isAdmin);
        }
      }

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
    profile,
    loading,
    isAdmin,
    signOut,
    updateProfile,
    refreshProfile,
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
