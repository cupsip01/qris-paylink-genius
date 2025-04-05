
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Auto redirect after countdown
    const timer = setTimeout(() => {
      navigateToSafePage();
    }, 5000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [location.pathname]);

  // Navigate to home if logged in, or auth page if not
  const navigateToSafePage = () => {
    if (user) {
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full"
      >
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-center">
            <AlertTriangle className="h-16 w-16 text-white opacity-90" />
          </div>
          <h1 className="text-3xl font-bold text-center mt-4">404</h1>
          <p className="text-center text-white/80 mt-1">Halaman Tidak Ditemukan</p>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 text-center mb-6">
            Maaf, sepertinya Anda mengakses halaman yang tidak tersedia atau URL yang salah.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={navigateToSafePage} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Home className="h-4 w-4 mr-2" /> 
              Kembali ke {user ? "Beranda" : "Login"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)} 
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> 
              Kembali ke Halaman Sebelumnya
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 text-center mt-6">
            Anda akan dialihkan otomatis dalam {countdown} detik...
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
