
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Moon, 
  Sun, 
  QrCode, 
  Phone, 
  User, 
  RefreshCw, 
  Save, 
  LogOut, 
  ChevronRight,
  Shield,
  Bell,
  CreditCard,
  Languages,
  Upload
} from "lucide-react";
import { Profile } from "@/types/profiles";
import Layout from "@/components/Layout";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appearance");
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [qrCodeSettings, setQrCodeSettings] = useState({
    showLogo: true,
    logoSize: "medium",
    borderStyle: "rounded",
  });
  const [syncInterval, setSyncInterval] = useState("30");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [defaultQrImage, setDefaultQrImage] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        setUser(data.user);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          // Load preferences from profile if they exist
          if (profileData.preferences) {
            setDarkMode(profileData.preferences.darkMode || false);
            setWhatsappNumber(profileData.preferences.whatsappNumber || "");
            setWhatsappEnabled(profileData.preferences.whatsappEnabled || false);
            setQrCodeSettings(profileData.preferences.qrCodeSettings || {
              showLogo: true,
              logoSize: "medium",
              borderStyle: "rounded",
            });
            setSyncInterval(profileData.preferences.syncInterval || "30");
          }
          setUserName(profileData.full_name || "");
          setEmail(data.user.email || "");
        }
      }
    };

    // Load QR from localStorage
    const savedQr = localStorage.getItem('defaultQrImage');
    if (savedQr) setDefaultQrImage(savedQr);
    
    getUser();
  }, []);

  const handleSaveSettings = async () => {
    if (!user) {
      toast.error("You must be logged in to save settings");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: userName,
          preferences: {
            darkMode,
            whatsappNumber,
            whatsappEnabled,
            qrCodeSettings,
            syncInterval,
          },
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast.success("Settings saved successfully");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg border shadow">
              <Tabs 
                orientation="vertical" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="flex flex-col h-auto w-full bg-transparent rounded-md p-1 space-y-1">
                  <TabsTrigger 
                    value="appearance" 
                    className="w-full justify-start gap-3 px-3 h-12"
                  >
                    <Sun className="h-5 w-5" />
                    <span>Appearance</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="qrcode" 
                    className="w-full justify-start gap-3 px-3 h-12"
                  >
                    <QrCode className="h-5 w-5" />
                    <span>QR Code</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="whatsapp" 
                    className="w-full justify-start gap-3 px-3 h-12"
                  >
                    <Phone className="h-5 w-5" />
                    <span>WhatsApp</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="account" 
                    className="w-full justify-start gap-3 px-3 h-12"
                  >
                    <User className="h-5 w-5" />
                    <span>Account</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="w-full justify-start gap-3 px-3 h-12"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Security</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="w-full justify-start gap-3 px-3 h-12"
                  >
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="payments" 
                    className="w-full justify-start gap-3 px-3 h-12"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Payments</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="language" 
                    className="w-full justify-start gap-3 px-3 h-12"
                  >
                    <Languages className="h-5 w-5" />
                    <span>Language</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sync" 
                    className="w-full justify-start gap-3 px-3 h-12"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span>Sync</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="appearance" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how the app looks and feels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-6 p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <Label htmlFor="dark-mode" className="text-lg font-medium">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Toggle between light and dark theme
                        </p>
                      </div>
                      <Switch 
                        id="dark-mode" 
                        checked={darkMode} 
                        onCheckedChange={setDarkMode} 
                      />
                    </div>
                    
                    <div className="p-4 bg-secondary/50 rounded-lg flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">Theme Color</h3>
                        <p className="text-sm text-muted-foreground">Customize the app's primary color</p>
                      </div>
                      <ChevronRight className="text-muted-foreground" />
                    </div>
                    
                    <div className="p-4 bg-secondary/50 rounded-lg flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">Font Size</h3>
                        <p className="text-sm text-muted-foreground">Change the text size throughout the app</p>
                      </div>
                      <ChevronRight className="text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="qrcode" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>QR Code Settings</CardTitle>
                    <CardDescription>
                      Customize the appearance of generated QR codes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <Label htmlFor="show-logo" className="text-lg font-medium">Show Logo</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Display your logo in the center of QR codes
                        </p>
                      </div>
                      <Switch 
                        id="show-logo" 
                        checked={qrCodeSettings.showLogo} 
                        onCheckedChange={(value) => 
                          setQrCodeSettings({...qrCodeSettings, showLogo: value})
                        } 
                      />
                    </div>
                    
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <Label htmlFor="logo-size" className="text-lg font-medium">Logo Size</Label>
                      <p className="text-sm text-muted-foreground mb-3 mt-1">
                        Choose the size of the logo in the QR code
                      </p>
                      <div className="flex gap-2">
                        {["small", "medium", "large"].map((size) => (
                          <Button
                            key={size}
                            type="button"
                            variant={qrCodeSettings.logoSize === size ? "default" : "outline"}
                            onClick={() => setQrCodeSettings({
                              ...qrCodeSettings, 
                              logoSize: size
                            })}
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <Label htmlFor="border-style" className="text-lg font-medium">Border Style</Label>
                      <p className="text-sm text-muted-foreground mb-3 mt-1">
                        Choose the border style for your QR codes
                      </p>
                      <div className="flex gap-2">
                        {["square", "rounded", "circle"].map((style) => (
                          <Button
                            key={style}
                            type="button"
                            variant={qrCodeSettings.borderStyle === style ? "default" : "outline"}
                            onClick={() => setQrCodeSettings({
                              ...qrCodeSettings, 
                              borderStyle: style
                            })}
                          >
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <Label className="text-lg font-medium">Default QR Code</Label>
                      <p className="text-sm text-muted-foreground mb-3 mt-1">
                        Upload a default QR code to use for new payments
                      </p>
                      <div className="flex flex-col items-center justify-center mt-4">
                        {defaultQrImage ? (
                          <div className="relative">
                            <img 
                              src={defaultQrImage} 
                              alt="Default QR" 
                              className="w-40 h-40 object-contain rounded-lg shadow-md" 
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
                              <Label htmlFor="default-qr-file" className="cursor-pointer text-primary hover:text-primary/80 block">
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
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="whatsapp" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>WhatsApp Integration</CardTitle>
                    <CardDescription>
                      Configure WhatsApp notifications for payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <Label htmlFor="whatsapp-enabled" className="text-lg font-medium">Enable Notifications</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Receive payment notifications via WhatsApp
                        </p>
                      </div>
                      <Switch 
                        id="whatsapp-enabled" 
                        checked={whatsappEnabled} 
                        onCheckedChange={setWhatsappEnabled} 
                      />
                    </div>
                    
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <Label htmlFor="whatsapp-number" className="text-lg font-medium">WhatsApp Number</Label>
                      <p className="text-sm text-muted-foreground mb-2 mt-1">
                        Enter your WhatsApp number with country code
                      </p>
                      <Input
                        id="whatsapp-number"
                        placeholder="628123456789"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="max-w-sm"
                        disabled={!whatsappEnabled}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Format: country code + number (e.g., 628123456789)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="account" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Manage your account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <Label htmlFor="username" className="text-lg font-medium">Full Name</Label>
                      <Input
                        id="username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="max-w-sm mt-2"
                      />
                    </div>
                    
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <Label htmlFor="email" className="text-lg font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="max-w-sm mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Contact support to change your email address
                      </p>
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      onClick={handleSignOut}
                      className="mt-4 w-full sm:w-auto"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Placeholder content for the added menu items */}
              {["security", "notifications", "payments", "language"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>{tab.charAt(0).toUpperCase() + tab.slice(1)}</CardTitle>
                      <CardDescription>
                        Manage your {tab} settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <p className="text-muted-foreground">
                          {tab.charAt(0).toUpperCase() + tab.slice(1)} settings will be available soon.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
              
              <TabsContent value="sync" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Sync Settings</CardTitle>
                    <CardDescription>
                      Configure how often your data syncs with the server
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <Label htmlFor="sync-interval" className="text-lg font-medium">Sync Interval (minutes)</Label>
                      <p className="text-sm text-muted-foreground mb-3 mt-1">
                        Choose how frequently your data syncs with the server
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {["5", "15", "30", "60"].map((interval) => (
                          <Button
                            key={interval}
                            type="button"
                            variant={syncInterval === interval ? "default" : "outline"}
                            onClick={() => setSyncInterval(interval)}
                          >
                            {interval} min
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={handleSaveSettings} 
                disabled={loading}
                className="px-8 bg-primary hover:bg-primary/90 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
