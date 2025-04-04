
import Auth from "@/components/Auth";
import { useAuth } from "@/context/AuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AuthPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, don't redirect - we'll show sign out option
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
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
          {user ? (
            <div className="bg-white shadow-xl rounded-lg p-8 text-center">
              <div className="mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">You're Signed In</h2>
              <p className="text-gray-600 mb-6">
                Currently signed in as:<br />
                <span className="font-medium">{user.email}</span>
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="text-red-500 border-red-500 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <Auth />
          )}
        </div>
      </div>

      <footer className="bg-white shadow-inner py-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} QRIS Keuangan Pribadi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
