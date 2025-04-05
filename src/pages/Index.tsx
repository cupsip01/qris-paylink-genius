
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPayment, PaymentService } from "@/utils/paymentService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { Wallet, Upload, Scan, ArrowRight, QrCode } from "lucide-react";
import { SettingsService } from "@/utils/settingsService";

const Index = () => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [bankSender, setBankSender] = useState("");
  const [note, setNote] = useState("");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [processingQr, setProcessingQr] = useState(false);
  const [staticQrisContent, setStaticQrisContent] = useState<string | null>(null);
  const [merchantInfo, setMerchantInfo] = useState<any>(null);
  const [savedQrIsAvailable, setSavedQrIsAvailable] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  // Load saved QR from settings
  useEffect(() => {
    async function loadSavedQR() {
      try {
        setLoadingSettings(true);
        const settings = await SettingsService.getQRISSettings();
        
        if (settings.qrisImage && settings.qrisCode) {
          setSavedQrIsAvailable(true);
          // Set the static QR content from settings
          setStaticQrisContent(settings.qrisCode);
          
          // Try to parse merchant info if we have a QR code
          if (settings.qrisCode) {
            try {
              const merchantData = await PaymentService.parseQRWithOCR(settings.qrisImage);
              setMerchantInfo(merchantData.merchantInfo);
            } catch (error) {
              console.error("Error parsing saved QR:", error);
            }
          }
        } else {
          setSavedQrIsAvailable(false);
        }
      } catch (error) {
        console.error("Error loading saved QR:", error);
        setSavedQrIsAvailable(false);
      } finally {
        setLoadingSettings(false);
      }
    }
    
    loadSavedQR();
  }, []);

  const handleQrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const imageDataUrl = event.target.result as string;
        setQrImage(imageDataUrl);
        
        try {
          setProcessingQr(true);
          // Process QR image using OCR
          const result = await PaymentService.parseQRWithOCR(imageDataUrl);
          
          if (result.staticQrisContent) {
            setStaticQrisContent(result.staticQrisContent);
            setMerchantInfo(result.merchantInfo);
            toast.success("QR code successfully processed!");
          } else {
            toast.error("Could not extract QR code from image");
          }
        } catch (error) {
          console.error("Error processing QR code:", error);
          toast.error("Failed to process QR code image");
        } finally {
          setProcessingQr(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }
    
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    // Check if QR code is available (either uploaded or from settings)
    if (!staticQrisContent && !savedQrIsAvailable) {
      toast.error("Please upload a QR code first or set one in QRIS Settings");
      navigate("/settings/qris");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Creating payment with data:", { 
        amount: Number(amount), 
        buyer_name: name || undefined,
        bank_sender: bankSender || undefined,
        note: note || undefined,
        static_qris_content: staticQrisContent || undefined,
      });
      
      const payment = await createPayment({
        amount: Number(amount),
        buyer_name: name || undefined,
        bank_sender: bankSender || undefined,
        note: note || undefined,
        static_qris_content: staticQrisContent || undefined,
        ocr_result: qrImage || undefined
      });
      
      if (payment && payment.id) {
        toast.success("Payment created successfully!");
        console.log("Payment created, navigating to:", `/payment/${payment.id}`);
        navigate(`/payment/${payment.id}`);
      } else {
        throw new Error("Failed to create payment - no ID returned");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Failed to create payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto pt-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-4 rounded-full">
              <Wallet className="h-10 w-10 text-purple-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-purple-600 mb-1">
            Create New Payment
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Generate a QRIS code for your customer
          </p>
        </div>
        
        <form onSubmit={handleCreatePayment} className="space-y-6">
          {/* Only show QR upload if there's no saved QR in settings */}
          {!savedQrIsAvailable && !loadingSettings && (
            <div className="space-y-2">
              <Label htmlFor="qr-upload">QR Code Upload</Label>
              <div className="flex flex-col items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="qr-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQrImageUpload}
                />
                
                {qrImage ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-48 h-48 mb-2 border rounded-lg overflow-hidden">
                      <img
                        src={qrImage}
                        alt="Uploaded QR"
                        className="w-full h-full object-cover"
                      />
                      {processingQr && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    {staticQrisContent && (
                      <div className="text-center mb-4">
                        <p className="text-sm font-medium text-green-600">QR Code detected!</p>
                        {merchantInfo && merchantInfo.merchantName && (
                          <p className="text-sm text-gray-600">Merchant: {merchantInfo.merchantName}</p>
                        )}
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={triggerFileInput}
                      disabled={processingQr}
                      className="mb-4"
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center"
                    onClick={triggerFileInput}
                  >
                    <Upload className="h-6 w-6 mb-2 text-gray-500" />
                    <span>Upload Static QR Code</span>
                    <span className="text-xs text-gray-500 mt-1">or click to browse</span>
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* If there's a saved QR in settings, show this notice instead */}
          {savedQrIsAvailable && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <QrCode className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700">Using saved QRIS code</p>
                <p className="text-xs text-green-600">Your default QRIS code is set in settings</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                onClick={() => navigate('/settings/qris')}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Buyer Name (Optional)</Label>
            <Input
              id="name"
              placeholder="Masukan Nama Pembeli"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bank">Bank/Sender (Optional)</Label>
            <Input
              id="bank"
              placeholder="Masukan Nama Bank"
              value={bankSender}
              onChange={(e) => setBankSender(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Masukan Jumlah Nominal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Berikan catatan untuk transaksi ini"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={loading || processingQr || (loadingSettings)}
          >
            {loading ? "Processing..." : "Generate Payment"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Index;
