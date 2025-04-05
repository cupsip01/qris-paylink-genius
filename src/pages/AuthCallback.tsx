import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Fungsi untuk mengekstrak token dari URL
    const extractHashParameters = () => {
      const hash = window.location.hash.substring(1); // Hapus karakter # di awal
      return Object.fromEntries(
        hash.split('&').map(param => param.split('='))
      );
    };

    const handleCallback = async () => {
      try {
        // 1. Cek apakah ada hash parameters
        const params = extractHashParameters();
        if (params.access_token) {
          // 2. Set session secara manual jika perlu
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token || ''
          });

          if (error) throw error;

          if (session) {
            // 3. Redirect ke halaman utama
            console.log('Login berhasil, redirect ke home');
            navigate('/', { replace: true });
            return;
          }
        }

        // 4. Jika tidak ada token, coba dapatkan sesi yang ada
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/', { replace: true });
        } else {
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