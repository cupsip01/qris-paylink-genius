
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentAmount from "@/components/payment/PaymentAmount";
import PaymentInfo from "@/components/payment/PaymentInfo";
import QRCodeDisplay from "@/components/payment/QRCodeDisplay";
import { Payment } from "@/types/payment";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden mb-6 card-gradient">
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
            
            <div className="mt-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleWhatsAppConfirmation} 
                  className="w-full button-gradient text-lg py-6 rounded-xl shadow-md hover:shadow-lg"
                >
                  <MessageSquareText className="mr-2 h-5 w-5" />
                  Konfirmasi Sudah Bayar
                </Button>
              </motion.div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Klik tombol di atas untuk menghubungi admin via WhatsApp
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomerPaymentView;
