import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Documents from "./pages/Documents";
import Reconciliation from "./pages/Reconciliation";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BusinessManagement from "./pages/BusinessManagement";
import Setup from "./pages/setup";
import Accounting from "./pages/Accounting";
import Declarations from "./pages/Declarations";
import TaxOptimization from "./pages/TaxOptimization";
import Compliance from "./pages/Compliance";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { debugSupabase } from '@/utils/debugSupabase';

// Test logging
console.log('🚀 APP LOADED - Console logging is working!');
debugSupabase();

const queryClient = new QueryClient();

function AppRoutes() {
  const { authUser, user, setupCompleted, setUser, setSession } = useAppStore();
  
  // Loading state pentru a evita redirecționarea prematură
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Check if setup is completed
  const isSetupCompleted = setupCompleted === true;
  
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
        localStorage.removeItem('autoconta-storage');
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

  // Gestionează loading state-ul pentru autentificare
  useEffect(() => {
    // Setăm un timeout pentru a permite hook-ului useAuth să se încarce
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 1000); // Așteptăm 1 secundă pentru încărcarea stării de autentificare

    // Dacă authUser se schimbă (devine non-null), oprim loading-ul imediat
    if (authUser !== null) {
      setIsAuthLoading(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [authUser]);
  
  // Handle OAuth redirect and configuration detection
  React.useEffect(() => {
    const handleOAuthConfig = () => {
      const currentUrl = window.location.href;
      console.log('🔄 Current URL:', currentUrl);
      console.log('🔄 URL search params:', window.location.search);
      console.log('🔄 URL hash:', window.location.hash);

      // Log all URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      console.log('🔍 URL Parameters:');
      for (const [key, value] of urlParams.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      // Check if we're in development mode (localhost)
      if (window.location.hostname === 'localhost') {
        console.log('🧪 Running in local development environment on port:', window.location.port);

        // Only show configuration warning if OAuth fails, not automatically
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

      // Minimal shim: normalize direct path callbacks to hash routes for HashRouter
      // This avoids server-side 404 without requiring environment changes
      const pathname = window.location.pathname;
      const search = window.location.search || '';
      if (!window.location.hash && (pathname === '/auth/callback' || pathname === '/setup')) {
        console.log('🔧 Normalizing path to hash route:', pathname);
        // Preserve query parameters when moving to hash route
        window.location.replace(`/#${pathname}${search}`);
        return; // Stop further processing to avoid double handling
      }

      // Handle hash fragments that might contain auth tokens
      if (window.location.hash) {
        console.log('🔑 Auth hash detected:', window.location.hash);
        // Check for common auth hash patterns
        if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
          console.log('🔐 Auth tokens or error in hash detected');
        }
      }

      // Check for email confirmation tokens
      const token = urlParams.get('token');
      const type = urlParams.get('type');
      if (token && type) {
        console.log('📧 Email confirmation detected - Token:', token, 'Type:', type);
      }
    };

    handleOAuthConfig();
  }, []);
  
  // Afișează loading în timpul încărcării stării de autentificare
  if (isAuthLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        background: '#f8fafc'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Se încarcă aplicația...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  // If not authenticated, show auth page
  if (!authUser) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Evită 404 tranzitoriu când callback încearcă /setup înainte ca authUser să fie setat */}
        <Route path="/setup" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // If authenticated but setup not completed, redirect to setup
  if (!isSetupCompleted) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  // If authenticated and setup completed, show main app with all modules accessible
  return (
    <Routes>
      {/* Auth callback route for authenticated users */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* Prevent 404 if someone hits /setup after completion */}
      <Route path="/setup" element={<Navigate to="/dashboard" replace />} />
      
      {/* Main app layout with all modules */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="business" element={<BusinessManagement />} />
        <Route path="documents" element={<Documents />} />
        <Route path="reconciliation" element={<Reconciliation />} />
        <Route path="accounting" element={<Accounting />} />
        <Route path="declarations" element={<Declarations />} />
        <Route path="tax-optimization" element={<TaxOptimization />} />
        <Route path="compliance" element={<Compliance />} />
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
      <HashRouter>
        <AppRoutes />
      </HashRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
