import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  RefreshCw,
  Calculator,
  FileCheck,
  BarChart3,
  TrendingUp,
  Shield,
  Bell,
  Settings,
  LogOut
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const modules = [
  {
    id: "business",
    title: "Gestionare Business",
    url: "/business",
    icon: Building2,
    description: "Entitate, vehicule, șoferi",
    badge: null
  },
  {
    id: "documents",
    title: "Documente",
    url: "/documents",
    icon: FileText,
    description: "OCR, upload, import CSV ",
    badge: "3"
  },
  {
    id: "reconciliation",
    title: "Reconciliere",
    url: "/reconciliation",
    icon: RefreshCw,
    description: "Uber/Bolt matching",
    badge: null
  },
  {
    id: "accounting",
    title: "Contabilitate",
    url: "/accounting",
    icon: Calculator,
    description: "Jurnal, balanță, TVA",
    badge: null
  },
  {
    id: "declarations",
    title: "Declarații",
    url: "/declarations",
    icon: FileCheck,
    description: "212, 301, 394 ANAF",
    badge: "2"
  },
  {
    id: "analytics",
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    description: "Analytics & KPI-uri",
    badge: null
  },
  {
    id: "tax-optimization",
    title: "Optimizare Fiscală",
    url: "/tax-optimization",
    icon: TrendingUp,
    description: "Estimări, simulări",
    badge: null
  },
  {
    id: "compliance",
    title: "Compliance",
    url: "/compliance",
    icon: Shield,
    description: "Arhivare, backup",
    badge: null
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setSession } = useAppStore();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      console.log('🔄 Starting logout process from sidebar...');
      
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase logout error:', error);
      }
      
      // Clear Zustand state
      setUser(null);
      setSession(null);
      
      // Clear all localStorage
      localStorage.clear();
      
      // Show success message
      toast({
        title: "Delogare reușită",
        description: "Ai fost delogat cu succes.",
      });
      
      // Force redirect to homepage with reload
      window.location.replace('/');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Force cleanup even if there's an error
      setUser(null);
      setSession(null);
      localStorage.clear();
      
      toast({
        title: "Eroare la delogare",
        description: "A apărut o eroare, dar ai fost delogat.",
        variant: "destructive"
      });
      
      // Force redirect anyway
      window.location.replace('/');
    }
  };
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  
  const getNavClasses = (path: string) => cn(
    "w-full justify-start gap-3 h-12 px-3 transition-smooth",
    isActive(path) 
      ? "bg-primary text-primary-foreground shadow-primary" 
      : "hover:bg-secondary hover:text-secondary-foreground"
  );

  return (
    <Sidebar 
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-smooth",
        isCollapsed ? "w-16" : "w-72"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div 
          className="flex items-center gap-3 no-underline hover:opacity-90 transition-opacity cursor-pointer block w-full"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            console.log('Header clicked!', e);
            window.location.href = '/';
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              window.location.href = '/';
            }
          }}
        >
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">
                AutoConta
              </h2>
              <p className="text-xs text-muted-foreground">
                Contabilitate online
              </p>
            </div>
           )}
         </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "px-3 py-2 text-xs font-medium text-muted-foreground",
            isCollapsed && "sr-only"
          )}>
            Module Principale
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {modules.map((module) => (
                <SidebarMenuItem key={module.id}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={isCollapsed ? module.title : undefined}
                  >
                    <NavLink 
                      to={module.url} 
                      className={getNavClasses(module.url)}
                    >
                      <module.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">
                              {module.title}
                            </span>
                            {module.badge && (
                              <Badge 
                                variant="secondary" 
                                className="ml-2 h-5 px-1.5 text-xs"
                              >
                                {module.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {module.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Alertele urgente */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={cn(
            "px-3 py-2 text-xs font-medium text-muted-foreground",
            isCollapsed && "sr-only"
          )}>
            Alerte
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="alerts-notifications">
                <SidebarMenuButton 
                  asChild
                  tooltip={isCollapsed ? "Notificări urgente" : undefined}
                >
                  <NavLink 
                    to="/alerts" 
                    className={getNavClasses("/alerts")}
                  >
                    <Bell className="w-5 h-5 flex-shrink-0 text-warning" />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Notificări</span>
                          <Badge 
                            variant="secondary" 
                            className="ml-2 h-5 px-1.5 text-xs bg-warning/10 text-warning border-warning/20"
                          >
                            5
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Documente expirate
                        </p>
                      </div>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem key="footer-settings">
            <SidebarMenuButton 
              asChild
              tooltip={isCollapsed ? "Setări" : undefined}
            >
              <NavLink 
                to="/settings"
                className={getNavClasses("/settings")}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">Setări</span>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem key="footer-logout">
            <SidebarMenuButton 
              onClick={handleLogout}
              tooltip={isCollapsed ? "Delogare" : undefined}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">Delogare</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {!isCollapsed && (
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground mb-1">
              Versiunea 1.0.0
            </p>
            <p className="text-xs text-primary font-medium">
              AutoConta Pro România
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}