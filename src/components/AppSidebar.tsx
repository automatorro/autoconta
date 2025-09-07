import { NavLink, useLocation } from "react-router-dom";
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
  Settings
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
import { cn } from "@/lib/utils";

const modules = [
  {
    title: "Setup & Management",
    url: "/setup",
    icon: Building2,
    description: "Entitate, vehicule, șoferi",
    badge: null
  },
  {
    title: "Documente",
    url: "/documents",
    icon: FileText,
    description: "OCR, upload, import CSV ",
    badge: "3"
  },
  {
    title: "Reconciliere",
    url: "/reconciliation",
    icon: RefreshCw,
    description: "Uber/Bolt matching",
    badge: null
  },
  {
    title: "Contabilitate",
    url: "/accounting",
    icon: Calculator,
    description: "Jurnal, balanță, TVA",
    badge: null
  },
  {
    title: "Declarații",
    url: "/declarations",
    icon: FileCheck,
    description: "212, 301, 394 ANAF",
    badge: "2"
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    description: "Analytics & KPI-uri",
    badge: null
  },
  {
    title: "Optimizare Fiscală",
    url: "/tax-optimization",
    icon: TrendingUp,
    description: "Estimări, simulări",
    badge: null
  },
  {
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
        <div className="flex items-center gap-3">
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
                <SidebarMenuItem key={module.title}>
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
              <SidebarMenuItem>
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
          <SidebarMenuItem>
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