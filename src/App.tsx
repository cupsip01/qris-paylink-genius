import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ProtectedRoute from "./components/ProtectedRoute";
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

import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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
              <Route path="/" element={<Index />} />
              <Route path="/payment/:id" element={<PaymentDetails />} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/edit/:id" element={<ProtectedRoute><EditPayment /></ProtectedRoute>} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthPage />} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/settings/wa" element={<ProtectedRoute><WASettings /></ProtectedRoute>} />
              <Route path="/settings/qris" element={<ProtectedRoute><QRISSettings /></ProtectedRoute>} />
              <Route path="/settings/general" element={<ProtectedRoute><GeneralSettings /></ProtectedRoute>} />
              <Route path="/settings/appearance" element={<ProtectedRoute><AppearanceSettings /></ProtectedRoute>} />
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
