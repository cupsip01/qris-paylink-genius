
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, Download, MessageSquare, User, CreditCard, Clock, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPayment, PaymentService } from '@/utils/paymentService';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentAmount from "@/components/payment/PaymentAmount";
import PaymentInfo from "@/components/payment/PaymentInfo";
import QRCodeDisplay from "@/components/payment/QRCodeDisplay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PaymentDetails = () => {
  const { id: paymentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paymentLink, setPaymentLink] = useState('');
  const [showDetails, setShowDetails] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'pending' | 'paid' }) => 
      PaymentService.updatePaymentStatus(id, status),
    onSuccess: () => {
      toast.success("Payment status updated");
    },
    onError: (error) => {
      toast.error("Failed to update payment status");
      console.error(error);
    }
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => PaymentService.deletePayment(id),
    onSuccess: () => {
      toast.success("Payment deleted successfully");
      navigate('/history');
    },
    onError: (error) => {
      toast.error("Failed to delete payment");
      console.error(error);
    }
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
    if (payment) {
      updateStatusMutation.mutate({ id: payment.id, status: 'paid' });
    }
  };

  const handleDeletePayment = () => {
    if (payment) {
      deletePaymentMutation.mutate(payment.id);
    }
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
        
        {/* Primary Action */}
        {payment.status === 'pending' ? (
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 rounded-full mt-2 mb-3"
            onClick={handleConfirmPayment}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? "Updating..." : "Konfirmasi Sudah Bayar"}
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

        {/* Additional Admin Actions */}
        <div className="grid grid-cols-2 gap-3 mb-20">
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this payment? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDeletePayment}
                  disabled={deletePaymentMutation.isPending}
                >
                  {deletePaymentMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button 
            variant="outline" 
            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={() => navigate(`/edit/${payment.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
