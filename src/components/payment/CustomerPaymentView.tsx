
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentAmount from "@/components/payment/PaymentAmount";
import PaymentInfo from "@/components/payment/PaymentInfo";
import QRCodeDisplay from "@/components/payment/QRCodeDisplay";
import PaymentActions from "@/components/payment/PaymentActions";
import { Payment } from "@/types/payment";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface CustomerPaymentViewProps {
  payment: Payment;
}

const CustomerPaymentView = ({ payment }: CustomerPaymentViewProps) => {
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");
  const [qrisImageUrl, setQrisImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [merchantInfo, setMerchantInfo] = useState({
    name: "Jedo Store",
    nmid: "ID10243136428"
  });

  useEffect(() => {
    loadSettings();
    generateDynamicQRIS();
  }, [payment]);

  const loadSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('settings')
        .select('qris_code, whatsapp_number, whatsapp_message')
        .single();
      
      if (settings) {
        if (settings.whatsapp_number) setAdminWhatsApp(settings.whatsapp_number);
        if (settings.whatsapp_message) setWhatsAppMessage(settings.whatsapp_message);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const generateDynamicQRIS = async () => {
    try {
      setIsLoading(true);
      
      // Get QRIS code from settings
      const { data: settings } = await supabase
        .from('settings')
        .select('qris_code, qris_image')
        .single();
      
      if (!settings?.qris_code) {
        throw new Error("No QRIS has been uploaded");
      }

      // Change from static to dynamic version
      const qrisWithoutCRC = settings.qris_code.slice(0, -4);
      const qrisModified = qrisWithoutCRC.replace("010211", "010212");
      
      // Split based on country code
      const qrisParts = qrisModified.split("5802ID");
      
      // Add amount field
      const amountStr = payment.amount.toString();
      const amountField = "54" + (amountStr.length < 10 ? "0" + amountStr.length : amountStr.length) + amountStr;
      
      // Combine all parts
      const combinedField = amountField + "5802ID";
      const newQris = qrisParts[0] + combinedField + qrisParts[1];
      
      // Calculate CRC16
      let crc = 0xFFFF;
      for (let i = 0; i < newQris.length; i++) {
        crc ^= newQris.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        }
      }
      const crcHex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
      
      // Final QRIS with CRC
      const dynamicQRIS = newQris + crcHex;

      // Generate QR code image
      const response = await fetch('https://api.qrserver.com/v1/create-qr-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(dynamicQRIS)}&size=300x300&margin=1&format=png`
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setQrisImageUrl(imageUrl);

    } catch (error) {
      console.error("Error generating dynamic QRIS:", error);
      toast.error("Failed to create QRIS. Make sure you've uploaded a QRIS in Settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-10">
      <PaymentHeader createdAt={payment.createdAt} expiresInMinutes={5} />
      
      <div className="p-4">
        <PaymentAmount amount={payment.amount} />
        
        <PaymentInfo 
          buyerName={payment.buyerName} 
          bankSender={payment.bankSender}
          note={payment.note}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isLoading ? (
            <div className="w-full h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              <QRCodeDisplay 
                qrImageUrl={qrisImageUrl} 
                amount={payment.amount}
                qrisNmid={merchantInfo.nmid}
                merchantName={merchantInfo.name}
              />
              <div className="text-center my-2">
                <button 
                  onClick={() => setShowDetails(!showDetails)} 
                  className="text-purple-600 text-sm font-medium"
                >
                  {showDetails ? "Hide details" : "Show details"}
                </button>
              </div>
              
              {showDetails && (
                <motion.div 
                  className="text-center text-sm text-gray-500 space-y-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p>Merchant: <span className="font-medium">{merchantInfo.name}</span></p>
                  <p>NMID: <span className="font-medium">{merchantInfo.nmid}</span></p>
                  <p>Generated: <span className="font-medium">{new Date().toLocaleString()}</span></p>
                </motion.div>
              )}
              
              <PaymentActions 
                payment={{...payment, qrImageUrl}} 
                adminWhatsApp={adminWhatsApp}
                whatsAppMessage={whatsAppMessage}
              />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerPaymentView;
