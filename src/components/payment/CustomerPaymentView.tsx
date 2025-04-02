import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentAmount from "@/components/payment/PaymentAmount";
import PaymentInfo from "@/components/payment/PaymentInfo";
import QRCodeDisplay from "@/components/payment/QRCodeDisplay";
import { Payment } from "@/types/payment";
import { Card, CardContent } from "@/components/ui/card";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { convertStaticToDynamicQRIS, generateQRImageFromQRIS } from "@/utils/qrisUtils";
import { toast } from "@/components/ui/use-toast";

interface CustomerPaymentViewProps {
  payment: Payment;
}

const CustomerPaymentView = ({ payment }: CustomerPaymentViewProps) => {
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");
  const [qrisImageUrl, setQrisImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
      
      // Ambil kode QRIS dari settings
      const { data: settings } = await supabase
        .from('settings')
        .select('qris_code, qris_image')
        .single();
      
      if (!settings?.qris_code) {
        throw new Error("Belum ada QRIS yang diupload");
      }

      // Ubah versi dari statis ke dinamis
      const qrisWithoutCRC = settings.qris_code.slice(0, -4);
      const qrisModified = qrisWithoutCRC.replace("010211", "010212");
      
      // Split berdasarkan kode negara merchant
      const qrisParts = qrisModified.split("5802ID");
      
      // Tambahkan field nominal
      const amountStr = payment.amount.toString();
      const amountField = "54" + (amountStr.length < 10 ? "0" + amountStr.length : amountStr.length) + amountStr;
      
      // Gabungkan semua bagian
      const combinedField = amountField + "5802ID";
      const newQris = qrisParts[0] + combinedField + qrisParts[1];
      
      // Hitung CRC16
      let crc = 0xFFFF;
      for (let i = 0; i < newQris.length; i++) {
        crc ^= newQris.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        }
      }
      const crcHex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
      
      // QRIS final dengan CRC
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
        throw new Error("Gagal generate QR code");
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setQrisImageUrl(imageUrl);

    } catch (error) {
      console.error("Error generating dynamic QRIS:", error);
      toast({
        title: "Error",
        description: "Gagal membuat QRIS. Pastikan sudah mengupload QRIS di Settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppConfirmation = () => {
    const message = `${whatsAppMessage} ${payment.id}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <PaymentHeader createdAt={payment.createdAt} />
      
      <PaymentAmount amount={payment.amount} />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>QRIS Code</CardTitle>
          </div>
          <CardDescription>
            Scan this QR code to pay
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative">
            {isLoading ? (
              <div className="w-64 h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : qrisImageUrl ? (
              <img 
                src={qrisImageUrl}
                alt="QRIS Code"
                className="w-64 h-64 object-contain"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center">
                <p className="text-sm text-gray-500">Failed to load QR code</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Status</span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              payment.status === "paid" 
                ? "bg-green-100 text-green-700" 
                : "bg-amber-100 text-amber-700"
            }`}>
              {payment.status === "paid" ? "Paid" : "Pending"}
            </div>
          </div>
          
          {payment.buyerName && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Buyer Name</span>
              <span className="text-sm font-medium">{payment.buyerName}</span>
            </div>
          )}
          
          {payment.bankSender && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Bank/Sender</span>
              <span className="text-sm font-medium">{payment.bankSender}</span>
            </div>
          )}
          
          {payment.note && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Note</span>
              <span className="text-sm font-medium">{payment.note}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Created</span>
            <span className="text-sm font-medium">
              {format(new Date(payment.createdAt), "MMM d, yyyy h:mm a")}
            </span>
          </div>

          <Button
            onClick={handleWhatsAppConfirmation}
            className="w-full mt-4"
            variant="outline"
          >
            <MessageSquareText className="w-4 h-4 mr-2" />
            Confirm via WhatsApp
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerPaymentView;
