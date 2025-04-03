
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const WASettings = () => {
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load WhatsApp settings
    const savedWhatsApp = localStorage.getItem('adminWhatsApp');
    const savedMessage = localStorage.getItem('whatsAppMessage');
    
    if (savedWhatsApp) setAdminWhatsApp(savedWhatsApp);
    if (savedMessage) setWhatsAppMessage(savedMessage);
    
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('settings')
        .select('whatsapp_number, whatsapp_message')
        .single();
      
      if (settings) {
        if (settings.whatsapp_number) setAdminWhatsApp(settings.whatsapp_number);
        if (settings.whatsapp_message) setWhatsAppMessage(settings.whatsapp_message);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    
    try {
      // Save to localStorage for quicker access
      localStorage.setItem('adminWhatsApp', adminWhatsApp);
      localStorage.setItem('whatsAppMessage', whatsAppMessage);
      
      // Save to Supabase as well
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          id: 1,
          whatsapp_number: adminWhatsApp,
          whatsapp_message: whatsAppMessage
        });
      
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your WhatsApp settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Failed to save settings",
        description: "An error occurred while saving your WhatsApp settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout 
      title="WA Settings"
      subtitle="Configure WA custom message & number"
      showBackButton
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
        <h2 className="text-xl font-bold mb-1">WA Settings</h2>
        <p className="text-gray-500 mb-6">Configure WA custom message & number</p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Admin WhatsApp Number</label>
            <div className="flex items-center">
              <Smartphone className="h-4 w-4 mr-2 text-gray-500" />
              <Input
                value={adminWhatsApp}
                onChange={(e) => setAdminWhatsApp(e.target.value)}
                placeholder="628123456789"
              />
            </div>
            <p className="text-xs text-gray-500">
              Include country code without + (e.g., 628123456789)
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">WhatsApp Message Template</label>
            <Input
              value={whatsAppMessage}
              onChange={(e) => setWhatsAppMessage(e.target.value)}
              placeholder="Halo admin, saya sudah transfer untuk pesanan"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </Layout>
  );
};

export default WASettings;
