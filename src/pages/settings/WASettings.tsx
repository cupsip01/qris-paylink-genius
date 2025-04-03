
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { SettingsService } from "@/utils/settingsService";

export default function WASettings() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const settings = await SettingsService.getWhatsAppSettings();
        setWhatsappNumber(settings.whatsappNumber);
        setWhatsappMessage(settings.whatsappMessage);
      } catch (error) {
        console.error("Error loading WhatsApp settings:", error);
        toast({
          title: "Error loading settings",
          description: "Failed to load WhatsApp settings",
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
      await SettingsService.updateWhatsAppSettings(whatsappNumber, whatsappMessage);
      
      toast({
        title: "Settings saved",
        description: "Your WhatsApp settings have been saved successfully",
      });
    } catch (error) {
      console.error("Error saving WhatsApp settings:", error);
      toast({
        title: "Error saving settings",
        description: "Failed to save WhatsApp settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="WhatsApp Settings" subtitle="Configure your WhatsApp integration">
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="space-y-2">
          <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
          <Input
            id="whatsappNumber"
            placeholder="e.g., 628123456789"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Enter your WhatsApp number with country code (e.g., 628123456789).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsappMessage">Default Message Template</Label>
          <Textarea
            id="whatsappMessage"
            placeholder="Enter the default message template for WhatsApp"
            value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
            rows={4}
          />
          <p className="text-sm text-gray-500">
            This message will be pre-filled when customers click the WhatsApp button.
          </p>
        </div>

        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </Layout>
  );
}
