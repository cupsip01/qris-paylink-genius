
import Auth from "@/components/Auth";
import { useAuth } from "@/context/AuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 to-indigo-700">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-xl border border-white/20">
          <div className="flex justify-center mb-8">
            <img 
              src="/logokeuanganpay.webp" 
              alt="QRIS Logo" 
              className="h-16 w-auto"
            />
          </div>
          <Auth />
        </div>
      </div>

      <footer className="py-4 backdrop-blur-sm bg-white/10 text-white">
        <div className="container mx-auto text-center text-sm">
          &copy; {new Date().getFullYear()} QRIS Keuangan Pribadi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
