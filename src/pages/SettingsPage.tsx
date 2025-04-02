import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, PanelLeft, Moon, QrCode, User, Globe, Upload, Sun, Smartphone, Bell, CreditCard, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/profiles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/theme-provider";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("qris");
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
          const prefs = data.preferences as Record<string, any>;
          
          if (prefs.adminWhatsApp) setAdminWhatsApp(prefs.adminWhatsApp);
          if (prefs.whatsAppMessage) setWhatsAppMessage(prefs.whatsAppMessage);
          if (prefs.defaultQrImage) setDefaultQrImage(prefs.defaultQrImage);
          if (prefs.theme) setTheme(prefs.theme);
          if (prefs.language) setLanguage(prefs.language);
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
          })
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
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Pengaturan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qris" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="qris">QRIS</TabsTrigger>
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
                <TabsTrigger value="payments">Pembayaran</TabsTrigger>
              </TabsList>
              
              <TabsContent value="qris">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pengaturan QRIS</h3>
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
                </div>
              </TabsContent>
              
              <TabsContent value="profile">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profil Pengguna</h3>
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
                </div>
              </TabsContent>
              
              <TabsContent value="notifications">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pengaturan Notifikasi</h3>
                  {/* Notifications Settings content */}
                </div>
              </TabsContent>
              
              <TabsContent value="payments">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Riwayat Pembayaran</h3>
                  {/* Payment History content */}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;


