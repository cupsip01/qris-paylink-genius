
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UsageLimitService } from "@/utils/usageLimitService";
import { toast } from "sonner";
import { Trophy, Star, ArrowRight, Send } from "lucide-react";

export default function LimitReached() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState(`I want an unlimited package of 30 thousand`);
  const [phoneNumber, setPhoneNumber] = useState("621887013123");
  const [loading, setLoading] = useState(false);

  const handleRequestUnlimited = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await UsageLimitService.requestUnlimitedAccess(user.id);
      toast.success("Your request has been submitted to the admin");
      navigate("/");
    } catch (error) {
      console.error("Error requesting unlimited access:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContactViaWhatsApp = () => {
    // Format the WhatsApp URL with the message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Trophy className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Daily Limit Reached</h1>
            <p className="text-purple-100">
              You've used all 5 of your free daily generations.
            </p>
          </div>
          
          <div className="p-8">
            <div className="bg-purple-50 rounded-lg p-6 mb-8 border border-purple-100">
              <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Upgrade to Unlimited Access
              </h2>
              <p className="text-gray-700 mb-6">
                Get unlimited QRIS generations every day and never worry about limits again.
                Submit a request to our admin for approval.
              </p>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-purple-800">Rp 30.000</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <Button
                  onClick={handleRequestUnlimited}
                  disabled={loading || profile?.preferences?.pendingUnlimitedRequest}
                  className="flex items-center bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <>Processing...</>
                  ) : profile?.preferences?.pendingUnlimitedRequest ? (
                    <>Request Pending</>
                  ) : (
                    <>
                      Request Access
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold mb-4">Contact Admin Directly</h2>
              <p className="text-gray-600 mb-6">
                You can also contact our admin directly via WhatsApp to request unlimited access:
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin WhatsApp
                  </label>
                  <Input 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-gray-50"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleContactViaWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                  Contact via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
