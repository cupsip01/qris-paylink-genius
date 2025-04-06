
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/types/profiles";

export interface UsageStats {
  today: number;
  limit: number;
  isUnlimited: boolean;
  pendingRequest: boolean;
}

export const UsageLimitService = {
  // Check if the user has reached their daily limit
  async checkUserLimit(userId: string): Promise<UsageStats> {
    try {
      // Get the user's profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Default values
      const defaultLimit = 5;
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

      // Get preferences or initialize if needed
      const preferences = profile.preferences || {};
      const usage = preferences.usage || {};
      const lastUsageDate = usage.lastDate || '';
      const dailyUsage = lastUsageDate === today ? (usage.count || 0) : 0;
      const isUnlimited = preferences.isUnlimited === true;
      const pendingRequest = preferences.pendingUnlimitedRequest === true;

      return {
        today: dailyUsage,
        limit: defaultLimit,
        isUnlimited,
        pendingRequest
      };
    } catch (error) {
      console.error("Error checking user limit:", error);
      throw error;
    }
  },

  // Record a new usage (increment count)
  async recordUsage(userId: string): Promise<UsageStats> {
    try {
      // Get the user's current profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Initialize date and preferences
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const preferences = profile.preferences || {};
      const usage = preferences.usage || {};
      
      // Reset count if it's a new day
      if (usage.lastDate !== today) {
        usage.count = 0;
      }
      
      // Increment usage count
      usage.count = (usage.count || 0) + 1;
      usage.lastDate = today;
      
      // Update preferences
      preferences.usage = usage;
      
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      return {
        today: usage.count,
        limit: 5,
        isUnlimited: preferences.isUnlimited === true,
        pendingRequest: preferences.pendingUnlimitedRequest === true
      };
    } catch (error) {
      console.error("Error recording usage:", error);
      throw error;
    }
  },

  // Request unlimited access
  async requestUnlimitedAccess(userId: string): Promise<void> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const preferences = profile.preferences || {};
      preferences.pendingUnlimitedRequest = true;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', userId);
        
      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error requesting unlimited access:", error);
      throw error;
    }
  },

  // Admin: approve unlimited access
  async approveUnlimitedAccess(userId: string): Promise<void> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const preferences = profile.preferences || {};
      preferences.isUnlimited = true;
      preferences.pendingUnlimitedRequest = false;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', userId);
        
      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error approving unlimited access:", error);
      throw error;
    }
  },

  // Admin: deny unlimited access
  async denyUnlimitedAccess(userId: string): Promise<void> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const preferences = profile.preferences || {};
      preferences.pendingUnlimitedRequest = false;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', userId);
        
      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error denying unlimited access:", error);
      throw error;
    }
  },

  // Admin: get all users with pending requests
  async getPendingRequests(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Filter profiles with pending requests
      return data.filter(
        profile => profile.preferences?.pendingUnlimitedRequest === true
      );
    } catch (error) {
      console.error("Error getting pending requests:", error);
      throw error;
    }
  }
};
