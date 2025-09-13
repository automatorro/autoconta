import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  CreditCard,
  Truck,
  Users,
  FileText,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { businessService } from '@/services/businessService';

interface ProfitData {
  current_month: {
    revenue: number;
    expenses: number;
    profit: number;
    profit_margin: number;
  };
  previous_month: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  year_to_date: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  monthly_trend: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

interface Debt {
  id: string;
  type: 'anaf' | 'social' | 'supplier' | 'loan' | 'other';
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'overdue' | 'paid';
  priority: 'high' | 'medium' | 'low';
  reference?: string;
}

interface CashFlow {
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  vehicle?: string;
}

interface ProfitDashboardProps {
  businessId: string;
}

const ProfitDashboard: React.FC<ProfitDashboardProps> = ({ businessId }) => {
  const [profitData, setProfitData] = useState<ProfitData | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [businessId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulare încărcare date profit
      const mockProfitData: ProfitData = {
        current_month: {
          revenue: 44550,
          expenses: 32100,
          profit: 12450,
          profit_margin: 27.9
        },
        previous_month: {
          revenue: 41200,
          expenses: 29800,
          profit: 11400
        },
        year_to_date: {
          revenue: 485600,
          expenses: 356200,
          profit: 129400
        },
        monthly_trend: [
          { month: 'Ian', revenue: 38500, expenses: 28200, profit: 10300 },
          { month: 'Feb', revenue: 42100, expenses: 30500, profit: 11600 },
          { month: 'Mar', revenue: 45200, expenses: 32800, profit: 12400 },
          { month: 'Apr', revenue: 41800, expenses: 29900, profit: 11900 },
          { month: 'Mai', revenue: 43600, expenses: 31200, profit: 12400 },
          { month: 'Iun', revenue: 46800, expenses: 33500, profit: 13300 },
          { month: 'Iul', revenue: 48200, expenses: 34800, profit: 13400 },
          { month: 'Aug', revenue: 44900, expenses: 32100, profit: 12800 },
          { month: 'Sep', revenue: 42300, expenses: 30200, profit: 12100 },
          { month: 'Oct', revenue: 43800, expenses: 31400, profit: 12400 },
          { month: 'Nov', revenue: 41200, expenses: 29800, profit: 11400 },
          { month: 'Dec', revenue: 44550, expenses: 32100, profit: 12450 }
        ]
      };
      
      // Simulare încărcare datorii
      const mockDebts: Debt[] = [
        {
          id: '1',
          type: 'anaf',
          description: 'Impozit pe profit - Decembrie 2024',
          amount: 2500,
          due_date: '2025-01-25',
          status: 'pending',
          priority: 'high',
          reference: 'D112/2024/12'
        },
        {
          id: '2',
          type: 'social',
          description: 'Contribuții sociale - Decembrie 2024',
          amount: 1800,
          due_date: '2025-01-25',
          status: 'pending',
          priority: 'high',
          reference: 'D394/2024/12'
        },
        {
          id: '3',
          type: 'supplier',
          description: 'Factură combustibil - OMV Petrom',
          amount: 3200,
          due_date: '2025-01-15',
          status: 'overdue',
          priority: 'high',
          reference: 'F-2024-1234'
        },
        {
          id: '4',
          type: 'loan',
          description: 'Rata leasing vehicul B-123-ABC',
          amount: 1250,
          due_date: '2025-01-10',
          status: 'pending',
          priority: 'medium',
          reference: 'LEASE-001'
        },
        {
          id: '5',
          type: 'other',
          description: 'Asigurare RCA - Allianz',
          amount: 850,
          due_date: '2025-02-01',
          status: 'pending',
          priority: 'medium',
          reference: 'RCA-2025-001'
        }
      ];
      
      // Simulare cash flow
      const mockCashFlow: CashFlow[] = [
        { date: '2024-12-20', type: 'income', category: 'Transport', amount: 2800, description: 'Cursă București-Constanța', vehicle: 'B-123-ABC' },
        { date: '2024-12-20', type: 'expense', category: 'Combustibil', amount: 450, description: 'Alimentare OMV', vehicle: 'B-123-ABC' },
        { date: '2024-12-19', type: 'income', category: 'Transport', amount: 1950, description: 'Cursă București-Brașov', vehicle: 'B-456-DEF' },
        { date: '2024-12-19', type: 'expense', category: 'Întreținere', amount: 320, description: 'Schimb ulei motor', vehicle: 'B-456-DEF' },
        { date: '2024-12-18', type: 'income', category: 'Transport', amount: 3200, description: 'Transport marfă internațional', vehicle: 'B-789-GHI' },
        { date: '2024-12-18', type: 'expense', category: 'Combustibil', amount: 680, description: 'Alimentare MOL', vehicle: 'B-789-GHI' },
        { date: '2024-12-17', type: 'expense', category: 'Salarii', amount: 2800, description: 'Salariu șofer principal' },
        { date: '2024-12-16', type: 'income', category: 'Transport', amount: 2100, description: 'Cursă București-Timișoara', vehicle: 'B-123-ABC' }
      ];
      
      setProfitData(mockProfitData);
      setDebts(mockDebts);
      setCashFlow(mockCashFlow);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const calculateProfitChange = () => {
    if (!profitData) return 0;
    const current = profitData.current_month.profit;
    const previous = profitData.previous_month.profit;
    return ((current - previous) / previous) * 100;
  };

  const getDebtStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-orange-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-300';
    }
  };

