
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { QrCode, Upload } from "lucide-react";
import { SettingsService } from "@/utils/settingsService";

export default function QRISSettings() {
  const [qrisCode, setQrisCode] = useState("");
  const [qrisImage, setQrisImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const settings = await SettingsService.getQRISSettings();
        setQrisCode(settings.qrisCode);
        setQrisImage(settings.qrisImage);
      } catch (error) {
        console.error("Error loading QRIS settings:", error);
        toast({
          title: "Error loading settings",
          description: "Failed to load QRIS settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      await SettingsService.updateQRISSettings(qrisCode, qrisImage);
      
      // Also save to localStorage for backward compatibility
      if (qrisCode) {
        localStorage.setItem('defaultStaticQris', qrisCode);
      }
      if (qrisImage) {
        localStorage.setItem('defaultQrImage', qrisImage);
      }
      
      toast({
        title: "Settings saved",
        description: "Your QRIS settings have been saved successfully",
      });
    } catch (error) {
      console.error("Error saving QRIS settings:", error);
      toast({
        title: "Error saving settings",
        description: "Failed to save QRIS settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrisImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout title="QRIS Settings" subtitle="Configure your QRIS integration">
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="space-y-2">
          <Label htmlFor="qrisCode">Static QRIS Code</Label>
          <Textarea
            id="qrisCode"
            placeholder="Paste your static QRIS code here"
            value={qrisCode}
            onChange={(e) => setQrisCode(e.target.value)}
            rows={4}
          />
          <p className="text-sm text-gray-500">
            This code will be used to generate dynamic QRIS codes for payments.
            Make sure it's a valid static QRIS code.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Default QR Image (optional)</Label>
          <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            {qrisImage ? (
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-48 h-48">
                  <img
                    src={qrisImage}
                    alt="QRIS Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("qris-image-upload")?.click()}
                >
                  Change Image
                </Button>
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
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload QRIS Image
                  </Button>
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
            />
          </div>
        </div>

        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </Layout>
  );
}
