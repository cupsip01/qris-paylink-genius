
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out",
      });
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-qris-red text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <img 
              src="/lovable-uploads/89669813-4cf6-4b05-ba0e-c2b29e252649.png" 
              alt="QRIS Logo" 
              className="h-10 w-auto" 
            />
            <span>QRIS PayLink Genius</span>
          </Link>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <User size={18} />
                <span className="text-sm">{user.email}</span>
              </div>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-red-700" 
                onClick={handleSignOut}
              >
                <LogOut size={18} className="mr-2" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        {children}
      </main>
      
      <footer className="bg-gray-100 border-t">
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
          <div className="container mx-auto flex justify-around items-center">
            <Link 
              to="/" 
              className={`flex-1 py-4 flex flex-col items-center ${
                location.pathname === "/" ? "text-qris-red" : "text-gray-500"
              }`}
            >
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link 
              to="/history" 
              className={`flex-1 py-4 flex flex-col items-center ${
                location.pathname === "/history" ? "text-qris-red" : "text-gray-500"
              }`}
            >
              <ClipboardList size={24} />
              <span className="text-xs mt-1">History</span>
            </Link>
          </div>
        </div>
        <div className="py-16"></div>
      </footer>
    </div>
  );
};

export default Layout;
