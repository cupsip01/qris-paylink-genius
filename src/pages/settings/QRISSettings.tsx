
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { parseQrisData } from "@/utils/qrisUtils";
import { Textarea } from "@/components/ui/textarea";

const QRISSettings = () => {
  const [staticQrisCode, setStaticQrisCode] = useState("");
  const [qrisImage, setQrisImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [merchantInfo, setMerchantInfo] = useState<{name?: string, nmid?: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    loadQRISSettings();
  }, []);

  useEffect(() => {
    if (staticQrisCode) {
      try {
        // Try to parse merchant info from QRIS code
        const data = parseQrisData(staticQrisCode);
        setMerchantInfo({
          name: data?.merchantName || "",
          nmid: data?.nmid || ""
        });
      } catch (error) {
        console.error("Error parsing QRIS data:", error);
      }
    }
  }, [staticQrisCode]);

  const loadQRISSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('settings')
        .select('qris_code, qris_image')
        .single();
      
      if (settings?.qris_code) {
        setStaticQrisCode(settings.qris_code);
      }
      
      if (settings?.qris_image) {
        setQrisImage(settings.qris_image);
      }
    } catch (error) {
      console.error("Error loading QRIS settings:", error);
    }
  };

  const handleQrisUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadingQr(true);

      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Image = reader.result as string;
          
          // Send to QR Code reader API
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
            method: 'POST',
            body: formData
          });
          
          const data = await response.json();
          const qrisCode = data[0]?.symbol[0]?.data;
          
          if (!qrisCode || !qrisCode.startsWith('00020101')) {
            throw new Error("Format QRIS tidak valid");
          }

          setQrisImage(base64Image);
          setStaticQrisCode(qrisCode);
          
          try {
            // Try to parse merchant info from QRIS code
            const parsedData = parseQrisData(qrisCode);
            setMerchantInfo({
              name: parsedData?.merchantName || "",
              nmid: parsedData?.nmid || ""
            });
          } catch (error) {
            console.error("Error parsing QRIS data:", error);
          }
          
          toast({
            title: "QRIS Uploaded",
            description: "Your QRIS code has been successfully read",
          });

        } catch (error) {
          console.error("Error processing QRIS:", error);
          toast({
            title: "Error",
            description: "Failed to process QRIS. Make sure the image contains a valid QRIS code.",
            variant: "destructive"
          });
        }
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error("Error uploading QRIS:", error);
      toast({
        title: "Error",
        description: "Failed to upload QRIS. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingQr(false);
    }
  };

  const saveQrisCode = async () => {
    setLoading(true);
    
    try {
      if (!staticQrisCode.startsWith('00020101')) {
        throw new Error("Invalid QRIS code format");
      }
      
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          id: 1,
          qris_code: staticQrisCode,
          qris_image: qrisImage
        });
      
      if (error) throw error;
      
      toast({
        title: "QRIS code saved",
        description: "Your QRIS code has been updated successfully",
      });
    } catch (error) {
      console.error("Error saving QRIS code:", error);
      toast({
        title: "Failed to save QRIS code",
        description: "Make sure you have entered a valid QRIS code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeQrisImage = () => {
    setQrisImage(null);
    toast({
      title: "QR image removed",
      description: "Default QR image has been removed",
    });
  };

  return (
    <Layout 
      title="QRIS Settings"
      subtitle="Configure QRIS preferences and defaults"
      showBackButton
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
        <h2 className="text-xl font-bold mb-1">QRIS Settings</h2>
        <p className="text-gray-500 mb-6">Configure QRIS preferences and defaults</p>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center">
              <QrCode className="h-4 w-4 mr-2" />
              <label className="text-sm font-medium">Default QR Code Image</label>
            </div>
            
            {qrisImage ? (
              <div className="flex flex-col items-center">
                <img 
                  src={qrisImage} 
                  alt="Default QR" 
                  className="max-h-48 object-contain my-2 border rounded-lg"
                />
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  onClick={removeQrisImage}
                >
                  Remove Default QR
                </Button>
              </div>
            ) : (
              <div>
                <label 
                  htmlFor="qrImageUpload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
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
                    className="hidden"
                    accept="image/*"
                    onChange={handleQrisUpload}
                    disabled={uploadingQr}
                  />
                </label>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <QrCode className="h-4 w-4 mr-2" />
              <label className="text-sm font-medium">Static QRIS Code</label>
            </div>
            
            <Textarea
              value={staticQrisCode}
              onChange={(e) => setStaticQrisCode(e.target.value)}
              className="font-mono text-xs"
              placeholder="Enter your static QRIS code here..."
              rows={4}
            />
            
            {merchantInfo.name || merchantInfo.nmid ? (
              <div className="text-sm space-y-1 mt-2">
                <p>
                  <span className="font-medium">Merchant:</span> {merchantInfo.name}
                </p>
                <p>
                  <span className="font-medium">NMID:</span> {merchantInfo.nmid}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Button
          onClick={saveQrisCode}
          disabled={loading || !staticQrisCode}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? "Saving..." : "Save QRIS Code"}
        </Button>
      </div>
    </Layout>
  );
};

export default QRISSettings;
