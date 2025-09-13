import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Target,
  Truck,
  Fuel,
  Users,
  DollarSign,
  Clock,
  Route,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileSpreadsheet,
  Calculator,
  Zap,
  Minus
} from 'lucide-react';

interface TransportMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalKilometers: number;
  fuelConsumption: number;
  averageFuelPrice: number;
  totalTrips: number;
  averageRevenuePerKm: number;
  employeeCosts: number;
  maintenanceCosts: number;
  insuranceCosts: number;
}

interface RouteAnalysis {
  route: string;
  trips: number;
  totalKm: number;
  revenue: number;
  expenses: number;
  profit: number;
  profitability: number;
  averageLoadTime: number;
  fuelEfficiency: number;
}

interface VehiclePerformance {
  vehicleId: string;
  licensePlate: string;
  totalKm: number;
  fuelConsumption: number;
  maintenanceCost: number;
  revenue: number;
  profitability: number;
  utilizationRate: number;
  breakdownDays: number;
}

interface AdvancedReportingProps {
  businessId: string;
}

const AdvancedReporting: React.FC<AdvancedReportingProps> = ({ businessId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Date simulate pentru metrici
  const metrics: TransportMetrics = {
    totalRevenue: 156800,
    totalExpenses: 98200,
    netProfit: 58600,
    profitMargin: 37.4,
    totalKilometers: 28450,
    fuelConsumption: 4280,
    averageFuelPrice: 6.85,
    totalTrips: 142,
    averageRevenuePerKm: 5.51,
    employeeCosts: 32400,
    maintenanceCosts: 18600,
    insuranceCosts: 8200
  };

  // Analiză rute
  const routeAnalysis: RouteAnalysis[] = [
    {
      route: 'București - Cluj',
      trips: 28,
      totalKm: 8960,
      revenue: 44800,
      expenses: 26880,
      profit: 17920,
      profitability: 40.0,
      averageLoadTime: 2.5,
      fuelEfficiency: 6.2
    },
    {
      route: 'București - Timișoara',
      trips: 22,
      totalKm: 7040,
      revenue: 35200,
      expenses: 21120,
      profit: 14080,
      profitability: 40.0,
      averageLoadTime: 3.0,
      fuelEfficiency: 6.8
    },
    {
      route: 'Cluj - Oradea',
      trips: 35,
      totalKm: 5250,
      revenue: 26250,
      expenses: 18375,
      profit: 7875,
      profitability: 30.0,
      averageLoadTime: 1.8,
      fuelEfficiency: 7.1
    },
    {
      route: 'București - Constanța',
      trips: 42,
      totalKm: 9240,
      revenue: 36960,
      expenses: 27720,
      profit: 9240,
      profitability: 25.0,
      averageLoadTime: 2.2,
      fuelEfficiency: 6.5
    },
    {
      route: 'Timișoara - Arad',
      trips: 15,
      totalKm: 900,
      revenue: 4500,
      expenses: 3150,
      profit: 1350,
      profitability: 30.0,
      averageLoadTime: 1.5,
      fuelEfficiency: 7.5
    }
  ];

  // Performanța vehiculelor
  const vehiclePerformance: VehiclePerformance[] = [
    {
      vehicleId: 'V001',
      licensePlate: 'B-123-ABC',
      totalKm: 12500,
      fuelConsumption: 1875,
      maintenanceCost: 8500,
      revenue: 68750,
      profitability: 42.5,
      utilizationRate: 85.2,
      breakdownDays: 3
    },
    {
      vehicleId: 'V002',
      licensePlate: 'B-456-DEF',
      totalKm: 10200,
      fuelConsumption: 1632,
      maintenanceCost: 6200,
      revenue: 56100,
      profitability: 38.8,
      utilizationRate: 78.5,
      breakdownDays: 5
    },
    {
      vehicleId: 'V003',
      licensePlate: 'CJ-789-GHI',
      totalKm: 5750,
      fuelConsumption: 920,
      maintenanceCost: 3900,
      revenue: 31625,
      profitability: 35.2,
      utilizationRate: 65.8,
      breakdownDays: 8
    }
  ];

  // Predicții și tendințe
  const predictions = {
    nextMonthRevenue: 168500,
    nextMonthProfit: 62400,
    fuelPriceTrend: 'increasing',
    demandForecast: 'stable',
    seasonalityFactor: 1.15,
    recommendedRoutes: ['București - Cluj', 'Timișoara - Arad'],
    maintenanceAlerts: 2,
    profitabilityTrend: 'improving'
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Simulare generare raport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generare fișier Excel simulat
      const reportData = {
        period: selectedPeriod,
        vehicle: selectedVehicle,
        route: selectedRoute,
        metrics,
        routeAnalysis,
        vehiclePerformance,
        predictions,
        generatedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raport_transport_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Raport generat cu succes",
        description: "Raportul detaliat a fost descărcat."
      });
      
    } catch (error) {
      toast({
        title: "Eroare la generarea raportului",
        description: "Nu s-a putut genera raportul. Încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-blue-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtre și controale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Raportare și Analiză Avansată
          </CardTitle>
          <CardDescription>
            Analize detaliate pentru optimizarea operațiunilor de transport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="period">Perioada</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Luna curentă</SelectItem>
                  <SelectItem value="last_month">Luna trecută</SelectItem>
                  <SelectItem value="current_quarter">Trimestrul curent</SelectItem>
                  <SelectItem value="last_quarter">Trimestrul trecut</SelectItem>
                  <SelectItem value="current_year">Anul curent</SelectItem>
                  <SelectItem value="custom">Personalizat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="vehicle">Vehicul</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate vehiculele</SelectItem>
                  <SelectItem value="V001">B-123-ABC</SelectItem>
                  <SelectItem value="V002">B-456-DEF</SelectItem>
                  <SelectItem value="V003">CJ-789-GHI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="route">Rută</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate rutele</SelectItem>
                  <SelectItem value="bucuresti-cluj">București - Cluj</SelectItem>
                  <SelectItem value="bucuresti-timisoara">București - Timișoara</SelectItem>
                  <SelectItem value="cluj-oradea">Cluj - Oradea</SelectItem>
                  <SelectItem value="bucuresti-constanta">București - Constanța</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="w-full flex items-center gap-2"
              >
                {isGeneratingReport ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isGeneratingReport ? 'Generez...' : 'Export Raport'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Prezentare Generală</TabsTrigger>
          <TabsTrigger value="routes">Analiză Rute</TabsTrigger>
          <TabsTrigger value="vehicles">Performanță Vehicule</TabsTrigger>
          <TabsTrigger value="predictions">Predicții</TabsTrigger>
          <TabsTrigger value="kpis">KPI-uri</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Metrici principale */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Venituri Totale</p>
                      <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+12.5%</span>
                    <span className="text-muted-foreground ml-1">vs luna trecută</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Profit Net</p>
                      <p className="text-2xl font-bold">{formatCurrency(metrics.netProfit)}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+8.3%</span>
                    <span className="text-muted-foreground ml-1">vs luna trecută</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Marja Profit</p>
                      <p className="text-2xl font-bold">{formatNumber(metrics.profitMargin, 1)}%</p>
                    </div>
                    <PieChart className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-4">
                    <Progress value={metrics.profitMargin} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Kilometri Totali</p>
                      <p className="text-2xl font-bold">{formatNumber(metrics.totalKilometers)}</p>
                    </div>
                    <Route className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-muted-foreground">Venit/km: </span>
                    <span className="font-semibold ml-1">{formatNumber(metrics.averageRevenuePerKm, 2)} RON</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribuția cheltuielilor */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuția Cheltuielilor</CardTitle>
                <CardDescription>Analiza categoriilor de cheltuieli pentru optimizare</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Costuri Angajați</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(metrics.employeeCosts)}</span>
                    </div>
                    <Progress value={(metrics.employeeCosts / metrics.totalExpenses) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {formatNumber((metrics.employeeCosts / metrics.totalExpenses) * 100, 1)}% din total cheltuieli
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Combustibil</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(metrics.fuelConsumption * metrics.averageFuelPrice)}</span>
                    </div>
                    <Progress value={(metrics.fuelConsumption * metrics.averageFuelPrice / metrics.totalExpenses) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {formatNumber((metrics.fuelConsumption * metrics.averageFuelPrice / metrics.totalExpenses) * 100, 1)}% din total cheltuieli
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Întreținere</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(metrics.maintenanceCosts)}</span>
                    </div>
                    <Progress value={(metrics.maintenanceCosts / metrics.totalExpenses) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {formatNumber((metrics.maintenanceCosts / metrics.totalExpenses) * 100, 1)}% din total cheltuieli
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerte și recomandări */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Alerte Operaționale
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Vehiculul CJ-789-GHI</strong> are o rată de utilizare scăzută (65.8%). 
                      Consideră redistribuirea rutelor.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Fuel className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Prețul combustibilului</strong> este în creștere. 
                      Evaluează ajustarea tarifelor pentru luna viitoare.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Întreținere programată</strong> pentru 2 vehicule în următoarele 30 de zile.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Recomandări Optimizare
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Focalizează pe ruta București - Cluj</p>
                      <p className="text-xs text-muted-foreground">Cea mai profitabilă rută (40% marjă)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Optimizează rutele scurte</p>
                      <p className="text-xs text-muted-foreground">Timișoara - Arad are eficiență ridicată</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Monitorizează consumul</p>
                      <p className="text-xs text-muted-foreground">Vehiculul V003 are consum ridicat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Analiză Detaliată Rute</CardTitle>
              <CardDescription>Performanța și profitabilitatea pe fiecare rută</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routeAnalysis.map((route, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <h4 className="font-semibold">{route.route}</h4>
                        <p className="text-sm text-muted-foreground">{route.trips} călătorii</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Kilometri</p>
                        <p className="font-semibold">{formatNumber(route.totalKm)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Venituri</p>
                        <p className="font-semibold text-green-600">{formatCurrency(route.revenue)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Profit</p>
                        <p className="font-semibold text-blue-600">{formatCurrency(route.profit)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Profitabilitate</p>
                        <div className="flex items-center justify-center gap-2">
                          <p className={`font-semibold ${getPerformanceColor(route.profitability, 35)}`}>
                            {formatNumber(route.profitability, 1)}%
                          </p>
                          {route.profitability >= 35 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Timp mediu încărcare: </span>
                        <span className="font-semibold">{route.averageLoadTime}h</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Eficiență combustibil: </span>
                        <span className="font-semibold">{route.fuelEfficiency}L/100km</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Venit/km: </span>
                        <span className="font-semibold">{formatNumber(route.revenue / route.totalKm, 2)} RON</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Performanța Vehiculelor</CardTitle>
              <CardDescription>Analiză detaliată pentru fiecare vehicul din flotă</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehiclePerformance.map((vehicle, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <h4 className="font-semibold">{vehicle.licensePlate}</h4>
                        <p className="text-sm text-muted-foreground">ID: {vehicle.vehicleId}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Kilometri</p>
                        <p className="font-semibold">{formatNumber(vehicle.totalKm)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Venituri</p>
                        <p className="font-semibold text-green-600">{formatCurrency(vehicle.revenue)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Profitabilitate</p>
                        <p className={`font-semibold ${getPerformanceColor(vehicle.profitability, 35)}`}>
                          {formatNumber(vehicle.profitability, 1)}%
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Utilizare</p>
                        <div className="space-y-1">
                          <p className={`font-semibold ${getPerformanceColor(vehicle.utilizationRate, 80)}`}>
                            {formatNumber(vehicle.utilizationRate, 1)}%
                          </p>
                          <Progress value={vehicle.utilizationRate} className="h-1" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Consum: </span>
                        <span className="font-semibold">{formatNumber(vehicle.fuelConsumption / vehicle.totalKm * 100, 1)}L/100km</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Întreținere: </span>
                        <span className="font-semibold">{formatCurrency(vehicle.maintenanceCost)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Zile defecțiuni: </span>
                        <span className={`font-semibold ${vehicle.breakdownDays > 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {vehicle.breakdownDays}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Venit/km: </span>
                        <span className="font-semibold">{formatNumber(vehicle.revenue / vehicle.totalKm, 2)} RON</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Predicții și Tendințe
                </CardTitle>
                <CardDescription>Analize predictive pentru planificarea strategică</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Predicții Financiare</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Venituri Luna Viitoare</p>
                          <p className="text-sm text-muted-foreground">Bazat pe tendința actuală</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(predictions.nextMonthRevenue)}</p>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">+7.5%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Profit Estimat</p>
                          <p className="text-sm text-muted-foreground">Cu condițiile actuale</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{formatCurrency(predictions.nextMonthProfit)}</p>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">+6.5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Tendințe Piață</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Prețuri Combustibil</p>
                          <p className="text-sm text-muted-foreground">Următoarele 30 zile</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(predictions.fuelPriceTrend)}
                          <span className="font-semibold capitalize">{predictions.fuelPriceTrend}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Cerere Transport</p>
                          <p className="text-sm text-muted-foreground">Prognoza sezonală</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(predictions.demandForecast)}
                          <span className="font-semibold capitalize">{predictions.demandForecast}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Factor Sezonalitate</p>
                          <p className="text-sm text-muted-foreground">Multiplicator cerere</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{predictions.seasonalityFactor}x</p>
                          <p className="text-xs text-green-600">+15% față de media anuală</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recomandări Strategice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Rute Recomandate</h4>
                    <div className="space-y-2">
                      {predictions.recommendedRoutes.map((route, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{route}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Acțiuni Prioritare</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">{predictions.maintenanceAlerts} vehicule necesită întreținere</span>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Profitabilitatea este în {predictions.profitabilityTrend}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Indicatori Cheie de Performanță (KPI)
              </CardTitle>
              <CardDescription>Monitorizarea obiectivelor și țintelor de business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* KPI Financiari */}
                <div className="space-y-4">
                  <h4 className="font-semibold">KPI Financiari</h4>
                  
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">ROI (Return on Investment)</span>
                        <span className="text-sm font-bold text-green-600">24.8%</span>
                      </div>
                      <Progress value={82.7} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Țintă: 30%</p>
                    </div>
                    
                    <div className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Marja Brută</span>
                        <span className="text-sm font-bold text-blue-600">62.6%</span>
                      </div>
                      <Progress value={78.3} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Țintă: 80%</p>
                    </div>
                    
                    <div className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Cash Flow</span>
                        <span className="text-sm font-bold text-green-600">Pozitiv</span>
                      </div>
                      <Progress value={95} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Excelent</p>
                    </div>
                  </div>
                </div>
                
                {/* KPI Operaționali */}
                <div className="space-y-4">
                  <h4 className="font-semibold">KPI Operaționali</h4>
                  
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Utilizare Flotă</span>
                        <span className="text-sm font-bold text-green-600">76.5%</span>
                      </div>
                      <Progress value={76.5} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Țintă: 85%</p>
                    </div>
                    
                    <div className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Timp Inactiv</span>
                        <span className="text-sm font-bold text-orange-600">5.3 zile</span>
                      </div>
                      <Progress value={67} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Țintă: &lt;3 zile</p>
                    </div>
                    
                    <div className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Eficiență Combustibil</span>
                        <span className="text-sm font-bold text-green-600">6.8L/100km</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Țintă: &lt;7L/100km</p>
                    </div>
                  </div>
                </div>
                
                {/* KPI Calitate */}
                <div className="space-y-4">
                  <h4 className="font-semibold">KPI Calitate</h4>
                  
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Satisfacție Clienți</span>
                        <span className="text-sm font-bold text-green-600">4.7/5</span>
                      </div>
                      <Progress value={94} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Excelent</p>
                    </div>
                    
                    <div className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Livrări la Timp</span>
                        <span className="text-sm font-bold text-green-600">96.2%</span>
                      </div>
                      <Progress value={96.2} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Țintă: &gt;95%</p>
                    </div>
                    
                    <div className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Incidente Siguranță</span>
                        <span className="text-sm font-bold text-green-600">0</span>
                      </div>
                      <Progress value={100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Perfect</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedReporting;