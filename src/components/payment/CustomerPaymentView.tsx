
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentAmount from "@/components/payment/PaymentAmount";
import PaymentInfo from "@/components/payment/PaymentInfo";
import QRCodeDisplay from "@/components/payment/QRCodeDisplay";
import { Payment } from "@/types/payment";
import { Card, CardContent } from "@/components/ui/card";

interface CustomerPaymentViewProps {
  payment: Payment;
}

const CustomerPaymentView = ({ payment }: CustomerPaymentViewProps) => {
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");

  useEffect(() => {
    // Load WhatsApp settings
    const savedWhatsApp = localStorage.getItem('adminWhatsApp');
    const savedMessage = localStorage.getItem('whatsAppMessage');
    
    if (savedWhatsApp) setAdminWhatsApp(savedWhatsApp);
    if (savedMessage) setWhatsAppMessage(savedMessage);
  }, []);

  const handleWhatsAppConfirmation = () => {
    const message = `${whatsAppMessage} ${payment.id}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodedMessage}`, '_blank');
  };

  return (
    <Card className="overflow-hidden mb-6">
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
          
          <div className="mt-6">
            <Button 
              onClick={handleWhatsAppConfirmation} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Konfirmasi Sudah Bayar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerPaymentView;
