
import { useState, useEffect } from 'react';
import { Payment } from '@/types/payment';
import { Button } from '@/components/ui/button';
import { Copy, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WhatsappLogo } from '@phosphor-icons/react';
import { SettingsService } from '@/utils/settingsService';
import QRCodeDisplay from './QRCodeDisplay';
import PaymentHeader from './PaymentHeader';
import PaymentAmount from './PaymentAmount';
import PaymentInfo from './PaymentInfo';

interface CustomerPaymentViewProps {
  payment: Payment;
}

export default function CustomerPaymentView({ payment }: CustomerPaymentViewProps) {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
    
    // Load WhatsApp settings
    async function loadWhatsAppSettings() {
      try {
        const settings = await SettingsService.getWhatsAppSettings();
        setWhatsappNumber(settings.whatsappNumber);
        setWhatsappMessage(settings.whatsappMessage);
      } catch (error) {
        console.error("Error loading WhatsApp settings", error);
      }
    }
    
    loadWhatsAppSettings();
  }, []);
  
  const copyToClipboard = () => {
    const paymentAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(payment.amount);
    
    const textToCopy = `QRIS Payment\nAmount: ${paymentAmount}\nID: ${payment.id}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Payment information has been copied",
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      });
  };
  
  const sharePayment = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QRIS Payment',
          text: `Please pay ${payment.formattedAmount} via QRIS`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard();
      toast({
        title: "URL copied",
        description: "Share link has been copied to clipboard",
      });
    }
  };
  
  const openWhatsApp = () => {
    if (!whatsappNumber) {
      toast({
        title: "WhatsApp not configured",
        description: "The administrator has not set up WhatsApp integration",
        variant: "destructive",
      });
      return;
    }
    
    const message = encodeURIComponent(
      `${whatsappMessage}\n\nPayment ID: ${payment.id}\nAmount: ${payment.formattedAmount}`
    );
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-md mx-auto">
      <PaymentHeader 
        merchantName={payment.merchantName} 
        qrisNmid={payment.qrisNmid}
        status={payment.status}
      />
      
      <div className="p-6">
        <PaymentAmount amount={payment.formattedAmount} />
        
        <div className="mt-4 flex justify-center">
          {/* QR Code Display */}
          <QRCodeDisplay qrisImageUrl={payment.qrImageUrl} />
        </div>
        
        <div className="mt-6 space-y-4">
          <PaymentInfo
            buyerName={payment.buyerName}
            bankSender={payment.bankSender}
            note={payment.note}
            id={payment.id}
            createdAt={payment.createdAt}
          />
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={copyToClipboard} 
              variant="outline"
              className="w-full flex items-center justify-center"
            >
              <Copy size={16} className="mr-2" />
              Copy Payment Info
            </Button>
            
            <Button 
              onClick={sharePayment} 
              variant="outline"
              className="w-full flex items-center justify-center"
            >
              <Share2 size={16} className="mr-2" />
              Share Payment
            </Button>
            
            {isClient && whatsappNumber && (
              <Button 
                onClick={openWhatsApp} 
                className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
              >
                <WhatsappLogo size={20} weight="fill" className="mr-2" />
                Confirm via WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
