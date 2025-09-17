import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  DollarSign,
  Calendar,
  Truck,
  Receipt
} from 'lucide-react';
import { BusinessEntity } from '@/types/business';
import { businessService } from '@/services/businessService';
import { useAuth } from '@/hooks/useAuth';
import BusinessSetupForm from '@/components/BusinessSetupForm';
import EmployeeManagement from '@/components/EmployeeManagement';
import DocumentCapture from '@/components/DocumentCapture';
import ANAFDeclarations from '@/components/ANAFDeclarations';
import ProfitDashboard from '@/components/ProfitDashboard';
import SagaCompatibility from '@/components/SagaCompatibility';
import AdvancedReporting from '@/components/AdvancedReporting';

export function Business() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<BusinessEntity[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessEntity | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    totalDocuments: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    pendingTaxes: 0,
    nextDeadline: null as string | null
  });

  useEffect(() => {
    if (user?.id) {
      loadBusinesses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBusiness) {
      loadDashboardStats();
    }
  }, [selectedBusiness]);

  const loadBusinesses = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await businessService.getBusinessEntities(user.id);
      setBusinesses(data);
      
      // Selectează prima entitate dacă există
      if (data.length > 0 && !selectedBusiness) {
        setSelectedBusiness(data[0]);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca entitățile de business.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    if (!selectedBusiness) return;
    
    try {
      // Simulare date pentru dashboard
      // În realitate, acestea ar veni din serviciile respective
      const stats = {
        totalEmployees: selectedBusiness.business_type === 'SRL_MANAGER_TRANSPORT' ? 5 : 0,
        totalDocuments: 12,
        monthlyRevenue: 15000,
        monthlyExpenses: 8500,
        pendingTaxes: 2300,
        nextDeadline: '2025-01-25' // Următoarea declarație ANAF
      };
      
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleBusinessCreated = (business: BusinessEntity) => {
    setBusinesses([business, ...businesses]);
    setSelectedBusiness(business);
    toast({
      title: "Succes",
      description: "Entitatea de business a fost configurată cu succes."
    });
  };

  const getBusinessTypeInfo = (type: string) => {
    switch (type) {
      case 'SRL_MANAGER_TRANSPORT':
        return {
          title: 'SRL cu Manager de Transport',
          icon: Building2,
          color: 'bg-blue-100 text-blue-800',
          description: 'Societate cu răspundere limitată cu Manager de Transport atestat'
        };
      case 'PFA':
        return {
          title: 'Persoană Fizică Autorizată',
          icon: Users,
          color: 'bg-green-100 text-green-800',
          description: 'Activitate independentă de transport'
        };
      case 'FLEET_DRIVER':
        return {
          title: 'Șofer în Flotă',
          icon: Truck,
          color: 'bg-orange-100 text-orange-800',
          description: 'Șofer angajat la o companie de transport'
        };
      default:
        return {
          title: 'Necunoscut',
          icon: FileText,
          color: 'bg-gray-100 text-gray-800',
          description: ''
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  const getComplianceStatus = () => {
    if (!selectedBusiness) return { status: 'unknown', message: 'Selectează o entitate' };
    
    const hasRequiredDocs = selectedBusiness.transport_license && 
                           (selectedBusiness.business_type !== 'SRL_MANAGER_TRANSPORT' || 
                            selectedBusiness.manager_transport_license);
    
    if (!hasRequiredDocs) {
      return { 
        status: 'warning', 
        message: 'Documentele obligatorii nu sunt complete' 
      };
    }
    
    return { 
      status: 'success', 
      message: 'Entitatea este configurată corect' 
    };
  };

  const complianceStatus = getComplianceStatus();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Se încarcă...</p>
          </div>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Bun venit în AutoConta!</h1>
            <p className="text-muted-foreground text-lg">
              Pentru a începe, configurează prima ta entitate de business
            </p>
          </div>
          
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Configurarea corectă a entității de business este esențială pentru 
              conformitatea fiscală și generarea declarațiilor ANAF.
            </AlertDescription>
          </Alert>
          
          <BusinessSetupForm onBusinessCreated={handleBusinessCreated} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestionare Business</h1>
            <p className="text-muted-foreground">
              Administrează entitățile de business, angajații și documentele
            </p>
          </div>
          
          {/* Selector entitate business */}
          {businesses.length > 1 && (
            <div className="mt-4 lg:mt-0">
              <select
                value={selectedBusiness?.id || ''}
                onChange={(e) => {
                  const business = businesses.find(b => b.id === e.target.value);
                  setSelectedBusiness(business || null);
                }}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.business_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status entitate curentă */}
        {selectedBusiness && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getBusinessTypeInfo(selectedBusiness.business_type).color}`}>
                    {React.createElement(getBusinessTypeInfo(selectedBusiness.business_type).icon, {
                      className: "h-6 w-6"
                    })}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{selectedBusiness.business_name}</h3>
                    <p className="text-muted-foreground mb-2">
                      {getBusinessTypeInfo(selectedBusiness.business_type).title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedBusiness.fiscal_code}</Badge>
                      {selectedBusiness.vat_payer && <Badge variant="secondary">Plătitor TVA</Badge>}
                      {selectedBusiness.micro_enterprise && <Badge variant="secondary">Microîntreprindere</Badge>}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    {complianceStatus.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      complianceStatus.status === 'success' ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {complianceStatus.message}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('setup')}
                  >
                    Configurează
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs principale */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Prezentare Generală</TabsTrigger>
            <TabsTrigger value="employees">Angajați</TabsTrigger>
            <TabsTrigger value="documents">Documente</TabsTrigger>
            <TabsTrigger value="reports">Rapoarte</TabsTrigger>
            <TabsTrigger value="setup">Configurare</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProfitDashboard businessId={selectedBusiness?.id || ''} />
          </TabsContent>

          <TabsContent value="employees">
            {selectedBusiness ? (
              selectedBusiness.business_type === 'SRL_MANAGER_TRANSPORT' ? (
                <EmployeeManagement businessId={selectedBusiness.id} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Gestionarea Angajaților</h3>
                    <p className="text-muted-foreground mb-4">
                      Această funcționalitate este disponibilă doar pentru SRL-urile cu Manager de Transport.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pentru PFA și șoferii în flotă, gestionarea se face prin modulul de documente și rapoarte.
                    </p>
                  </CardContent>
                </Card>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Selectează o entitate de business pentru a continua.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents">
            {selectedBusiness ? (
              <DocumentCapture 
                businessId={selectedBusiness.id}
                onDocumentAdded={() => loadDashboardStats()}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Selectează o entitate de business pentru a continua.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              {/* Advanced Reporting and Analytics */}
              <AdvancedReporting businessId={selectedBusiness?.id || ''} />
              
              {/* Declarații ANAF */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Declarații ANAF
                  </CardTitle>
                  <CardDescription>
                    Generează și gestionează declarațiile fiscale
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ANAFDeclarations businessId={selectedBusiness?.id || ''} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="setup">
            <div className="space-y-6">
              <BusinessSetupForm 
                existingBusiness={selectedBusiness || undefined}
                onBusinessCreated={(business) => {
                  loadBusinesses();
                  setSelectedBusiness(business);
                }}
              />
              
              {/* Compatibilitate Saga */}
              {selectedBusiness && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Compatibilitate cu Saga</h3>
                  <SagaCompatibility businessId={selectedBusiness.id} />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Business;