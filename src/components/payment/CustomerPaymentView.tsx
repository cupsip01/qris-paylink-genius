
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentAmount from "@/components/payment/PaymentAmount";
import PaymentInfo from "@/components/payment/PaymentInfo";
import QRCodeDisplay from "@/components/payment/QRCodeDisplay";
import { Payment } from "@/types/payment";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MessageSquareText, Settings } from "lucide-react";
import SettingsDialog from "./SettingsDialog";

interface CustomerPaymentViewProps {
  payment: Payment;
}

const CustomerPaymentView = ({ payment }: CustomerPaymentViewProps) => {
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");
  const [settingsOpen, setSettingsOpen] = useState(false);

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
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 text-center flex-1">
                  Klik tombol di atas untuk menghubungi admin via WhatsApp
                </p>
                <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <SettingsDialog 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </motion.div>
  );
};

export default CustomerPaymentView;
