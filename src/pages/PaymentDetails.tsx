
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, Download, MessageSquare, User, CreditCard, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { getPayment } from '@/utils/paymentService';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentAmount from "@/components/payment/PaymentAmount";
import PaymentInfo from "@/components/payment/PaymentInfo";
import QRCodeDisplay from "@/components/payment/QRCodeDisplay";

const PaymentDetails = () => {
  const { id: paymentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paymentLink, setPaymentLink] = useState('');
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    if (paymentId) {
      setPaymentLink(`${window.location.origin}/payment/${paymentId}`);
    }
  }, [paymentId]);

  const { data: payment, isLoading, isError, error } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => getPayment(paymentId),
    enabled: !!paymentId,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    toast.success("Link copied to clipboard!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Details',
          text: `Payment of ${payment?.formattedAmount || 'unknown amount'}`,
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
    // This would typically download the QR code as an image
    toast.success("QR code download initiated");
    // Implementation would depend on how you want to handle the download
  };

  const handleConfirmPayment = () => {
    // Logic to handle payment confirmation
    toast.success("Payment confirmation sent");
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (isError) {
    console.error("Error fetching payment:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-500 p-4">
        <h1 className="text-xl font-bold mb-2">Error</h1>
        <p>Failed to load payment details. {error instanceof Error ? error.message : 'Unknown error.'}</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500 p-4">
        <h1 className="text-xl font-bold mb-2">Not Found</h1>
        <p>Payment not found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  // Calculate expiry time (just for display purposes)
  const expiryMinutes = 5; // Assume 5 minutes expiry
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Purple Header */}
      <PaymentHeader 
        merchantName={payment.merchantName}
        qrisNmid={payment.qrisNmid}
        expiresInMinutes={expiryMinutes}
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
        
        <div className="mt-3 mb-2 flex justify-center">
          <Button 
            variant="outline" 
            className="text-purple-600 border-purple-200 rounded-full text-sm"
            onClick={toggleDetails}
          >
            {showDetails ? "Hide details" : "Show details"}
          </Button>
        </div>
        
        {showDetails && (
          <div className="text-center text-sm text-gray-600 space-y-1 mb-4">
            <p>Merchant: <span className="font-medium">{payment.merchantName || "Jedo Store"}</span></p>
            <p>NMID: <span className="font-mono text-xs">{payment.qrisNmid || "ID10243136428"}</span></p>
            <p>Generated: <span>{payment.createdAt 
              ? format(new Date(payment.createdAt), "dd MMM yyyy HH:mm")
              : "N/A"}</span>
            </p>
          </div>
        )}
        
        {/* Primary Action */}
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700 rounded-full mt-2 mb-3"
          onClick={handleConfirmPayment}
        >
          Konfirmasi Sudah Bayar
        </Button>
        
        {/* Secondary Actions */}
        <div className="grid grid-cols-1 gap-3 mb-20">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleDownload}
          >
            Download Barcode
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleShare}
          >
            Share Link
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleCopyLink}
          >
            Copylink
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
