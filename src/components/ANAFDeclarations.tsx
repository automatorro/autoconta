import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import PrintManager from './PrintManager';
import { 
  FileText, 
  Download, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Clock,
  Euro,
  Calculator,
  Printer,
  Send,
  Eye,
  Building,
  Users,
  Truck
} from 'lucide-react';
import { businessService } from '@/services/businessService';

// Tipuri de declarații ANAF pentru transportatori
const declarationTypes = [
  {
    code: 'D112',
    name: 'Declarația privind obligațiile de plată la bugetul de stat',
    description: 'Declarația lunară pentru impozitul pe profit și alte obligații',
    frequency: 'monthly',
    deadline: '25 ale lunii următoare',
    category: 'fiscal',
    icon: Euro
  },
  {
    code: 'D394',
    name: 'Declarația privind obligațiile de plată la bugetul asigurărilor sociale',
    description: 'Declarația lunară pentru contribuțiile sociale ale angajaților',
    frequency: 'monthly',
    deadline: '25 ale lunii următoare',
    category: 'social',
    icon: Users
  },
  {
    code: 'D101',
    name: 'Declarația privind impozitul pe profit',
    description: 'Declarația anuală pentru impozitul pe profit',
    frequency: 'annual',
    deadline: '31 martie',
    category: 'fiscal',
    icon: Building
  },
  {
    code: 'D200',
    name: 'Declarația privind veniturile din activități independente',
    description: 'Pentru PFA - declarația anuală de venituri',
    frequency: 'annual',
    deadline: '31 mai',
    category: 'pfa',
    icon: FileText
  },
  {
    code: 'REVISAL',
    name: 'Declarația nominală REVISAL',
    description: 'Declarația lunară cu datele angajaților',
    frequency: 'monthly',
    deadline: '25 ale lunii următoare',
    category: 'social',
    icon: Users
  },
  {
    code: 'INTRASTAT',
    name: 'Declarația INTRASTAT',
    description: 'Pentru transporturi internaționale în UE',
    frequency: 'monthly',
    deadline: '15 ale lunii următoare',
    category: 'transport',
    icon: Truck
  }
];

interface Declaration {
  id: string;
  type: string;
  period: string;
  status: 'draft' | 'generated' | 'submitted' | 'approved';
  amount?: number;
  deadline: string;
  generated_at?: string;
  submitted_at?: string;
  file_url?: string;
}

interface ANAFDeclarationsProps {
  businessId: string;
}

