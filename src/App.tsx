import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "@/pages/Index";
import History from "@/pages/History";
import PaymentDetails from "@/pages/PaymentDetails";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
import SettingsPage from "@/pages/SettingsPage";

// Additional imports for settings pages
import GeneralSettings from "./pages/settings/GeneralSettings";
import AppearanceSettings from "./pages/settings/AppearanceSettings";
import WASettings from "./pages/settings/WASettings";
import QRISSettings from "./pages/settings/QRISSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/payment/:id" element={<PaymentDetails />} />
              
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              
              {/* Settings subpages */}
              <Route path="/settings/general" element={<ProtectedRoute><GeneralSettings /></ProtectedRoute>} />
              <Route path="/settings/appearance" element={<ProtectedRoute><AppearanceSettings /></ProtectedRoute>} />
              <Route path="/settings/wa" element={<ProtectedRoute><WASettings /></ProtectedRoute>} />
              <Route path="/settings/qris" element={<ProtectedRoute><QRISSettings /></ProtectedRoute>} />
              
              {/* Other routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
