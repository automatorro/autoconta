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
  
  // Handle OAuth redirect and configuration detection
  React.useEffect(() => {
    const handleOAuthConfig = () => {
      const currentUrl = window.location.href;
      console.log('🔄 Current URL:', currentUrl);
      
      // Check if we're in development mode (localhost)
      if (window.location.hostname === 'localhost') {
        console.log('🧪 Running in local development environment on port:', window.location.port);
        
        // Only show configuration warning if OAuth fails, not automatically
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (error || errorDescription) {
          console.log('❌ OAuth error detected:', error, errorDescription);
          
          // Show configuration guidance only if there's an actual OAuth error
          const port = window.location.port || '8080';
          alert(`⚠️ CONFIGURARE OAUTH NECESARĂ\n\nPentru a funcționa pe localhost:${port}, trebuie să actualizezi:\n\n1. Supabase Dashboard > Authentication > URL Configuration\n   - Site URL: http://localhost:${port}\n   - Redirect URLs: http://localhost:${port}/**\n\n2. Google Cloud Console > OAuth 2.0 Client IDs\n   - Authorized JavaScript origins: http://localhost:${port}\n   - Authorized redirect URIs: https://ytjdvoyyiapkyzjrjllp.supabase.co/auth/v1/callback\n\nDupă actualizare, încearcă din nou autentificarea.`);
        }
      } else {
        console.log('🚀 Running in production environment');
      }
      
      // Handle hash fragments that might contain auth tokens
      if (window.location.hash) {
        console.log('🔑 Auth hash detected:', window.location.hash);
      }
    };
    
    handleOAuthConfig();
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
