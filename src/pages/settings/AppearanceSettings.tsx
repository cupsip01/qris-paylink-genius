
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AppearanceSettings = () => {
  const [theme, setTheme] = useState("system");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    
    // Apply theme immediately
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('theme', theme);
      
      toast({
        title: "Settings saved",
        description: "Your theme preference has been updated successfully",
      });
    } catch (error) {
      console.error("Error saving theme settings:", error);
      toast({
        title: "Failed to save settings",
        description: "An error occurred while saving your theme preference",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout 
      title="Appearance"
      subtitle="Customize how the application looks"
      showBackButton
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
        <h2 className="text-xl font-bold mb-1">Appearance</h2>
        <p className="text-gray-500 mb-6">Customize how the application looks</p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-3">Theme</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center ${
                  theme === "light" 
                    ? "bg-gray-200 dark:bg-gray-700 font-medium" 
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Sun className="h-4 w-4 mr-2" /> Light
              </button>
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center ${
                  theme === "dark" 
                    ? "bg-gray-200 dark:bg-gray-700 font-medium" 
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Moon className="h-4 w-4 mr-2" /> Dark
              </button>
              <button
                onClick={() => handleThemeChange("system")}
                className={`flex-1 py-2 px-3 rounded-lg ${
                  theme === "system" 
                    ? "bg-gray-200 dark:bg-gray-700 font-medium" 
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                System
              </button>
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

export default AppearanceSettings;