const ANAFDeclarations: React.FC<ANAFDeclarationsProps> = ({ businessId }) => {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [activeTab, setActiveTab] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [currentPeriod, setCurrentPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    loadDeclarations();
    loadBusinessData();
  }, [businessId]);

  const loadDeclarations = async () => {
    try {
      // Simulare încărcare declarații existente
      const mockDeclarations: Declaration[] = [
        {
          id: '1',
          type: 'D112',
          period: '2024-12',
          status: 'submitted',
          amount: 2500,
          deadline: '2025-01-25',
          generated_at: '2024-12-20T10:00:00Z',
          submitted_at: '2024-12-22T14:30:00Z',
          file_url: '/mock/d112_2024_12.pdf'
        },
        {
          id: '2',
          type: 'D394',
          period: '2024-12',
          status: 'generated',
          amount: 1800,
          deadline: '2025-01-25',
          generated_at: '2024-12-20T10:15:00Z',
          file_url: '/mock/d394_2024_12.pdf'
        },
        {
          id: '3',
          type: 'REVISAL',
          period: '2024-12',
          status: 'draft',
          deadline: '2025-01-25'
        }
      ];
      
      setDeclarations(mockDeclarations);
    } catch (error) {
      console.error('Error loading declarations:', error);
    }
  };

  const loadBusinessData = async () => {
    try {
      // Simulare încărcare date business
      const data = {
        business_type: 'SRL',
        fiscal_code: 'RO12345678',
        name: 'Transport Express SRL',
        employees_count: 5,
        monthly_revenue: 45000,
        monthly_expenses: 32000
      };
      setBusinessData(data);
    } catch (error) {
      console.error('Error loading business data:', error);
    }
  };

  const generateDeclaration = async (declarationType: string) => {
    setIsGenerating(true);
    
    try {
      // Simulare generare declarație
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const declarationInfo = declarationTypes.find(d => d.code === declarationType);
      const periodStr = `${currentPeriod.year}-${currentPeriod.month.toString().padStart(2, '0')}`;
      
      // Calculare automată a sumelor pe baza datelor din sistem
      let calculatedAmount = 0;
      if (declarationType === 'D112') {
        // Impozit pe profit (16% din profit)
        const profit = (businessData?.monthly_revenue || 0) - (businessData?.monthly_expenses || 0);
        calculatedAmount = Math.max(0, profit * 0.16);
      } else if (declarationType === 'D394') {
        // Contribuții sociale (35% din salarii)
        calculatedAmount = (businessData?.employees_count || 0) * 3000 * 0.35; // Salariu mediu 3000 RON
      }
      
      const newDeclaration: Declaration = {
        id: Date.now().toString(),
        type: declarationType,
        period: periodStr,
        status: 'generated',
        amount: calculatedAmount,
        deadline: getDeadlineForDeclaration(declarationType, currentPeriod),
        generated_at: new Date().toISOString(),
        file_url: `/mock/${declarationType.toLowerCase()}_${periodStr.replace('-', '_')}.pdf`
      };
      
      setDeclarations(prev => [newDeclaration, ...prev.filter(d => !(d.type === declarationType && d.period === periodStr))]);
      
      toast({
        title: "Declarație generată cu succes",
        description: `${declarationInfo?.name} pentru perioada ${periodStr} a fost generată.`
      });
      
    } catch (error) {
      toast({
        title: "Eroare la generare",
        description: "Nu s-a putut genera declarația. Încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const submitDeclaration = async (declarationId: string) => {
    try {
      // Simulare trimitere la ANAF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDeclarations(prev => prev.map(d => 
        d.id === declarationId 
          ? { ...d, status: 'submitted', submitted_at: new Date().toISOString() }
          : d
      ));
      
      toast({
        title: "Declarație trimisă",
        description: "Declarația a fost trimisă cu succes către ANAF."
      });
      
    } catch (error) {
      toast({
        title: "Eroare la trimitere",
        description: "Nu s-a putut trimite declarația. Încearcă din nou.",
        variant: "destructive"
      });
    }
  };

  const getDeadlineForDeclaration = (type: string, period: { month: number; year: number }) => {
    const declarationInfo = declarationTypes.find(d => d.code === type);
    if (!declarationInfo) return '';
    
    if (declarationInfo.frequency === 'monthly') {
      const nextMonth = period.month === 12 ? 1 : period.month + 1;
      const nextYear = period.month === 12 ? period.year + 1 : period.year;
      return `${nextYear}-${nextMonth.toString().padStart(2, '0')}-25`;
    } else {
      // Annual declarations
      if (type === 'D101') return `${period.year + 1}-03-31`;
      if (type === 'D200') return `${period.year + 1}-05-31`;
    }
    
    return '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return Clock;
      case 'generated': return FileText;
      case 'submitted': return Send;
      case 'approved': return CheckCircle;
      default: return Clock;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  const isDeadlineApproaching = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const isOverdue = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generare Declarații</TabsTrigger>
          <TabsTrigger value="history">Istoric Declarații</TabsTrigger>
          <TabsTrigger value="calendar">Calendar Obligații</TabsTrigger>
          <TabsTrigger value="print">Printare</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="space-y-6">
            {/* Setări perioada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Selectare Perioadă
                </CardTitle>
                <CardDescription>
                  Alege perioada pentru care vrei să generezi declarațiile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <Label htmlFor="month">Luna</Label>
                    <select
                      id="month"
                      value={currentPeriod.month}
                      onChange={(e) => setCurrentPeriod(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2024, i).toLocaleDateString('ro-RO', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="year">Anul</Label>
                    <select
                      id="year"
                      value={currentPeriod.year}
                      onChange={(e) => setCurrentPeriod(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value={2024}>2024</option>
                      <option value={2025}>2025</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista declarații disponibile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {declarationTypes
                .filter(decl => {
                  // Filtrare pe baza tipului de business
                  if (decl.category === 'pfa' && businessData?.business_type !== 'PFA') return false;
                  if (decl.category === 'social' && businessData?.employees_count === 0) return false;
                  return true;
                })
                .map((declaration) => {
                  const Icon = declaration.icon;
                  const existingDeclaration = declarations.find(d => 
                    d.type === declaration.code && 
                    d.period === `${currentPeriod.year}-${currentPeriod.month.toString().padStart(2, '0')}`
                  );
                  
                  return (
                    <Card key={declaration.code} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-8 w-8 text-primary" />
                              <div>
                                <h3 className="font-semibold">{declaration.code}</h3>
                                <p className="text-sm text-muted-foreground">{declaration.frequency === 'monthly' ? 'Lunară' : 'Anuală'}</p>
                              </div>
                            </div>
                            {existingDeclaration && (
                              <Badge className={getStatusColor(existingDeclaration.status)}>
                                {existingDeclaration.status === 'draft' && 'Ciornă'}
                                {existingDeclaration.status === 'generated' && 'Generată'}
                                {existingDeclaration.status === 'submitted' && 'Trimisă'}
                                {existingDeclaration.status === 'approved' && 'Aprobată'}
                              </Badge>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-1">{declaration.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{declaration.description}</p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Termen:</strong> {declaration.deadline}
                            </p>
                          </div>
                          
                          <Button 
                            className="w-full" 
                            onClick={() => generateDeclaration(declaration.code)}
                            disabled={isGenerating || (existingDeclaration?.status === 'submitted')}
                          >
                            {isGenerating ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Generez...
                              </>
                            ) : existingDeclaration ? (
                              existingDeclaration.status === 'submitted' ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Trimisă
                                </>
                              ) : (
                                <>
                                  <Calculator className="h-4 w-4 mr-2" />
                                  Regenerează
                                </>
                              )
                            ) : (
                              <>
                                <Calculator className="h-4 w-4 mr-2" />
                                Generează
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              }
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Istoric Declarații ({declarations.length})
              </CardTitle>
              <CardDescription>
                Vizualizează și gestionează declarațiile generate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {declarations.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nu ai încă declarații generate.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {declarations
                    .sort((a, b) => new Date(b.generated_at || b.deadline).getTime() - new Date(a.generated_at || a.deadline).getTime())
                    .map((declaration) => {
                      const declarationInfo = declarationTypes.find(d => d.code === declaration.type);
                      const StatusIcon = getStatusIcon(declaration.status);
                      const isUrgent = isDeadlineApproaching(declaration.deadline);
                      const overdue = isOverdue(declaration.deadline);
                      
                      return (
                        <Card key={declaration.id} className={`p-4 ${overdue ? 'border-red-500 bg-red-50' : isUrgent ? 'border-orange-500 bg-orange-50' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <StatusIcon className="h-6 w-6 text-primary" />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{declaration.type}</h4>
                                  <Badge className={getStatusColor(declaration.status)}>
                                    {declaration.status === 'draft' && 'Ciornă'}
                                    {declaration.status === 'generated' && 'Generată'}
                                    {declaration.status === 'submitted' && 'Trimisă'}
                                    {declaration.status === 'approved' && 'Aprobată'}
                                  </Badge>
                                  {overdue && <Badge variant="destructive">Întârziat</Badge>}
                                  {isUrgent && !overdue && <Badge variant="outline" className="border-orange-500 text-orange-700">Urgent</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">{declarationInfo?.name}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                  <span>Perioada: {declaration.period}</span>
                                  <span>Termen: {new Date(declaration.deadline).toLocaleDateString('ro-RO')}</span>
                                  {declaration.amount && <span>Sumă: {formatCurrency(declaration.amount)}</span>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              {declaration.file_url && (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => window.open(declaration.file_url, '_blank')}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {declaration.status === 'generated' && (
                                <Button size="sm" onClick={() => submitDeclaration(declaration.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Trimite la ANAF
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar Obligații Fiscale
              </CardTitle>
              <CardDescription>
                Urmărește termenele pentru declarațiile ANAF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Obligații urgente */}
                <div>
                  <h3 className="font-semibold mb-4 text-red-600">Obligații Urgente (următoarele 7 zile)</h3>
                  {declarations.filter(d => isDeadlineApproaching(d.deadline) || isOverdue(d.deadline)).length === 0 ? (
                    <p className="text-muted-foreground">Nu ai obligații urgente în următoarele 7 zile.</p>
                  ) : (
                    <div className="space-y-2">
                      {declarations
                        .filter(d => isDeadlineApproaching(d.deadline) || isOverdue(d.deadline))
                        .map(declaration => {
                          const declarationInfo = declarationTypes.find(dt => dt.code === declaration.type);
                          const overdue = isOverdue(declaration.deadline);
                          
                          return (
                            <Alert key={declaration.id} className={overdue ? 'border-red-500' : 'border-orange-500'}>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>{declaration.type}</strong> - {declarationInfo?.name}<br />
                                Termen: {new Date(declaration.deadline).toLocaleDateString('ro-RO')}
                                {declaration.amount && ` - Sumă: ${formatCurrency(declaration.amount)}`}
                                {overdue && <span className="text-red-600 font-semibold"> (ÎNTÂRZIAT)</span>}
                              </AlertDescription>
                            </Alert>
                          );
                        })
                      }
                    </div>
                  )}
                </div>
                
                {/* Calendar complet */}
                <div>
                  <h3 className="font-semibold mb-4">Toate Obligațiile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {declarationTypes.map(declaration => (
                      <Card key={declaration.code} className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <declaration.icon className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-semibold">{declaration.code}</h4>
                            <p className="text-sm text-muted-foreground">{declaration.frequency === 'monthly' ? 'Lunară' : 'Anuală'}</p>
                          </div>
                        </div>
                        <p className="text-sm mb-2">{declaration.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Termen:</strong> {declaration.deadline}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="print">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Printare Declarații ANAF
                </CardTitle>
                <CardDescription>
                  Printează sau descarcă declarațiile generate pentru ANAF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Printare oficială:</strong> Declarațiile printate pot fi depuse fizic la ANAF sau trimise prin poștă. 
                    Asigură-te că toate datele sunt corecte înainte de printare.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            
            <PrintManager businessId={businessId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ANAFDeclarations;