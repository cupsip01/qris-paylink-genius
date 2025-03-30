
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Copy, Share2 } from "lucide-react";
import { Payment } from "@/types/payment";

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
      <Button 
        onClick={downloadQR} 
        className="bg-qris-red hover:bg-red-700"
        disabled={!payment.qrImageUrl}
      >
        <Download className="mr-2 h-4 w-4" /> Download QR Code
      </Button>
      
      <Button 
        onClick={copyPaymentLink} 
        variant="outline"
      >
        <Copy className="mr-2 h-4 w-4" /> Copy Payment Link
      </Button>
      
      <Button 
        onClick={sharePayment} 
        variant="outline"
      >
        <Share2 className="mr-2 h-4 w-4" /> Share Payment
      </Button>
    </div>
  );
};

export default PaymentActions;
