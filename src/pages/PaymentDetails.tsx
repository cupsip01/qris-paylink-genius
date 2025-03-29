
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { PaymentService } from "@/utils/paymentService";
import { Payment } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Download, Copy, Share2 } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const PaymentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const fetchedPayment = PaymentService.getPaymentById(id);
      if (fetchedPayment) {
        setPayment(fetchedPayment);
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qris-red" />
        </div>
      </Layout>
    );
  }

  if (!payment) {
    return <Navigate to="/not-found" replace />;
  }

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
      description: "The QR code image has been downloaded",
    });
  };

  const sharePayment = async () => {
    const baseUrl = window.location.origin;
    const paymentLink = `${baseUrl}/payment/${payment.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "QRIS Payment",
          text: `Payment of ${formatCurrency(payment.amount)}`,
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
    <Layout>
      <div className="max-w-md mx-auto py-6">
        <Card className="overflow-hidden">
          <div className="bg-qris-red text-white p-4 text-center">
            <h2 className="text-2xl font-bold">Payment Details</h2>
            <p className="opacity-90">
              Created {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
            </p>
          </div>
          
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="text-center mb-4">
                <span className="text-gray-500 text-sm">Amount</span>
                <p className="text-3xl font-bold">{formatCurrency(payment.amount)}</p>
              </div>
              
              {(payment.buyerName || payment.bankSender || payment.note) && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  {payment.buyerName && (
                    <p className="text-sm mb-1">
                      <span className="font-medium">Name:</span> {payment.buyerName}
                    </p>
                  )}
                  {payment.bankSender && (
                    <p className="text-sm mb-1">
                      <span className="font-medium">Sender:</span> {payment.bankSender}
                    </p>
                  )}
                  {payment.note && (
                    <p className="text-sm">
                      <span className="font-medium">Note:</span> {payment.note}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex justify-center mb-6">
                {payment.qrImageUrl && (
                  <div className="flex flex-col items-center bg-white p-4 border rounded-lg shadow-md">
                    {payment.useCustomQr && <div className="text-center mb-2 font-semibold">Jedo Store</div>}
                    <img 
                      src={payment.qrImageUrl} 
                      alt="QRIS Payment QR Code"
                      className="max-w-full"
                      style={{width: 'auto', height: 'auto', maxHeight: '400px'}}
                    />
                    {payment.useCustomQr && (
                      <div className="text-center mt-4 bg-gray-100 p-2 rounded">
                        <div className="font-bold mb-1">Bayar: {formatCurrency(payment.amount)}</div>
                        <div className="text-sm">Scan QR untuk membayar sesuai nominal</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
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
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentDetails;
