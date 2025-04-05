import { useState, useEffect } from 'react';
import { Payment } from '@/types/payment';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';
import QRCodeDisplay from './QRCodeDisplay';
import PaymentHeader from './PaymentHeader';
import PaymentAmount from './PaymentAmount';
import PaymentInfo from './PaymentInfo';

interface CustomerPaymentViewProps {
  payment: Payment;
}

const CustomerPaymentView = ({ payment }: CustomerPaymentViewProps) => {
  const [paymentLink, setPaymentLink] = useState('');

  useEffect(() => {
    if (payment.id) {
      setPaymentLink(`${window.location.origin}/payment/${payment.id}`);
    }
  }, [payment.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    toast.success("Link copied to clipboard!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Details',
          text: `Payment of ${payment.formattedAmount || 'unknown amount'}`,
          url: paymentLink,
        });
        toast.success("Successfully shared!");
      } catch (err) {
        console.error('Error sharing:', err);
        toast.error("Couldn't share payment link");
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = () => {
    if (!payment.qrImageUrl) return;
    
    const link = document.createElement("a");
    link.href = payment.qrImageUrl;
    link.download = `qris-payment-${payment.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("QR Code downloaded");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Purple Header */}
      <PaymentHeader 
        merchantName={payment.merchantName}
        qrisNmid={payment.qrisNmid}
        expiresInMinutes={5}
        status={payment.status}
      />
      
      <div className="flex-1 px-4 py-5 flex flex-col">
        {/* Amount */}
        <PaymentAmount amount={payment.amount} />
        
        {/* Payment Info */}
        <PaymentInfo 
          buyerName={payment.buyerName}
          bankSender={payment.bankSender}
          note={payment.note}
          id={payment.id}
          createdAt={payment.createdAt}
        />
        
        {/* QR Code */}
        <QRCodeDisplay
          qrImageUrl={payment.qrImageUrl}
          merchantName={payment.merchantName}
          qrisNmid={payment.qrisNmid}
          qrisRequestDate={payment.createdAt}
          amount={payment.amount}
        />
        
        {/* Primary Action */}
        {payment.status === 'pending' ? (
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 rounded-full mt-2 mb-3"
            onClick={() => window.location.href = `https://wa.me/6281234567890?text=Saya sudah transfer untuk pembayaran ${payment.id}`}
          >
            Konfirmasi Sudah Bayar
          </Button>
        ) : (
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 rounded-full mt-2 mb-3"
            disabled
          >
            Pembayaran Selesai
          </Button>
        )}
        
        {/* Secondary Actions */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <Button 
            variant="outline" 
            className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700" 
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" /> Download Barcode
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700" 
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" /> Share Link
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700" 
            onClick={handleCopyLink}
          >
            <Copy className="mr-2 h-4 w-4" /> Copylink
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentView;
