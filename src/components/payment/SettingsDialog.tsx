
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

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");
  const [defaultQrImage, setDefaultQrImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedQr = localStorage.getItem('defaultQrImage');
    const savedWhatsApp = localStorage.getItem('adminWhatsApp');
    const savedMessage = localStorage.getItem('whatsAppMessage');
    
    if (savedQr) setDefaultQrImage(savedQr);
    if (savedWhatsApp) setAdminWhatsApp(savedWhatsApp);
    if (savedMessage) setWhatsAppMessage(savedMessage);
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
              <QrCode className="h-4 w-4" /> Default QR Code
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
