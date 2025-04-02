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
      
      // Get static QRIS from settings
      const { data: settings } = await supabase
        .from('settings')
        .select('qris_code')
        .single();
      
      if (!settings?.qris_code) {
        throw new Error("No default QRIS code found");
      }

      // Convert to dynamic QRIS with amount
      const dynamicQRIS = convertStaticToDynamicQRIS(
        settings.qris_code,
        payment.amount.toString()
      );

      // Generate QR code image
      const qrImageUrl = generateQRImageFromQRIS(dynamicQRIS);
      setQrisImageUrl(qrImageUrl);

    } catch (error) {
      console.error("Error generating dynamic QRIS:", error);
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
