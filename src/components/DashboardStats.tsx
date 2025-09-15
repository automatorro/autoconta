import { TrendingUp, TrendingDown, Car, FileText, Euro, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative';
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  className?: string;
}

function StatCard({ title, value, change, changeType, icon: Icon, description, className }: StatCardProps) {
  const isPositive = changeType === 'positive';
  
  return (
    <Card className={cn("transition-smooth hover:shadow-medium", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </div>
          {description && (
            <span className="text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  // Mock data - va fi conectat la store-ul real
  const stats = {
    monthlyIncome: {
      current: 15420,
      previous: 13280,
      change: 16.1
    },
    monthlyExpenses: {
      current: 4850,
      previous: 5120,
      change: -5.3
    },
    monthlyProfit: {
      current: 10570,
      previous: 8160,
      change: 29.5
    },
    totalRides: {
      current: 342,
      previous: 289,
      change: 18.3
    },
    pendingDocuments: 8,
    vatToCollect: 2680
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Current Month Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Noiembrie 2024
            </h2>
            <p className="text-sm text-muted-foreground">
              Situația financiară curentă
            </p>
          </div>
          <Badge className="gradient-primary text-primary-foreground">
            Luna în curs
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Venituri totale"
            value={formatCurrency(stats.monthlyIncome.current)}
            change={stats.monthlyIncome.change}
            changeType="positive"
            icon={Euro}
            description="față de luna trecută"
            className="border-success/20 bg-success/5"
          />
          
          <StatCard
            title="Cheltuieli totale"
            value={formatCurrency(stats.monthlyExpenses.current)}
            change={stats.monthlyExpenses.change}
            changeType="positive"
            icon={Receipt}
            description="față de luna trecută"
            className="border-primary/20 bg-primary/5"
          />
          
          <StatCard
            title="Profit net"
            value={formatCurrency(stats.monthlyProfit.current)}
            change={stats.monthlyProfit.change}
            changeType="positive"
            icon={TrendingUp}
            description="după toate taxele"
            className="border-success/20 bg-success/5"
          />
          
          <StatCard
            title="Curse totale"
            value={stats.totalRides.current}
            change={stats.totalRides.change}
            changeType="positive"
            icon={Car}
            description="Uber + Bolt"
            className="border-accent/20 bg-accent/5"
          />
        </div>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-warning" />
              <CardTitle className="text-sm font-medium">
                Documente de procesat
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning mb-1">
              {stats.pendingDocuments}
            </div>
            <p className="text-xs text-muted-foreground">
              Bonuri încărcate astăzi
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-medium">
                TVA de colectat
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-1">
              {formatCurrency(stats.vatToCollect)}
            </div>
            <p className="text-xs text-muted-foreground">
              Termen: 25 Noiembrie
            </p>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-success/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <CardTitle className="text-sm font-medium">
                Profitabilitate
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success mb-1">
              68.5%
            </div>
            <p className="text-xs text-muted-foreground">
              Marja de profit medie
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}