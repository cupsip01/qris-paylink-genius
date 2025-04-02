
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Copy, Share2 } from "lucide-react";
import { Payment } from "@/types/payment";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface PaymentActionsProps {
  payment: Payment;
}

const PaymentActions = ({ payment }: PaymentActionsProps) => {
  const { toast } = useToast();

  const copyPaymentLink = () => {
    const baseUrl = window.location.origin;
    const paymentLink = `${baseUrl}/payment/${payment.id}`;
    
    navigator.clipboard.writeText(paymentLink).then(() => {
      toast({
        title: "Link copied!",
        description: "Payment link has been copied to clipboard",
      });
    });
  };

  const downloadQR = () => {
    if (!payment.qrImageUrl) return;
    
    const link = document.createElement("a");
    link.href = payment.qrImageUrl;
    link.download = `qris-payment-${payment.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code downloaded",
      description: "The QR code with embedded amount has been downloaded",
    });
  };

  const sharePayment = async () => {
    const baseUrl = window.location.origin;
    const paymentLink = `${baseUrl}/payment/${payment.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "QRIS Payment",
          text: `Payment of ${payment.formattedAmount || payment.amount}`,
          url: paymentLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyPaymentLink();
    }
  };

  return (
    <div className="grid gap-3">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Button 
          onClick={downloadQR} 
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-300"
          disabled={!payment.qrImageUrl}
        >
          <Download className="mr-2 h-4 w-4" /> Download QR Code
        </Button>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Button 
          onClick={copyPaymentLink} 
          variant="outline"
          className="w-full border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/30"
        >
          <Copy className="mr-2 h-4 w-4 text-violet-600 dark:text-violet-400" /> Copy Payment Link
        </Button>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Button 
          onClick={sharePayment} 
          variant="outline"
          className="w-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
        >
          <Share2 className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Share Payment
        </Button>
      </motion.div>
    </div>
  );
};

export default PaymentActions;
