import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Coba dapatkan sesi dari URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          console.log('Got access token, setting session...');
          
          // 2. Set session dengan token yang diterima
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }

          if (session) {
            console.log('Session set successfully, redirecting to home...');
            navigate('/', { replace: true });
            return;
          }
        }

        // 3. Jika tidak ada token di URL, cek sesi yang ada
        console.log('No tokens in URL, checking existing session...');
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          console.log('Found existing session, redirecting to home...');
          navigate('/', { replace: true });
        } else {
          console.log('No session found, redirecting to auth...');
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memproses autentikasi...</p>
      </div>
    </div>
  );
} 