import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { getPayment } from '@/utils/paymentService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const PaymentDetails = () => {
  const { id: paymentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');

  useEffect(() => {
    if (paymentId) {
      setPaymentLink(`${window.location.origin}/payment/${paymentId}`);
    }
  }, [paymentId]);

  const { data: payment, isLoading, isError, error } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => getPayment(paymentId),
    enabled: !!paymentId, // Ensure paymentId is not undefined
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    console.error("Error fetching payment:", error);
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-red-500">
          <AlertCircle className="h-6 w-6 mr-2" />
          Failed to load payment details. {error instanceof Error ? error.message : 'Unknown error.'}
        </div>
      </Layout>
    );
  }

  if (!payment) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          <AlertCircle className="h-6 w-6 mr-2" />
          Payment not found.
        </div>
      </Layout>
    );
  }

  const formattedDate = payment.created_at
    ? format(new Date(payment.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })
    : 'N/A';

  return (
    <Layout title="Payment Details" showBackButton>
      <div className="container mx-auto p-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold mb-4">Payment ID: {payment.id}</h1>

          <div className="md:flex md:space-x-6">
            <div className="md:w-1/2">
              <div className="mb-4">
                <p className="text-gray-700">
                  Amount: <span className="font-semibold">Rp {payment.amount.toLocaleString('id-ID')}</span>
                </p>
                <p className="text-gray-700">
                  Status: <span className={`font-semibold ${payment.status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>{payment.status}</span>
                </p>
                <p className="text-gray-700">
                  Created At: <span className="font-medium">{formattedDate}</span>
                </p>
                {payment.buyer_name && (
                  <p className="text-gray-700">
                    Buyer Name: <span className="font-medium">{payment.buyer_name}</span>
                  </p>
                )}
                {payment.bank_sender && (
                  <p className="text-gray-700">
                    Bank Sender: <span className="font-medium">{payment.bank_sender}</span>
                  </p>
                )}
                {payment.note && (
                  <p className="text-gray-700">
                    Note: <span className="font-medium">{payment.note}</span>
                  </p>
                )}
              </div>

              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Payment Link</h2>
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={paymentLink}
                    readOnly
                    className="flex-grow mr-2"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    disabled={copied}
                  >
                    {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold mb-2">QR Code</h2>
              {paymentId && (
                <QRCode value={paymentLink} size={256} className="border rounded" />
              )}
              <p className="text-gray-500 mt-2">Scan this QR code to make payment</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentDetails;
