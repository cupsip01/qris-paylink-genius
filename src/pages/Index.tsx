
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PaymentService } from "@/utils/paymentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  CreditCard, 
  Upload, 
  FileUp, 
  AlertCircle, 
  Settings as SettingsIcon,
  History,
  QrCode
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import SettingsDialog from "@/components/payment/SettingsDialog";

const Index = () => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [bankSender, setBankSender] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrisText, setQrisText] = useState("");
  const [activeTab, setActiveTab] = useState("create");
  const [uploadedQrImage, setUploadedQrImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");
  const [defaultQrImage, setDefaultQrImage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { user } = useAuth();

  // Load default QR and WhatsApp settings on component mount
  useEffect(() => {
    const savedQr = localStorage.getItem('defaultQrImage');
    const savedWhatsApp = localStorage.getItem('adminWhatsApp');
    const savedMessage = localStorage.getItem('whatsAppMessage');
    
    if (savedQr) setDefaultQrImage(savedQr);
    if (savedWhatsApp) setAdminWhatsApp(savedWhatsApp);
    if (savedMessage) setWhatsAppMessage(savedMessage);
  }, []);

  // Function to format input with thousand separators
  const formatAmountInput = (value: string) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format with thousand separators
    if (digits) {
      const number = parseInt(digits, 10);
      return number.toLocaleString('id-ID');
    }
    return '';
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatAmountInput(e.target.value);
    setAmount(formattedValue);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size should be less than 10MB');
      return;
    }
    
    // Create a URL for the image to display preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedQrImage(event.target.result as string);
        // Save as default if we're in settings
        if (settingsOpen) {
          setDefaultQrImage(event.target.result as string);
          localStorage.setItem('defaultQrImage', event.target.result as string);
          toast.success("Default QR code has been saved");
        } else {
          toast("QR Image uploaded successfully", {
            description: "You can now proceed with the payment"
          });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDefaultQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setDefaultQrImage(event.target.result as string);
        localStorage.setItem('defaultQrImage', event.target.result as string);
        toast.success("Default QR code has been saved");
      }
    };
    reader.readAsDataURL(file);
  };

  const saveWhatsAppSettings = () => {
    localStorage.setItem('adminWhatsApp', adminWhatsApp);
    localStorage.setItem('whatsAppMessage', whatsAppMessage);
    toast.success("WhatsApp settings saved successfully");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert formatted amount to number
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      uiToast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const payment = await PaymentService.createPayment(
        numericAmount,
        note,
        buyerName,
        bankSender,
        true // Always use the custom QRIS
      );
      
      uiToast({
        title: "Payment created",
        description: "Your QRIS payment has been generated",
      });
      
      navigate(`/payment/${payment.id}`);
    } catch (error) {
      console.error("Error creating payment:", error);
      uiToast({
        title: "Error",
        description: "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processUploadedQris = async () => {
    if (!qrisText && !uploadedQrImage && !defaultQrImage) {
      uiToast({
        title: "Missing information",
        description: "Please upload a QR image or enter QRIS text",
        variant: "destructive",
      });
      return;
    }
    
    // Convert formatted amount to number
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      uiToast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // If we have QRIS text, use it, otherwise use default
      const qrisToUse = qrisText || "00020101021126570011ID.DANA.WWW011893600915359884425702095988442570303UMI51440014ID.CO.QRIS.WWW0215ID10243136428100303UMI5204594553033605802ID5910Jedo Store6010Kab. Bogor61051682063049B94";
      
      const payment = await PaymentService.createPayment(
        numericAmount,
        note || "Uploaded QRIS payment",
        buyerName || "QR Uploader",
        bankSender,
        true 
      );
      
      uiToast({
        title: "Payment created",
        description: "Your QRIS payment has been generated",
      });
      
      navigate(`/payment/${payment.id}`);
    } catch (error) {
      console.error("Error processing QRIS:", error);
      uiToast({
        title: "Error",
        description: "Failed to process QRIS. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create New Payment</TabsTrigger>
          <TabsTrigger value="upload">Upload QRIS Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Create New Payment
              </CardTitle>
              <CardDescription className="text-center">
                Generate a QRIS code for your customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Rp)</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="amount"
                      placeholder="100.000"
                      value={amount}
                      onChange={handleAmountChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buyerName">Buyer Name (Optional)</Label>
                  <Input
                    id="buyerName"
                    placeholder="John Doe"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bankSender">Bank/Sender (Optional)</Label>
                  <Input
                    id="bankSender"
                    placeholder="BCA - Andi"
                    value={bankSender}
                    onChange={(e) => setBankSender(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Add any additional notes here..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-qris-red hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Payment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Upload QRIS Code
              </CardTitle>
              <CardDescription className="text-center">
                Upload your static QRIS code and convert it to dynamic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className={`border-2 border-dashed ${uploadError ? 'border-red-300' : 'border-gray-300'} rounded-lg p-6 text-center relative overflow-hidden`}
                  style={{minHeight: '150px'}}
                >
                  {uploadedQrImage || defaultQrImage ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={uploadedQrImage || defaultQrImage} 
                        alt="Uploaded QR" 
                        className="max-h-40 object-contain mb-2" 
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setUploadedQrImage(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <Label htmlFor="qris-file" className="cursor-pointer text-blue-600 hover:text-blue-800 block">
                          Upload QRIS image
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </>
                  )}
                  
                  <Input
                    id="qris-file"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
                
                {uploadError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="qris-text">QRIS Code Text</Label>
                  <Textarea
                    id="qris-text"
                    placeholder="Paste your QRIS code text here..."
                    value={qrisText}
                    onChange={(e) => setQrisText(e.target.value)}
                    className="h-24"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="upload-amount">Amount (Rp)</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="upload-amount"
                      placeholder="100.000"
                      value={amount}
                      onChange={handleAmountChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-note">Note (Optional)</Label>
                  <Textarea
                    id="upload-note"
                    placeholder="Add any additional notes here..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                
                <Button
                  type="button"
                  className="w-full bg-qris-red hover:bg-red-700"
                  disabled={loading}
                  onClick={processUploadedQris}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  {loading ? "Processing..." : "Process QRIS"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      
      {/* Navigation buttons at bottom */}
      <div className="fixed bottom-4 left-4 space-x-2 z-50">
        <Link to="/history">
          <Button variant="outline" size="icon" className="rounded-full shadow-lg">
            <History className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      {/* Settings button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full shadow-lg z-50"
        onClick={() => setSettingsOpen(true)}
      >
        <SettingsIcon className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default Index;
