
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import PaymentDetails from "./pages/PaymentDetails";
import AuthPage from "./pages/AuthPage";
import SettingsPage from "./pages/SettingsPage";
import { AuthProvider } from "./context/AuthProvider";
import Layout from "@/components/Layout";
import { ThemeProvider } from "./context/ThemeProvider";

// Initialize the query client outside the component
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/history" element={<Layout><History /></Layout>} />
              <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
              <Route path="/payment/:id" element={<PaymentDetails />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
