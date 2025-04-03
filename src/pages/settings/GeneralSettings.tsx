
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const GeneralSettings = () => {
  const [language, setLanguage] = useState("id");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('language', language);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Failed to save settings",
        description: "An error occurred while saving your preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout 
      title="General Settings"
      subtitle="Configure basic application settings"
      showBackButton
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
        <h2 className="text-xl font-bold mb-1">General Settings</h2>
        <p className="text-gray-500 mb-6">Configure basic application settings</p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Language</label>
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-gray-500" />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

export default GeneralSettings;
