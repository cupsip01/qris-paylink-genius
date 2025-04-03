
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Copy, Share2, MessageSquare } from "lucide-react";
import { Payment } from "@/types/payment";

interface PaymentActionsProps {
  payment: Payment;
  adminWhatsApp?: string;
  whatsAppMessage?: string;
}

const PaymentActions = ({ payment, adminWhatsApp, whatsAppMessage }: PaymentActionsProps) => {
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

  const handleWhatsAppConfirmation = () => {
    if (!adminWhatsApp) return;
    
    const message = `${whatsAppMessage || "Halo admin, saya sudah transfer untuk pesanan"} ${payment.id}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-3 mt-4">
      <Button 
        onClick={handleWhatsAppConfirmation} 
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        <MessageSquare className="mr-2 h-4 w-4" /> Konfirmasi Sudah Bayar
      </Button>
      
      <Button 
        onClick={downloadQR} 
        variant="outline"
        className="w-full"
      >
        Download Barcode
      </Button>
      
      <Button 
        onClick={sharePayment} 
        variant="outline"
        className="w-full"
      >
        Share Link
      </Button>
      
      <Button 
        onClick={copyPaymentLink} 
        variant="outline"
        className="w-full"
      >
        Copylink
      </Button>
    </div>
  );
};

export default PaymentActions;
