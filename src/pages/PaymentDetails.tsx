
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentAmount from "@/components/payment/PaymentAmount";
import PaymentInfo from "@/components/payment/PaymentInfo";
import QRCodeDisplay from "@/components/payment/QRCodeDisplay";
import { Payment } from "@/types/payment";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MessageSquareText, Settings } from "lucide-react";
import SettingsDialog from "@/components/payment/SettingsDialog";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import CustomerPaymentView from "@/components/payment/CustomerPaymentView";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const PaymentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchPayment(id);
    }
  }, [id]);

  const fetchPayment = async (paymentId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Format for display in Indonesian Rupiah
        const formattedAmount = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(data.amount);

        const paymentData: Payment = {
          id: data.id,
          amount: data.amount,
          buyerName: data.buyer_name || "",
          bankSender: data.bank_sender || "",
          note: data.note || "",
          status: data.status || "pending",
          createdAt: data.created_at,
          qrImageUrl: data.dynamic_qris,
          formattedAmount
        };
        
        setPayment(paymentData);
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
      toast({
        title: "Error",
        description: "Failed to load payment details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Not Found</h1>
        <p className="text-gray-500 mb-6">The payment you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return <CustomerPaymentView payment={payment} />;
};

export default PaymentDetails;
