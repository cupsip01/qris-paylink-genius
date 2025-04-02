
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { QrCode, Upload } from "lucide-react";
import { toast } from "sonner";
import { parseQrisData } from "@/utils/qrisUtils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");
  const [defaultQrImage, setDefaultQrImage] = useState<string | null>(null);
  const [staticQrisCode, setStaticQrisCode] = useState("");
  const [merchantInfo, setMerchantInfo] = useState<{nmid: string, merchantName: string, id: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedQr = localStorage.getItem('defaultQrImage');
    const savedWhatsApp = localStorage.getItem('adminWhatsApp');
    const savedMessage = localStorage.getItem('whatsAppMessage');
    const savedStaticQris = localStorage.getItem('defaultStaticQris');
    
    if (savedQr) setDefaultQrImage(savedQr);
    if (savedWhatsApp) setAdminWhatsApp(savedWhatsApp);
    if (savedMessage) setWhatsAppMessage(savedMessage);
    if (savedStaticQris) {
      setStaticQrisCode(savedStaticQris);
      try {
        const info = parseQrisData(savedStaticQris);
        setMerchantInfo(info);
      } catch (error) {
        console.error("Error parsing saved QRIS:", error);
      }
    }
  }, [open]);

  const handleDefaultQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        try {
          setDefaultQrImage(event.target.result as string);
          localStorage.setItem('defaultQrImage', event.target.result as string);
          toast.success("Default QR code has been saved");
        } catch (error) {
          console.error("Failed to save QR image to localStorage:", error);
          toast.error("Failed to save QR image. It might be too large.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read the image file");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const saveWhatsAppSettings = () => {
    try {
      localStorage.setItem('adminWhatsApp', adminWhatsApp);
      localStorage.setItem('whatsAppMessage', whatsAppMessage);
      toast.success("WhatsApp settings saved successfully");
    } catch (error) {
      console.error("Failed to save WhatsApp settings:", error);
      toast.error("Failed to save WhatsApp settings");
    }
  };

  const handleStaticQrisChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setStaticQrisCode(value);
    
    if (value.length > 30) { // Only try to parse if we have enough data
      try {
        const info = parseQrisData(value);
        setMerchantInfo(info);
      } catch (error) {
        console.error("Error parsing QRIS:", error);
        setMerchantInfo(null);
      }
    } else {
      setMerchantInfo(null);
    }
  };

  const saveStaticQris = () => {
    if (staticQrisCode.length < 30) {
      toast.error("Please enter a valid QRIS code");
      return;
    }

    try {
      localStorage.setItem('defaultStaticQris', staticQrisCode);
      toast.success("QRIS code has been saved");
    } catch (error) {
      console.error("Failed to save QRIS code:", error);
      toast.error("Failed to save QRIS code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your payment and WhatsApp settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <QrCode className="h-4 w-4" /> Static QRIS Code
            </h3>
            <div className="border rounded-md p-4">
              <div className="space-y-3">
                <Textarea 
                  placeholder="Paste your static QRIS code here (starts with 00020101...)"
                  value={staticQrisCode}
                  onChange={handleStaticQrisChange}
                  rows={4}
                  className="font-mono text-xs"
                />
                
                {merchantInfo && (
                  <div className="bg-gray-50 p-3 text-xs rounded-md">
                    <div className="font-medium">Merchant Info:</div>
                    <div>Name: {merchantInfo.merchantName || "Unknown"}</div>
                    <div>NMID: {merchantInfo.nmid || "Unknown"}</div>
                  </div>
                )}
                
                <Button 
                  onClick={saveStaticQris} 
                  disabled={staticQrisCode.length < 30}
                  size="sm"
                  className="w-full"
                >
                  Save QRIS Code
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <QrCode className="h-4 w-4" /> Default QR Code Image
            </h3>
            <div className="border rounded-md p-4">
              <div className="flex flex-col items-center justify-center mb-4">
                {defaultQrImage ? (
                  <div className="relative">
                    <img 
                      src={defaultQrImage} 
                      alt="Default QR" 
                      className="w-40 h-40 object-contain" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/150x150?text=Invalid+QR";
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setDefaultQrImage(null);
                        localStorage.removeItem('defaultQrImage');
                        toast.success("Default QR code removed");
                      }}
                      className="mt-2 mx-auto block"
                    >
                      Remove Default QR
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative overflow-hidden w-full"
                    style={{minHeight: '150px'}}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <Label htmlFor="default-qr-file" className="cursor-pointer text-blue-600 hover:text-blue-800 block">
                        Upload Default QR
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        This will be used as default for new payments
                      </p>
                    </div>
                    
                    <Input
                      id="default-qr-file"
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleDefaultQrUpload}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Admin WhatsApp Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-whatsapp">WhatsApp Number</Label>
                <Input 
                  id="admin-whatsapp" 
                  value={adminWhatsApp}
                  onChange={(e) => setAdminWhatsApp(e.target.value)}
                  placeholder="e.g. 628123456789"
                />
                <p className="text-xs text-gray-500">
                  Include country code without + (e.g., 628123456789)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp-message">Default Message</Label>
                <Textarea
                  id="whatsapp-message"
                  value={whatsAppMessage}
                  onChange={(e) => setWhatsAppMessage(e.target.value)}
                  placeholder="Default message for payment confirmation"
                  className="min-h-24"
                />
                <p className="text-xs text-gray-500">
                  This message will be sent when a customer confirms payment
                </p>
              </div>
              
              <Button 
                onClick={saveWhatsAppSettings}
                className="w-full"
              >
                Save WhatsApp Settings
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
