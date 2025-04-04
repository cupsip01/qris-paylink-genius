
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qris-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-qris-red text-white p-4">
        <div className="container mx-auto flex justify-center items-center">
          <img 
            src="/logokeuanganpay.webp" 
            alt="QRIS Logo" 
            className="h-10 w-auto" 
          />
          <span className="text-2xl font-bold ml-2">QRIS Keuangan Pribadi</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Auth />
        </div>
      </div>

      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} QRIS Keuangan Pribadi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
