import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";
import { useAppStore } from "@/store/useAppStore";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAppStore();
  const hasCompany = user.company !== null;

  return (
    <Routes>
      {!hasCompany ? (
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
            <Route path="documents" element={<div>Documente</div>} />
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
