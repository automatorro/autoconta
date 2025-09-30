import { Bell, User, ChevronDown, AlertTriangle, Settings, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className }: AppHeaderProps) {
  const { authUser, user, getActiveAlerts, setUser, setSession, setCompany } = useAppStore();
  const alerts = getActiveAlerts();
  const alertsCount = alerts.length;
  const userName = authUser?.email || user.company?.name || "Utilizator";
  const companyCIF = user.company?.cif || "Necompletat";
  const currentMonth = "Noiembrie 2024";
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log('🔄 Starting logout process...');
      
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase logout error:', error);
      }
      
      // Clear Zustand state
      setUser(null);
      setSession(null);
      setCompany(null);
      
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
      setCompany(null);
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
  
  return (
    <header className={cn(
      "h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "flex items-center justify-between px-4 sticky top-0 z-50",
      className
    )}>
      {/* Left side - Sidebar trigger and breadcrumb */}
      <div className="flex items-center gap-4">
        {location.pathname !== '/' && <SidebarTrigger className="h-8 w-8" />}
        
        <div
          role="link"
          tabIndex={0}
          onClick={() => navigate("/")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/");
            }
          }}
          className="no-underline hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50 rounded-sm"
        >
          <h1 className="text-lg font-semibold text-foreground">
            Dashboard Contabilitate
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentMonth} • Raportare lunară
          </p>
        </div>
      </div>

      {/* Right side - Notifications and user menu */}
      <div className="flex items-center gap-3">
        {/* Quick status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <div className="w-2 h-2 rounded-full bg-success"></div>
          <span className="text-xs font-medium text-success">
            Toate documentele la zi
          </span>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative h-9 w-9 p-0"
            >
              <Bell className="h-4 w-4" />
              {alertsCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-warning"
                >
                  {alertsCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificări</span>
              <Badge variant="secondary" className="h-5 px-2">
                {alertsCount}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Sample notifications */}
            <DropdownMenuItem 
              className="flex items-start gap-3 p-3"
              onClick={() => {
                toast({
                  title: "ITP expiră în 7 zile",
                  description: "Vehicul B-123-ABC necesită înnoirea ITP-ului.",
                });
              }}
            >
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">ITP expiră în 7 zile</p>
                <p className="text-xs text-muted-foreground">
                  Vehicul B-123-ABC
                </p>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="flex items-start gap-3 p-3"
              onClick={() => {
                toast({
                  title: "Declarația 301 TVA",
                  description: "Termen limită: 25 Noiembrie. Nu uitați să depuneți declarația!",
                });
              }}
            >
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Declarația 301 TVA</p>
                <p className="text-xs text-muted-foreground">
                  Termen limită: 25 Noiembrie
                </p>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-center text-sm text-primary"
              onClick={() => {
                toast({
                  title: "Toate notificările",
                  description: "Funcționalitatea va fi disponibilă în curând.",
                });
              }}
            >
              Vezi toate notificările
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 h-9 px-3"
            >
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-none">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground">
                  CIF: {companyCIF}
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Contul meu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="mr-2 h-4 w-4" />
              Profil firmă
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Setări și Management
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              toast({
                title: "În curând",
                description: "Funcționalitatea de backup va fi disponibilă în curând.",
              });
            }}>
              Backup & Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              toast({
                title: "Suport tehnic",
                description: "Pentru suport, contactați-ne la support@autoconta.ro",
              });
            }}>
              Suport tehnic
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Deconectare
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}