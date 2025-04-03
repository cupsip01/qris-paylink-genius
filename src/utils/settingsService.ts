
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/types/profiles";

export const SettingsService = {
  async getSettings() {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("Not authenticated");
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.user.id)
      .single();
      
    if (error) {
      console.error("Error fetching settings:", error);
      return null;
    }
    
    return data;
  },
  
  async updateWhatsAppSettings(whatsappNumber: string, whatsappMessage: string) {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("Not authenticated");
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .update({
        preferences: {
          whatsappNumber,
          whatsAppMessage: whatsappMessage
        }
      })
      .eq("id", user.user.id);
      
    if (error) {
      console.error("Error updating WhatsApp settings:", error);
      throw new Error("Failed to update WhatsApp settings");
    }
    
    return data;
  },
  
  async updateQRISSettings(qrisCode: string, qrisImage: string) {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("Not authenticated");
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .update({
        preferences: {
          qrisCode,
          qrisImage
        }
      })
      .eq("id", user.user.id);
      
    if (error) {
      console.error("Error updating QRIS settings:", error);
      throw new Error("Failed to update QRIS settings");
    }
    
    return data;
  },
  
  async getWhatsAppSettings() {
    const settings = await this.getSettings();
    
    if (!settings) {
      return {
        whatsappNumber: "",
        whatsappMessage: "Halo, saya ingin konfirmasi pembayaran QRIS."
      };
    }
    
    return {
      whatsappNumber: settings.preferences?.whatsappNumber || "",
      whatsappMessage: settings.preferences?.whatsAppMessage || "Halo, saya ingin konfirmasi pembayaran QRIS."
    };
  },
  
  async getQRISSettings() {
    const settings = await this.getSettings();
    
    if (!settings) {
      return {
        qrisCode: "",
        qrisImage: ""
      };
    }
    
    return {
      qrisCode: settings.preferences?.qrisCode || "",
      qrisImage: settings.preferences?.qrisImage || ""
    };
  }
};
