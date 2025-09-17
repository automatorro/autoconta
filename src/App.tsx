import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";

import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BusinessManagement from "./pages/BusinessManagement";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { debugSupabase } from '@/utils/debugSupabase';

// Test logging
console.log('🚀 APP LOADED - Console logging is working!');
debugSupabase();

const queryClient = new QueryClient();

function AppRoutes() {
  const { authUser, user, setUser, setSession } = useAppStore();
  const hasCompany = user.company !== null;
  
  // Check if setup is completed by looking at the user profile data
  const isSetupCompleted = hasCompany; // Verificăm dacă există companie
  
  // Initialize auth hook
  useAuth();
  
  // Verificăm dacă există un token în localStorage dar nu există sesiune activă
  // Acest lucru poate indica o stare inconsistentă după deconectare
  React.useEffect(() => {
    const checkAuthConsistency = () => {
      // Verificăm dacă există chei Supabase în localStorage
      const hasSbKeys = Object.keys(localStorage).some(key => key.startsWith('sb-'));
      
      // Verificăm dacă există stare Zustand persistentă
      const hasZustandState = localStorage.getItem('autoconta-storage') !== null;
      
      // Dacă există chei de autentificare dar nu există utilizator autentificat
      // sau dacă suntem pe pagina principală și există stare persistentă
      if ((hasSbKeys && !authUser) || 
          (window.location.pathname === '/' && hasZustandState && !authUser)) {
        console.log('🧹 Detected inconsistent auth state, cleaning up...');
        
        // Curățăm starea Zustand
        setUser(null);
        setSession(null);
        
        // Curățăm localStorage
        localStorage.removeItem('contauber-storage');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        // Forțăm reîncărcarea paginii pentru a reseta complet starea
        if (window.location.pathname !== '/') {
          window.location.replace('/');
        }
      }
    };
    
    checkAuthConsistency();
  }, [authUser, setUser, setSession]);
  
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

  // If authenticated, show main app with all modules accessible
  return (
    <Routes>

      
      {/* Main app layout with all modules */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="setup" element={<Setup />} />
        <Route path="business" element={<BusinessManagement />} />
        <Route path="documents" element={<Documents />} />
        <Route path="reconciliation" element={<div className="p-6"><h1 className="text-2xl font-bold">Reconciliere</h1><p className="text-muted-foreground">Funcționalitatea va fi disponibilă în curând.</p></div>} />
        <Route path="accounting" element={<div className="p-6"><h1 className="text-2xl font-bold">Contabilitate</h1><p className="text-muted-foreground">Funcționalitatea va fi disponibilă în curând.</p></div>} />
        <Route path="declarations" element={<div className="p-6"><h1 className="text-2xl font-bold">Declarații</h1><p className="text-muted-foreground">Funcționalitatea va fi disponibilă în curând.</p></div>} />
        <Route path="tax-optimization" element={<div className="p-6"><h1 className="text-2xl font-bold">Optimizare Fiscală</h1><p className="text-muted-foreground">Funcționalitatea va fi disponibilă în curând.</p></div>} />
        <Route path="compliance" element={<div className="p-6"><h1 className="text-2xl font-bold">Compliance</h1><p className="text-muted-foreground">Funcționalitatea va fi disponibilă în curând.</p></div>} />
        <Route path="alerts" element={<div className="p-6"><h1 className="text-2xl font-bold">Notificări</h1><p className="text-muted-foreground">Funcționalitatea va fi disponibilă în curând.</p></div>} />
      </Route>
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
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
