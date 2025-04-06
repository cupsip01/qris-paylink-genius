
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/types/profiles";

export class UserService {
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    return data;
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }
    
    return data;
  }

  static async getAllUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }
    
    return data || [];
  }

  static async incrementUsage(userId: string): Promise<{success: boolean, currentCount: number, limitReached: boolean}> {
    // Get the current profile
    const profile = await this.getProfile(userId);
    if (!profile) return { success: false, currentCount: 0, limitReached: false };
    
    // If user has unlimited access, don't count usage
    if (profile.unlimited_access) {
      return { success: true, currentCount: 0, limitReached: false };
    }
    
    const now = new Date().toISOString();
    let dailyUsage = profile.daily_usage || { count: 0, last_reset: now };
    
    // Check if we need to reset the counter (new day)
    const lastReset = new Date(dailyUsage.last_reset);
    const currentDate = new Date();
    
    if (lastReset.getDate() !== currentDate.getDate() || 
        lastReset.getMonth() !== currentDate.getMonth() || 
        lastReset.getFullYear() !== currentDate.getFullYear()) {
      // It's a new day, reset count
      dailyUsage = { count: 1, last_reset: now };
    } else {
      // Same day, increment count
      dailyUsage.count += 1;
    }
    
    // Update the profile
    const updated = await this.updateProfile(userId, { daily_usage: dailyUsage });
    
    if (!updated) return { success: false, currentCount: 0, limitReached: false };
    
    const limitReached = dailyUsage.count > 5;
    return { 
      success: true, 
      currentCount: dailyUsage.count,
      limitReached 
    };
  }

  static async grantUnlimitedAccess(userId: string): Promise<boolean> {
    const updated = await this.updateProfile(userId, { unlimited_access: true });
    return !!updated;
  }

  static async revokeUnlimitedAccess(userId: string): Promise<boolean> {
    const updated = await this.updateProfile(userId, { unlimited_access: false });
    return !!updated;
  }

  static async loginAsAdmin(username: string, password: string): Promise<boolean> {
    // Hardcoded admin password check
    if (password === "Cileungsi1") {
      return true;
    }
    return false;
  }
}
