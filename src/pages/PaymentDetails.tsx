
import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { PaymentService } from "@/utils/paymentService";
import { Payment } from "@/types/payment";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import CustomerPaymentView from "@/components/payment/CustomerPaymentView";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";
import { MessageSquareText, ArrowLeft } from "lucide-react";

const PaymentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const fetchedPayment = await PaymentService.getPayment(id);
        
        if (fetchedPayment) {
          console.log("Fetched payment:", fetchedPayment);
          setPayment(fetchedPayment);
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
        toast.error("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };
    
    // Load WhatsApp settings
    const savedWhatsApp = localStorage.getItem('adminWhatsApp');
    const savedMessage = localStorage.getItem('whatsAppMessage');
    
    if (savedWhatsApp) setAdminWhatsApp(savedWhatsApp);
    if (savedMessage) setWhatsAppMessage(savedMessage);
    
    fetchPaymentDetails();
  }, [id]);

  const handleWhatsAppConfirmation = () => {
    if (payment) {
      const message = `${whatsAppMessage} ${payment.id}`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${adminWhatsApp}?text=${encodedMessage}`, '_blank');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600" />
        </div>
      </Layout>
    );
  }

  if (!payment) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-6 px-4">
        <Button 
          variant="ghost" 
          className="mb-4 -ml-2" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        
        <CustomerPaymentView payment={payment} />
        
        {!user && (
          <Card className="mt-4 bg-gray-50 border-dashed border-gray-300">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-4">
                If you've completed payment, please notify the admin:
              </p>
              <Button 
                onClick={handleWhatsAppConfirmation} 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageSquareText className="mr-2 h-4 w-4" />
                Notify via WhatsApp
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default PaymentDetails;
