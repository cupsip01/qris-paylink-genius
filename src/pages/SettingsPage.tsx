
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
  ChevronRight 
} from "lucide-react";

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
  const [profile, setProfile] = useState<any>(null);

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
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Tabs 
            orientation="vertical" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex flex-col h-auto w-full bg-muted/50 rounded-md">
              <TabsTrigger 
                value="appearance" 
                className="w-full justify-start gap-2 px-3"
              >
                <Sun className="h-4 w-4" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger 
                value="qrcode" 
                className="w-full justify-start gap-2 px-3"
              >
                <QrCode className="h-4 w-4" />
                <span>QR Code</span>
              </TabsTrigger>
              <TabsTrigger 
                value="whatsapp" 
                className="w-full justify-start gap-2 px-3"
              >
                <Phone className="h-4 w-4" />
                <span>WhatsApp</span>
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="w-full justify-start gap-2 px-3"
              >
                <User className="h-4 w-4" />
                <span>Account</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sync" 
                className="w-full justify-start gap-2 px-3"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Sync</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark theme
                      </p>
                    </div>
                    <Switch 
                      id="dark-mode" 
                      checked={darkMode} 
                      onCheckedChange={setDarkMode} 
                    />
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
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-logo">Show Logo</Label>
                      <p className="text-sm text-muted-foreground">
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
                  
                  <div>
                    <Label htmlFor="logo-size">Logo Size</Label>
                    <p className="text-sm text-muted-foreground mb-2">
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
                  
                  <div>
                    <Label htmlFor="border-style">Border Style</Label>
                    <p className="text-sm text-muted-foreground mb-2">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="whatsapp-enabled">Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive payment notifications via WhatsApp
                      </p>
                    </div>
                    <Switch 
                      id="whatsapp-enabled" 
                      checked={whatsappEnabled} 
                      onCheckedChange={setWhatsappEnabled} 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                    <p className="text-sm text-muted-foreground mb-2">
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
                    <p className="text-xs text-muted-foreground mt-1">
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
                  <div>
                    <Label htmlFor="username">Full Name</Label>
                    <Input
                      id="username"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="max-w-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact support to change your email address
                    </p>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleSignOut}
                    className="mt-4"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sync" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Sync Settings</CardTitle>
                  <CardDescription>
                    Configure how often your data syncs with the server
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Choose how frequently your data syncs with the server
                    </p>
                    <div className="flex gap-2">
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
              className="px-8"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
