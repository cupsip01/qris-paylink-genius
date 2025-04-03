
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { ChevronRight, User, UserCircle, Globe, QrCode, Smartphone, Moon, Sun, LogIn } from "lucide-react";

const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout title="Pengaturan" subtitle="View all your generated QRIS payments">
      <div className="space-y-4">
        {/* Account Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
              <UserCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-purple-600">
                {user ? user.email : "Login"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user ? "Signed in" : "You are not signed in"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Menu Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
          <button 
            onClick={() => navigate("/settings/general")} 
            className="w-full p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-gray-800 dark:text-gray-200">General</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          
          <button 
            onClick={() => navigate("/settings/qris")} 
            className="w-full p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <QrCode className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-gray-800 dark:text-gray-200">QRIS Settings</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          
          <button 
            onClick={() => navigate("/settings/wa")} 
            className="w-full p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-gray-800 dark:text-gray-200">WA Settings</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          
          <button 
            onClick={() => navigate("/settings/appearance")} 
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-gray-800 dark:text-gray-200">Appearance</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        
        {/* Login/Sign Out */}
        {!user ? (
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <LogIn className="h-5 w-5 mr-2" /> Login
          </Button>
        ) : null}
      </div>
    </Layout>
  );
};

export default SettingsPage;
