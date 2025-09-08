import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Setup from "./pages/Setup";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { debugSupabase } from '@/utils/debugSupabase';

// Test logging
console.log('🚀 APP LOADED - Console logging is working!');
debugSupabase();

const queryClient = new QueryClient();

function AppRoutes() {
  const { authUser, user } = useAppStore();
  const hasCompany = user.company !== null;
  
  // Check if setup is completed by looking at the user profile data
  const isSetupCompleted = hasCompany; // For now, we'll use company existence as setup completion indicator
  
  // Initialize auth hook
  useAuth();
  
  // Handle OAuth redirect from production to localhost
  React.useEffect(() => {
    const handleOAuthRedirect = () => {
      const currentUrl = window.location.href;
      console.log('🔄 Current URL:', currentUrl);
      
      // Check if we're on production but should be on localhost
      if (currentUrl.includes('autoconta.lovable.app')) {
        console.log('⚠️ Detected production redirect, attempting to redirect to localhost');
        
        // Extract hash and query parameters to preserve auth tokens
        const hashPart = window.location.hash;
        const searchPart = window.location.search;
        
        // Construct the localhost URL with the same path, query params and hash
        const localhostUrl = `http://localhost:8081${window.location.pathname}${searchPart}${hashPart}`;
        console.log('🔄 Redirecting to:', localhostUrl);
        
        // Show alert to user about configuration issue
        alert('⚠️ CONFIGURARE OAUTH NECESARĂ\n\nPentru a funcționa pe localhost, trebuie să actualizezi:\n\n1. Supabase Dashboard > Authentication > URL Configuration\n   - Site URL: http://localhost:8081\n   - Redirect URLs: http://localhost:8081/**\n\n2. Google Cloud Console > OAuth 2.0 Client IDs\n   - Authorized JavaScript origins: http://localhost:8081\n   - Authorized redirect URIs: https://ytjdvoyyiapkyzjrjllp.supabase.co/auth/v1/callback\n\nÎncercăm să te redirecționăm automat la localhost...');
        
        // Attempt to redirect automatically
        try {
          window.location.href = localhostUrl;
          return; // Stop execution after redirect
        } catch (error) {
          console.error('❌ Failed to redirect automatically:', error);
          alert('Nu am putut redirecționa automat. Te rugăm să navighezi manual la: ' + localhostUrl);
        }
      }
      
      // Handle hash fragments that might contain auth tokens
      if (window.location.hash) {
        console.log('🔑 Auth hash detected:', window.location.hash);
      }
    };
    
    handleOAuthRedirect();
  }, []);
  
  // If not authenticated, show auth page
  if (!authUser) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // If authenticated, show main app
  return (
    <Routes>
      {!isSetupCompleted ? (
        <>
          <Route path="/setup" element={<Setup />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="setup" element={<div>Setup & Management</div>} />
            <Route path="documents" element={<Documents />} />
            <Route path="reconciliation" element={<div>Reconciliere</div>} />
            <Route path="accounting" element={<div>Contabilitate</div>} />
            <Route path="declarations" element={<div>Declarații</div>} />
            <Route path="tax-optimization" element={<div>Optimizare Fiscală</div>} />
            <Route path="compliance" element={<div>Compliance</div>} />
            <Route path="alerts" element={<div>Alerte</div>} />
            <Route path="settings" element={<div>Setări</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
