import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Download, Calendar } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Analiză & Rapoarte
          </h1>
          <p className="text-muted-foreground mt-1">
            Rapoarte detaliate, grafice și analize financiare pentru business-ul tău
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Selectează perioadă
          </Button>
          <Button className="gap-2 gradient-primary">
            <Download className="h-4 w-4" />
            Exportă raport
          </Button>
        </div>
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Venituri vs Cheltuieli (Lunar)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Graficul detaliat va fi disponibil în curând
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cheltuieli pe categorii
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-sm">
                Diagrama circulară cu categorii va fi disponibilă în curând
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Venituri pe surse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-sm">
                Diagrama cu sursele de venit va fi disponibilă în curând
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profit Net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450 RON</div>
            <p className="text-xs text-success">+12.5% față de luna trecută</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Marja de profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.3%</div>
            <p className="text-xs text-success">+3.2% față de luna trecută</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost mediu/cursă
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 RON</div>
            <p className="text-xs text-warning">-2.1% față de luna trecută</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nr. documente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">Procesate în luna curentă</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}