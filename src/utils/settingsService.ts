
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
    
    // Get current preferences to update only the required fields
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferences")
      .eq("id", user.user.id)
      .single();
      
    const currentPrefs = profile?.preferences || {};
    
    const { data, error } = await supabase
      .from("profiles")
      .update({
        preferences: {
          ...(currentPrefs as object),
          whatsappNumber,
          whatsAppMessage: whatsappMessage
        }
      })
      .eq("id", user.user.id);
      
    if (error) {
      console.error("Error updating WhatsApp settings:", error);
      throw new Error("Failed to update WhatsApp settings");
    }
    
    // Also save to localStorage for backwards compatibility
    localStorage.setItem('adminWhatsApp', whatsappNumber);
    localStorage.setItem('whatsAppMessage', whatsappMessage);
    
    return data;
  },
  
  async updateQRISSettings(qrisCode: string, qrisImage: string) {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      // If not authenticated, save to localStorage only
      localStorage.setItem('defaultStaticQris', qrisCode);
      localStorage.setItem('defaultQrImage', qrisImage);
      return null;
    }
    
    // Get current preferences to update only the required fields
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferences")
      .eq("id", user.user.id)
      .single();
      
    const currentPrefs = profile?.preferences || {};
    
    const { data, error } = await supabase
      .from("profiles")
      .update({
        preferences: {
          ...(currentPrefs as object),
          qrisCode,
          qrisImage
        }
      })
      .eq("id", user.user.id);
      
    if (error) {
      console.error("Error updating QRIS settings:", error);
      throw new Error("Failed to update QRIS settings");
    }
    
    // Also save to localStorage for backwards compatibility
    localStorage.setItem('defaultStaticQris', qrisCode);
    localStorage.setItem('defaultQrImage', qrisImage);
    
    return data;
  },
  
  async getWhatsAppSettings() {
    try {
      const settings = await this.getSettings();
      
      if (!settings || !settings.preferences) {
        // Fallback to localStorage
        return {
          whatsappNumber: localStorage.getItem('adminWhatsApp') || "",
          whatsappMessage: localStorage.getItem('whatsAppMessage') || "Halo, saya ingin konfirmasi pembayaran QRIS."
        };
      }
      
      return {
        whatsappNumber: settings.preferences?.whatsappNumber || "",
        whatsappMessage: settings.preferences?.whatsAppMessage || "Halo, saya ingin konfirmasi pembayaran QRIS."
      };
    } catch (error) {
      console.error("Error getting WhatsApp settings:", error);
      // Fallback to localStorage
      return {
        whatsappNumber: localStorage.getItem('adminWhatsApp') || "",
        whatsappMessage: localStorage.getItem('whatsAppMessage') || "Halo, saya ingin konfirmasi pembayaran QRIS."
      };
    }
  },
  
  async getQRISSettings() {
    try {
      const settings = await this.getSettings();
      
      if (!settings || !settings.preferences) {
        // Fallback to localStorage
        return {
          qrisCode: localStorage.getItem('defaultStaticQris') || "",
          qrisImage: localStorage.getItem('defaultQrImage') || ""
        };
      }
      
      return {
        qrisCode: (settings.preferences as any)?.qrisCode || localStorage.getItem('defaultStaticQris') || "",
        qrisImage: (settings.preferences as any)?.qrisImage || localStorage.getItem('defaultQrImage') || ""
      };
    } catch (error) {
      console.error("Error getting QRIS settings:", error);
      // Fallback to localStorage
      return {
        qrisCode: localStorage.getItem('defaultStaticQris') || "",
        qrisImage: localStorage.getItem('defaultQrImage') || ""
      };
    }
  }
};
