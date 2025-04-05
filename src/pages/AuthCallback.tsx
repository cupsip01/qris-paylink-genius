import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Cek apakah ada hash di URL
        const hash = window.location.hash;
        if (!hash) {
          console.log('No hash found in URL');
          navigate('/auth');
          return;
        }

        // 2. Parse hash parameters
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');

        if (!accessToken) {
          console.log('No access token found in URL');
          navigate('/auth');
          return;
        }

        console.log('Setting session with tokens...');
        
        // 3. Set session dengan token yang diterima
        const { data: { session }, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });

        if (error) {
          console.error('Error setting session:', error);
          throw error;
        }

        if (session) {
          console.log('Session set successfully, user:', session.user?.email);
          // 4. Redirect ke home setelah session berhasil di-set
          navigate('/', { replace: true });
        } else {
          console.log('No session after setting tokens');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memproses autentikasi...</p>
        <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
} 