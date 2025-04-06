
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Index from "./pages/Index";
import PaymentDetails from "./pages/PaymentDetails";
import History from "./pages/History";
import EditPayment from "./pages/EditPayment";
import AuthPage from "./pages/AuthPage";
import SettingsPage from "./pages/SettingsPage";
import WASettings from "./pages/settings/WASettings";
import QRISSettings from "./pages/settings/QRISSettings";
import GeneralSettings from "./pages/settings/GeneralSettings";
import AppearanceSettings from "./pages/settings/AppearanceSettings";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import ProfileSettings from "./pages/settings/ProfileSettings";
import AdminDashboard from "./pages/admin/Dashboard";
import LimitReached from "./pages/LimitReached";

import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

// Create a client with retry and refetch options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Increase retry attempts
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/payment/:id" element={<PaymentDetails />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/limit-reached" element={<LimitReached />} />
              
              {/* Protected Routes */}
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/edit/:id" element={<ProtectedRoute><EditPayment /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/settings/wa" element={<ProtectedRoute><WASettings /></ProtectedRoute>} />
              <Route path="/settings/qris" element={<ProtectedRoute><QRISSettings /></ProtectedRoute>} />
              <Route path="/settings/general" element={<ProtectedRoute><GeneralSettings /></ProtectedRoute>} />
              <Route path="/settings/appearance" element={<ProtectedRoute><AppearanceSettings /></ProtectedRoute>} />
              <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            <Toaster />
            <SonnerToaster position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
