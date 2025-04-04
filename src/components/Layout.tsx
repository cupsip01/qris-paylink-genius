
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, Settings, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
}

const Layout = ({ 
  children, 
  showBackButton = false, 
  title,
  subtitle 
}: LayoutProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check current route
  const currentPath = location.pathname;
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 bg-white dark:bg-gray-900 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            {showBackButton && (
              <button 
                onClick={handleBack}
                className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            
            {title ? (
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
              </div>
            ) : (
              <img 
                src="/logokeuanganpay.webp" 
                alt="QRIS Logo" 
                className="h-8 w-auto" 
              />
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t z-10">
        <div className="container mx-auto flex justify-around items-center">
          <Link 
            to="/" 
            className={`flex-1 py-3 flex flex-col items-center ${
              currentPath === "/" ? "text-purple-600" : "text-gray-500"
            }`}
          >
            <Home size={22} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link 
            to="/history" 
            className={`flex-1 py-3 flex flex-col items-center ${
              currentPath === "/history" ? "text-purple-600" : "text-gray-500"
            }`}
          >
            <ClipboardList size={22} />
            <span className="text-xs mt-1">History</span>
          </Link>
          <Link 
            to="/settings" 
            className={`flex-1 py-3 flex flex-col items-center ${
              currentPath === "/settings" || currentPath.startsWith("/settings/") ? "text-purple-600" : "text-gray-500"
            }`}
          >
            <Settings size={22} />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
