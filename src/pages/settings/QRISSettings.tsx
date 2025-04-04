
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const QRISSettings = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout title="QRIS Settings" subtitle="Configure your QRIS payment settings" showBackButton={true}>
      <div className="space-y-4 max-w-md mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="p-4 flex items-center gap-3">
            <div className="flex-1">
              <h2 className="text-lg font-medium">Account</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">QRIS Configuration</h2>
          {/* Content here */}
          <p className="text-gray-500">QRIS settings will be available soon.</p>
        </div>
      </div>
    </Layout>
  );
};

export default QRISSettings;
