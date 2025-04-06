
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { UserService } from "@/utils/userService";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

interface UsageLimitProps {
  onAllowed: () => void;
  actionName?: string;
}

export default function UsageLimit({ onAllowed, actionName = "action" }: UsageLimitProps) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isUnlimited, setIsUnlimited] = useState(false);

  useEffect(() => {
    const checkUsage = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        // First check if user has unlimited access
        const profile = await UserService.getProfile(user.id);
        if (profile?.unlimited_access) {
          setIsUnlimited(true);
          setChecking(false);
          onAllowed(); // Allow action immediately
          return;
        }

        // If not unlimited, increment and check usage
        const { success, currentCount, limitReached } = await UserService.incrementUsage(user.id);
        
        if (success) {
          setUsageCount(currentCount);
          
          if (limitReached) {
            setLimitReached(true);
            toast.error(`Daily limit reached! You've used all 5 daily ${actionName}s.`);
          } else {
            onAllowed(); // Allow the action to proceed
            toast.success(`${actionName} successful! (${currentCount}/5 daily uses)`);
          }
        } else {
          toast.error("Error checking usage limits. Please try again.");
        }
      } catch (error) {
        console.error("Error in usage check:", error);
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setChecking(false);
      }
    };

    checkUsage();
  }, [user, onAllowed, actionName]);

  const handleContactAdmin = () => {
    // Open WhatsApp with predefined message
    window.open("https://wa.me/621887013123?text=I%20want%20an%20unlimited%20package%20of%2030%20thousand", "_blank");
  };

  if (checking) {
    return (
      <div className="w-full flex justify-center my-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400">Login Required</h3>
        <p className="text-yellow-700 dark:text-yellow-300 mt-2">
          Please login to use this feature.
        </p>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">
            Daily Limit Reached!
          </h3>
          
          <div className="w-full max-w-md mb-6">
            <Progress value={100} className="h-3 bg-red-200" />
            <p className="mt-2 text-red-600 dark:text-red-300 font-medium">
              5/5 uses today
            </p>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            You've reached your daily limit of 5 uses. Contact admin via WhatsApp to unlock unlimited access.
          </p>
          
          <Button 
            onClick={handleContactAdmin}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <MessageSquare className="h-5 w-5" />
            Contact Admin on WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  if (isUnlimited) {
    return null; // Render nothing as the action is already allowed
  }

  return (
    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 mb-4">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Daily Usage
          </span>
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            {usageCount}/5
          </span>
        </div>
        <Progress value={(usageCount / 5) * 100} className="h-2" />
      </div>
    </div>
  );
}