  const getTotalDebts = () => {
    return debts.filter(d => d.status !== 'paid').reduce((sum, debt) => sum + debt.amount, 0);
  };

  const getOverdueDebts = () => {
    return debts.filter(d => d.status === 'overdue');
  };

  const getUpcomingDebts = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return debts.filter(d => {
      const dueDate = new Date(d.due_date);
      return d.status === 'pending' && dueDate <= nextWeek && dueDate >= today;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profitData) return null;

  return (
    <div className="space-y-6">
      {/* Alertă datorii urgente */}
      {getOverdueDebts().length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenție!</strong> Ai {getOverdueDebts().length} datorii restante în valoare de {formatCurrency(getOverdueDebts().reduce((sum, d) => sum + d.amount, 0))}.
          </AlertDescription>
        </Alert>
      )}

      {/* Indicatori principali */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Luna Curentă</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(profitData.current_month.profit)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(calculateProfitChange())} față de luna trecută
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Venituri Luna</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(profitData.current_month.revenue)}</p>
                <p className="text-xs text-muted-foreground">
                  Marjă profit: {profitData.current_month.profit_margin.toFixed(1)}%
                </p>
              </div>
              <Euro className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cheltuieli Luna</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(profitData.current_month.expenses)}</p>
                <p className="text-xs text-muted-foreground">
                  {((profitData.current_month.expenses / profitData.current_month.revenue) * 100).toFixed(1)}% din venituri
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Datorii Totale</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(getTotalDebts())}</p>
                <p className="text-xs text-muted-foreground">
                  {debts.filter(d => d.status !== 'paid').length} obligații active
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Prezentare Generală</TabsTrigger>
          <TabsTrigger value="debts">Gestionare Datorii</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="analytics">Analize</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grafic profit lunar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Evoluția Profitului (2024)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitData.monthly_trend.slice(-6).map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress 
                            value={(month.profit / 15000) * 100} 
                            className="h-2" 
                          />
                        </div>
                        <span className="text-sm font-semibold text-green-600 w-20 text-right">
                          {formatCurrency(month.profit)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Datorii urgente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Obligații Urgente
                </CardTitle>
                <CardDescription>
                  Datorii cu scadența în următoarele 7 zile
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getUpcomingDebts().length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nu ai obligații urgente în următoarele 7 zile.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {getUpcomingDebts().map(debt => (
                      <div key={debt.id} className={`p-3 border rounded-lg ${getPriorityColor(debt.priority)}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm">{debt.description}</h4>
                          <Badge className={getDebtStatusColor(debt.status)}>
                            {debt.status === 'pending' ? 'Pending' : debt.status === 'overdue' ? 'Restant' : 'Plătit'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Scadență: {new Date(debt.due_date).toLocaleDateString('ro-RO')}</span>
                          <span className="font-semibold text-red-600">{formatCurrency(debt.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistici YTD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performanță An Curent (YTD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Venituri Totale</p>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(profitData.year_to_date.revenue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Cheltuieli Totale</p>
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(profitData.year_to_date.expenses)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Profit Total</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(profitData.year_to_date.profit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debts">
          <div className="space-y-6">
            {/* Sumar datorii */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-red-500">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Datorii Restante</p>
                  <p className="text-xl font-bold text-red-600">{getOverdueDebts().length}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(getOverdueDebts().reduce((sum, d) => sum + d.amount, 0))}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-orange-500">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Scadente în 7 zile</p>
                  <p className="text-xl font-bold text-orange-600">{getUpcomingDebts().length}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(getUpcomingDebts().reduce((sum, d) => sum + d.amount, 0))}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-500">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Plătite Luna Aceasta</p>
                  <p className="text-xl font-bold text-green-600">{debts.filter(d => d.status === 'paid').length}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(debts.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0))}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista datorii */}
            <Card>
              <CardHeader>
                <CardTitle>Toate Obligațiile Financiare</CardTitle>
                <CardDescription>
                  Gestionează și urmărește toate datoriile și obligațiile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {debts
                    .sort((a, b) => {
                      // Sortare: restante primul, apoi pe prioritate, apoi pe dată
                      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
                      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
                      if (a.priority !== b.priority) {
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      }
                      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                    })
                    .map(debt => {
                      const isOverdue = debt.status === 'overdue';
                      const isUpcoming = getUpcomingDebts().some(d => d.id === debt.id);
                      
                      return (
                        <Card key={debt.id} className={`p-4 ${isOverdue ? 'border-red-500 bg-red-50' : isUpcoming ? 'border-orange-500 bg-orange-50' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-full ${
                                debt.type === 'anaf' ? 'bg-blue-100 text-blue-600' :
                                debt.type === 'social' ? 'bg-green-100 text-green-600' :
                                debt.type === 'supplier' ? 'bg-purple-100 text-purple-600' :
                                debt.type === 'loan' ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {debt.type === 'anaf' && <FileText className="h-4 w-4" />}
                                {debt.type === 'social' && <Users className="h-4 w-4" />}
                                {debt.type === 'supplier' && <Truck className="h-4 w-4" />}
                                {debt.type === 'loan' && <CreditCard className="h-4 w-4" />}
                                {debt.type === 'other' && <DollarSign className="h-4 w-4" />}
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{debt.description}</h4>
                                  <Badge className={getDebtStatusColor(debt.status)}>
                                    {debt.status === 'pending' ? 'Pending' : debt.status === 'overdue' ? 'Restant' : 'Plătit'}
                                  </Badge>
                                  {debt.priority === 'high' && <Badge variant="destructive">Prioritate Mare</Badge>}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>Scadență: {new Date(debt.due_date).toLocaleDateString('ro-RO')}</span>
                                  {debt.reference && <span>Ref: {debt.reference}</span>}
                                  <span className="capitalize">{debt.type}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-xl font-bold text-red-600">{formatCurrency(debt.amount)}</p>
                              {debt.status === 'pending' && (
                                <Button size="sm" className="mt-2">
                                  Marchează ca Plătit
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Cash Flow Recent
              </CardTitle>
              <CardDescription>
                Fluxul de numerar din ultimele zile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cashFlow.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{transaction.description}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{new Date(transaction.date).toLocaleDateString('ro-RO')}</span>
                          <span>•</span>
                          <span>{transaction.category}</span>
                          {transaction.vehicle && (
                            <>
                              <span>•</span>
                              <span>{transaction.vehicle}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuția Cheltuielilor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Combustibil', amount: 18500, percentage: 57.6, color: 'bg-red-500' },
                    { category: 'Salarii', amount: 8200, percentage: 25.5, color: 'bg-blue-500' },
                    { category: 'Întreținere', amount: 3100, percentage: 9.7, color: 'bg-green-500' },
                    { category: 'Asigurări', amount: 2300, percentage: 7.2, color: 'bg-orange-500' }
                  ].map(item => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-muted-foreground">{formatCurrency(item.amount)} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Obiective Financiare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Profit Lunar Target</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(profitData.current_month.profit)} / {formatCurrency(15000)}</span>
                    </div>
                    <Progress value={(profitData.current_month.profit / 15000) * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {((profitData.current_month.profit / 15000) * 100).toFixed(1)}% din obiectiv
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Venituri Anuale Target</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(profitData.year_to_date.revenue)} / {formatCurrency(600000)}</span>
                    </div>
                    <Progress value={(profitData.year_to_date.revenue / 600000) * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {((profitData.year_to_date.revenue / 600000) * 100).toFixed(1)}% din obiectiv anual
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfitDashboard;