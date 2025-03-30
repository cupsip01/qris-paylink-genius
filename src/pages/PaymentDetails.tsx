
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { PaymentService } from "@/utils/paymentService";
import { Payment } from "@/types/payment";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentAmount from "@/components/payment/PaymentAmount";
import PaymentInfo from "@/components/payment/PaymentInfo";
import QRCodeDisplay from "@/components/payment/QRCodeDisplay";
import PaymentActions from "@/components/payment/PaymentActions";

const PaymentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout>
      <div className="max-w-md mx-auto py-6">
        <Card className="overflow-hidden">
          <PaymentHeader createdAt={payment.createdAt} />
          
          <CardContent className="p-6">
            <div className="mb-6">
              <PaymentAmount amount={payment.amount} />
              
              <PaymentInfo 
                buyerName={payment.buyerName}
                bankSender={payment.bankSender}
                note={payment.note}
              />
              
              <QRCodeDisplay 
                qrImageUrl={payment.qrImageUrl}
                amount={payment.amount}
                qrisNmid={payment.qrisNmid}
                merchantName={payment.merchantName}
                qrisRequestDate={payment.qrisRequestDate}
              />
              
              <PaymentActions payment={payment} />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentDetails;
