
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if not admin and not loading
    if (!loading && !isAdmin) {
      console.log("Not admin, redirecting to auth page");
      navigate('/auth');
    }
  }, [isAdmin, loading, navigate]);

  // Add debugging console logs
  useEffect(() => {
    console.log("AdminRoute - isAdmin:", isAdmin);
    console.log("AdminRoute - loading:", loading);
    console.log("AdminRoute - localStorage admin status:", localStorage.getItem('isAdmin'));
  }, [isAdmin, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : null;
}
