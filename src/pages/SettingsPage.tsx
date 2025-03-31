
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { useTheme } from "@/context/ThemeProvider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Upload, 
  QrCode, 
  Phone, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  User,
  Database,
  Shield,
  Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");
  const [defaultQrImage, setDefaultQrImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("appearance");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }

    // Load settings from localStorage
    const savedQr = localStorage.getItem('defaultQrImage');
    const savedWhatsApp = localStorage.getItem('adminWhatsApp');
    const savedMessage = localStorage.getItem('whatsAppMessage');
    
    if (savedQr) setDefaultQrImage(savedQr);
    if (savedWhatsApp) setAdminWhatsApp(savedWhatsApp);
    if (savedMessage) setWhatsAppMessage(savedMessage);
  }, [user, loading, navigate]);

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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const saveSettingsToSupabase = async () => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: {
            whatsAppNumber: adminWhatsApp,
            whatsAppMessage: whatsAppMessage,
            theme: theme
          }
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Settings saved to your profile");
    } catch (error: any) {
      toast.error(`Error saving settings: ${error.message}`);
    }
  };

  const loadSettingsFromSupabase = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data?.preferences) {
        const { whatsAppNumber, whatsAppMessage, theme: savedTheme } = data.preferences;
        
        if (whatsAppNumber) setAdminWhatsApp(whatsAppNumber);
        if (whatsAppMessage) setWhatsAppMessage(whatsAppMessage);
        if (savedTheme) setTheme(savedTheme);
        
        toast.success("Settings loaded from your profile");
      }
    } catch (error: any) {
      toast.error(`Error loading settings: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  // Settings page UI
  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-center text-muted-foreground">
          Customize your QRIS Payment experience
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {/* Settings Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="sticky top-6">
            <CardContent className="p-0">
              <Tabs 
                defaultValue={activeTab} 
                value={activeTab} 
                onValueChange={setActiveTab}
                orientation="vertical" 
                className="w-full"
              >
                <TabsList className="flex flex-col h-auto items-stretch p-0 bg-transparent">
                  <TabsTrigger 
                    value="appearance" 
                    className="flex items-center justify-start gap-2 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none border-l-2 border-transparent data-[state=active]:border-l-violet-600"
                  >
                    <Sun className="h-4 w-4" />
                    <span>Appearance</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="qrcode" 
                    className="flex items-center justify-start gap-2 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none border-l-2 border-transparent data-[state=active]:border-l-violet-600"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>QR Code</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="whatsapp" 
                    className="flex items-center justify-start gap-2 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none border-l-2 border-transparent data-[state=active]:border-l-violet-600"
                  >
                    <Phone className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="account" 
                    className="flex items-center justify-start gap-2 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none border-l-2 border-transparent data-[state=active]:border-l-violet-600"
                  >
                    <User className="h-4 w-4" />
                    <span>Account</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="sync" 
                    className="flex items-center justify-start gap-2 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none border-l-2 border-transparent data-[state=active]:border-l-violet-600"
                  >
                    <Database className="h-4 w-4" />
                    <span>Sync</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border bg-card text-card-foreground shadow-sm">
            <TabsContent value="appearance" className="mt-0">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Switch between light and dark mode
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Sun className="mr-2 h-4 w-4 text-amber-500" />
                      <Switch
                        id="dark-mode"
                        checked={theme === 'dark'}
                        onCheckedChange={toggleTheme}
                      />
                      <Moon className="ml-2 h-4 w-4 text-indigo-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="qrcode" className="mt-0">
              <CardHeader>
                <CardTitle>Default QR Code</CardTitle>
                <CardDescription>
                  Set up your default QR code for payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center mb-4">
                    {defaultQrImage ? (
                      <div className="relative">
                        <img 
                          src={defaultQrImage} 
                          alt="Default QR" 
                          className="w-48 h-48 object-contain border rounded-lg shadow-md" 
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
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center relative overflow-hidden w-full flex flex-col items-center justify-center"
                        style={{minHeight: '200px'}}
                      >
                        <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                        <div className="mt-4">
                          <Label htmlFor="default-qr-file" className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block font-medium">
                            Upload Default QR
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                            This QR code will be used as default for new payments
                          </p>
                        </div>
                        
                        <Input
                          id="default-qr-file"
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={handleDefaultQrUpload}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="whatsapp" className="mt-0">
              <CardHeader>
                <CardTitle>WhatsApp Settings</CardTitle>
                <CardDescription>
                  Configure WhatsApp contact and message templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-whatsapp">Admin WhatsApp Number</Label>
                    <Input 
                      id="admin-whatsapp" 
                      value={adminWhatsApp}
                      onChange={(e) => setAdminWhatsApp(e.target.value)}
                      placeholder="e.g. 628123456789"
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code without + (e.g., 628123456789)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-message">Default Message Template</Label>
                    <Textarea
                      id="whatsapp-message"
                      value={whatsAppMessage}
                      onChange={(e) => setWhatsAppMessage(e.target.value)}
                      placeholder="Default message for payment confirmation"
                      className="min-h-24"
                    />
                    <p className="text-xs text-muted-foreground">
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
              </CardContent>
            </TabsContent>

            <TabsContent value="account" className="mt-0">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md bg-muted/50">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-full p-3">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Logged in since: {new Date(user.created_at || "").toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="destructive"
                      onClick={() => signOut()}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="sync" className="mt-0">
              <CardHeader>
                <CardTitle>Sync Settings</CardTitle>
                <CardDescription>
                  Save and load your settings from the cloud
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-muted/50">
                    <p className="text-sm">
                      You can save your current settings to your account and restore them on any device.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={saveSettingsToSupabase}
                      className="w-full"
                      variant="default"
                    >
                      Save Settings to Cloud
                    </Button>
                    
                    <Button 
                      onClick={loadSettingsFromSupabase}
                      className="w-full"
                      variant="outline"
                    >
                      Load Settings from Cloud
                    </Button>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
