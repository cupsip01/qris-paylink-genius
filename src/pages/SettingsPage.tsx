
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Layout from "@/components/Layout";
import {
  Smartphone,
  Globe,
  Upload,
  Moon,
  Sun,
  PanelLeft,
  User,
  QrCode,
  Settings,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/profiles";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  
  // User profile and preferences
  const [profile, setProfile] = useState<Profile | null>(null);
  const [adminWhatsApp, setAdminWhatsApp] = useState("628123456789");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Halo admin, saya sudah transfer untuk pesanan");
  const [defaultQrImage, setDefaultQrImage] = useState("");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [uploadingQr, setUploadingQr] = useState(false);

  useEffect(() => {
    // Load saved preferences from localStorage for quicker access
    const savedWhatsApp = localStorage.getItem('adminWhatsApp');
    const savedMessage = localStorage.getItem('whatsAppMessage');
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    const savedQrImage = localStorage.getItem('defaultQrImage');
    
    if (savedWhatsApp) setAdminWhatsApp(savedWhatsApp);
    if (savedMessage) setWhatsAppMessage(savedMessage);
    if (savedTheme) setTheme(savedTheme);
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedQrImage) setDefaultQrImage(savedQrImage);
    
    // If user is logged in, fetch profile from Supabase
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      if (data) {
        setProfile(data as Profile);
        // If there are preferences in the profile, use those
        if (data.preferences) {
          data.preferences.adminWhatsApp && setAdminWhatsApp(data.preferences.adminWhatsApp);
          data.preferences.whatsAppMessage && setWhatsAppMessage(data.preferences.whatsAppMessage);
          data.preferences.defaultQrImage && setDefaultQrImage(data.preferences.defaultQrImage);
          data.preferences.theme && setTheme(data.preferences.theme);
          data.preferences.language && setLanguage(data.preferences.language);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    
    try {
      // Save to localStorage for quicker access
      localStorage.setItem('adminWhatsApp', adminWhatsApp);
      localStorage.setItem('whatsAppMessage', whatsAppMessage);
      localStorage.setItem('theme', theme);
      localStorage.setItem('language', language);
      if (defaultQrImage) {
        localStorage.setItem('defaultQrImage', defaultQrImage);
      }
      
      // If user is logged in, save to Supabase
      if (user) {
        const preferences = {
          adminWhatsApp,
          whatsAppMessage,
          defaultQrImage,
          theme,
          language
        };
        
        const { error } = await supabase
          .from('profiles')
          .update({ 
            preferences
          } as any)
          .eq('id', user.id);
        
        if (error) throw error;
      }
      
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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleQrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    setUploadingQr(true);
    
    try {
      // Here we'd normally upload to storage
      // For now, let's create a data URL just for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setDefaultQrImage(base64String);
        localStorage.setItem('defaultQrImage', base64String);
        setUploadingQr(false);
        toast({
          title: "QR Image uploaded",
          description: "Your QR image has been set as default",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading QR image:", error);
      setUploadingQr(false);
      toast({
        title: "Upload failed",
        description: "Failed to upload QR image",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Settings className="h-6 w-6 mr-2 text-primary" />
              <CardTitle>Settings</CardTitle>
            </div>
            <CardDescription>
              Customize your application preferences
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              <nav className="space-y-2">
                <Button 
                  variant={activeTab === "general" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("general")}
                >
                  <PanelLeft className="h-4 w-4 mr-2" />
                  <span>General</span>
                </Button>
                
                <Button 
                  variant={activeTab === "appearance" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("appearance")}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  <span>Appearance</span>
                </Button>
                
                <Button 
                  variant={activeTab === "qris" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("qris")}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  <span>QRIS Settings</span>
                </Button>
                
                <Button 
                  variant={activeTab === "account" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("account")}
                >
                  <User className="h-4 w-4 mr-2" />
                  <span>Account</span>
                </Button>
              </nav>
            </CardContent>
          </Card>
          
          <div className="md:col-span-3">
            {activeTab === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure basic application settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
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
                </CardContent>
              </Card>
            )}
            
            {activeTab === "appearance" && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how the application looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={theme === "light" ? "secondary" : "outline"}
                        className="flex-1"
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "secondary" : "outline"}
                        className="flex-1"
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </Button>
                      <Button
                        variant={theme === "system" ? "secondary" : "outline"}
                        className="flex-1"
                        onClick={() => setTheme("system")}
                      >
                        System
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "qris" && (
              <Card>
                <CardHeader>
                  <CardTitle>QRIS Settings</CardTitle>
                  <CardDescription>
                    Configure QRIS preferences and defaults
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="adminWhatsApp">Admin WhatsApp Number</Label>
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2 text-gray-500" />
                      <Input
                        id="adminWhatsApp"
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
                    <Label htmlFor="whatsAppMessage">WhatsApp Message Template</Label>
                    <Input
                      id="whatsAppMessage"
                      value={whatsAppMessage}
                      onChange={(e) => setWhatsAppMessage(e.target.value)}
                      placeholder="Halo admin, saya sudah transfer untuk pesanan"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Default QR Image</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Label
                          htmlFor="qrImageUpload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-6 w-6 mb-2 text-gray-500" />
                            <p className="text-sm text-gray-500">
                              {uploadingQr ? "Uploading..." : "Click to upload QR image"}
                            </p>
                          </div>
                          <Input
                            id="qrImageUpload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleQrImageUpload}
                            disabled={uploadingQr}
                          />
                        </Label>
                      </div>
                      {defaultQrImage && (
                        <div className="w-32 h-32 border rounded-lg overflow-hidden">
                          <img
                            src={defaultQrImage}
                            alt="Default QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "account" && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user ? (
                    <>
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center mb-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium">{profile?.full_name || "User"}</h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="mb-4">You are not signed in</p>
                      <Button
                        onClick={() => navigate('/auth')}
                      >
                        Sign In
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={savePreferences}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
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
