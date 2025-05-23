
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { QrCode, Upload, Loader2, Save, CheckCircle2 } from "lucide-react";
import { SettingsService } from "@/utils/settingsService";
import { extractQRCodeFromImage, isValidQRISCode } from "@/utils/qrScannerUtils";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";

export default function QRISSettings() {
  const [qrisCode, setQrisCode] = useState("");
  const [qrisImage, setQrisImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        if (user) {
          // Try to load from Supabase first
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();
            
          if (profile?.preferences) {
            const prefs = profile.preferences as any;
            if (prefs.qrisCode) setQrisCode(prefs.qrisCode);
            if (prefs.qrisImage) setQrisImage(prefs.qrisImage);
            return;
          }
        }
        
        // Fallback to localStorage or service
        const settings = await SettingsService.getQRISSettings();
        setQrisCode(settings.qrisCode);
        setQrisImage(settings.qrisImage);
      } catch (error) {
        console.error("Error loading QRIS settings:", error);
        toast.error("Failed to load QRIS settings");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      setIsSaved(false);
      
      if (user) {
        // Save to Supabase profiles preferences
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();
          
        const currentPrefs = profile?.preferences || {};
        const updatedPrefs = { 
          ...currentPrefs as object,
          qrisCode,
          qrisImage 
        };
        
        await supabase
          .from('profiles')
          .update({ preferences: updatedPrefs })
          .eq('id', user.id);
      }
      
      // Also save using the service for backward compatibility
      await SettingsService.updateQRISSettings(qrisCode, qrisImage);
      
      // Also save to localStorage for backward compatibility
      if (qrisCode) {
        localStorage.setItem('defaultStaticQris', qrisCode);
      }
      if (qrisImage) {
        localStorage.setItem('defaultQrImage', qrisImage);
      }
      
      setIsSaved(true);
      toast.success("Your QRIS settings have been saved successfully");
    } catch (error) {
      console.error("Error saving QRIS settings:", error);
      toast.error("Failed to save QRIS settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageDataUrl = reader.result as string;
        setQrisImage(imageDataUrl);
        setIsSaved(false);
        
        // Extract QRIS code from the uploaded image
        try {
          setIsScanning(true);
          const extractedCode = await extractQRCodeFromImage(imageDataUrl);
          
          if (extractedCode) {
            if (isValidQRISCode(extractedCode)) {
              setQrisCode(extractedCode);
              toast.success("The QRIS code was automatically extracted from the image");
            } else {
              toast.error("The detected QR code doesn't appear to be a valid QRIS code");
            }
          } else {
            toast.error("Could not find a valid QRIS code in the image");
          }
        } catch (error) {
          console.error("Error scanning QR code:", error);
          toast.error("Failed to scan QR code from the image");
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout title="QRIS Settings" subtitle="Configure your QRIS integration" showBackButton={true}>
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="space-y-2">
          <Label htmlFor="qrisCode">Static QRIS Code</Label>
          <Textarea
            id="qrisCode"
            placeholder="Paste your static QRIS code here"
            value={qrisCode}
            onChange={(e) => {
              setQrisCode(e.target.value);
              setIsSaved(false);
            }}
            rows={4}
          />
          <p className="text-sm text-gray-500">
            This code will be used to generate dynamic QRIS codes for payments.
            Upload a QR image below to automatically extract this code.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Default QR Image</Label>
          <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            {qrisImage ? (
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-48 h-48 relative">
                  <img
                    src={qrisImage}
                    alt="QRIS Code"
                    className="w-full h-full object-contain"
                  />
                  {isSaved && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("qris-image-upload")?.click()}
                    disabled={isScanning}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                  {isScanning && (
                    <div className="flex items-center text-sm text-purple-600">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Scanning...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded-lg">
                  <QrCode className="w-12 h-12 text-gray-400" />
                </div>
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("qris-image-upload")?.click()}
                    disabled={isScanning}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload QRIS Image
                  </Button>
                  {isScanning && (
                    <div className="flex items-center mt-2 text-sm text-purple-600">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Scanning QR code...
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG or GIF up to 2MB
                  </p>
                </div>
              </div>
            )}
            <input
              id="qris-image-upload"
              type="file"
              accept="image/*"
              onChange={handleQRImageUpload}
              className="hidden"
              disabled={isScanning}
            />
          </div>
        </div>

        <Button 
          onClick={handleSaveSettings} 
          disabled={isLoading || isScanning}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Saving...
            </>
          ) : isSaved ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </Layout>
  );
}
