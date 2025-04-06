
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthProvider";
import { UserService } from "@/utils/userService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ProfileSettings() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      try {
        const profile = await UserService.getProfile(user.id);
        if (profile) {
          setUsername(profile.username || "");
          setFullName(profile.full_name || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Failed to load profile",
          description: "There was an error loading your profile information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, toast]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await UserService.updateProfile(user.id, {
        username,
        full_name: fullName,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Failed to update profile",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Profile Settings" subtitle="Manage your account information" showBackButton>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={user?.email || ""} 
                disabled 
                className="bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500">Your account email cannot be changed</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your preferred username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
