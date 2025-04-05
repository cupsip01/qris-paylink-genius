
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-red-600 mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Page Not Found</h2>
        
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => navigate("/")} 
            className="bg-purple-600 hover:bg-purple-700 flex items-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
