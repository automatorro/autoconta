import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Calculator, 
  DollarSign, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Calendar,
  Users,
  Receipt
} from 'lucide-react';
import { Employee, SalaryPayment } from '@/types/business';
import { businessService } from '@/services/businessService';

interface SalaryCalculation {
  grossSalary: number;
  cas: number; // Contribuția asigurărilor sociale (25%)
  cass: number; // Contribuția asigurărilor sociale de sănătate (10%)
  impozit: number; // Impozitul pe venit (10%)
  netSalary: number;
  totalCost: number; // Cost total pentru angajator
  employerCAS: number; // Contribuția angajatorului CAS (25%)
  employerCASS: number; // Contribuția angajatorului CASS (10%)
  workAccidentInsurance: number; // Asigurarea de accidente de muncă (0.15-0.85%)
  unemploymentInsurance: number; // Asigurarea pentru șomaj (0.5%)
}

interface SalaryCalculatorProps {
  businessId: string;
  employees: Employee[];
  onSalaryCalculated?: (calculation: SalaryCalculation) => void;
}

export function SalaryCalculator({ businessId, employees, onSalaryCalculated }: SalaryCalculatorProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [grossSalary, setGrossSalary] = useState<number>(3000); // Salariul minim brut în România
  const [workingDays, setWorkingDays] = useState<number>(22);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [bonuses, setBonuses] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [calculation, setCalculation] = useState<SalaryCalculation | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(false);

  // Constante fiscale pentru 2024-2025
  const TAX_RATES = {
    EMPLOYEE_CAS: 0.25, // 25%
    EMPLOYEE_CASS: 0.10, // 10%
    INCOME_TAX: 0.10, // 10%
    EMPLOYER_CAS: 0.25, // 25%
    EMPLOYER_CASS: 0.10, // 10%
    WORK_ACCIDENT: 0.0015, // 0.15% (variază între 0.15% - 0.85%)
    UNEMPLOYMENT: 0.005, // 0.5%
    PERSONAL_DEDUCTION: 300 // Deducerea personală de bază
  };

  const MINIMUM_WAGE = 3000; // Salariul minim brut în România (2024)

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0]);
    }
  }, [employees]);

  useEffect(() => {
    if (selectedEmployee) {
      loadSalaryHistory();
    }
  }, [selectedEmployee]);

  useEffect(() => {
    calculateSalary();
  }, [grossSalary, workingDays, overtimeHours, bonuses, deductions]);

  const loadSalaryHistory = async () => {
    if (!selectedEmployee) return;
    
    try {
      // Simulare încărcare istoric salarii
      // În realitate, ar veni din businessService
      const history: SalaryPayment[] = [
        {
          id: '1',
          employee_id: selectedEmployee.id,
          business_id: businessId,
          gross_salary: 3500,
          net_salary: 2100,
          total_cost: 4550,
          payment_date: '2024-11-30',
          month: 11,
          year: 2024,
          created_at: '2024-11-30T10:00:00Z',
          updated_at: '2024-11-30T10:00:00Z'
        }
      ];
      setSalaryHistory(history);
    } catch (error) {
      console.error('Error loading salary history:', error);
    }
  };

  const calculateSalary = () => {
    if (grossSalary < MINIMUM_WAGE) {
      toast({
        title: "Atenție",
        description: `Salariul brut nu poate fi mai mic decât salariul minim (${MINIMUM_WAGE} RON).`,
        variant: "destructive"
      });
      return;
    }

    // Calculul salariului total cu ore suplimentare și bonusuri
    const overtimePay = (grossSalary / workingDays / 8) * overtimeHours * 1.5; // 50% majorare
    const totalGross = grossSalary + overtimePay + bonuses - deductions;

    // Contribuții angajat
    const cas = totalGross * TAX_RATES.EMPLOYEE_CAS;
    const cass = totalGross * TAX_RATES.EMPLOYEE_CASS;
    
    // Baza de calcul pentru impozit (după contribuții)
    const taxableIncome = Math.max(0, totalGross - cas - cass - TAX_RATES.PERSONAL_DEDUCTION);
    const impozit = taxableIncome * TAX_RATES.INCOME_TAX;
    
    // Salariul net
    const netSalary = totalGross - cas - cass - impozit;

    // Contribuții angajator
    const employerCAS = totalGross * TAX_RATES.EMPLOYER_CAS;
    const employerCASS = totalGross * TAX_RATES.EMPLOYER_CASS;
    const workAccidentInsurance = totalGross * TAX_RATES.WORK_ACCIDENT;
    const unemploymentInsurance = totalGross * TAX_RATES.UNEMPLOYMENT;

    // Costul total pentru angajator
    const totalCost = totalGross + employerCAS + employerCASS + workAccidentInsurance + unemploymentInsurance;

    const calc: SalaryCalculation = {
      grossSalary: totalGross,
      cas,
      cass,
      impozit,
      netSalary,
      totalCost,
      employerCAS,
      employerCASS,
      workAccidentInsurance,
      unemploymentInsurance
    };

    setCalculation(calc);
    onSalaryCalculated?.(calc);
  };

  const processSalary = async () => {
    if (!selectedEmployee || !calculation) return;

    try {
      setLoading(true);
      
      const salaryData = {
        employee_id: selectedEmployee.id,
        business_id: businessId,
        gross_salary: calculation.grossSalary,
        net_salary: calculation.netSalary,
        total_cost: calculation.totalCost,
        payment_date: new Date().toISOString().split('T')[0],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      };

      // Simulare salvare în baza de date
      // await businessService.createSalaryPayment(salaryData);
      
      toast({
        title: "Succes",
        description: `Salariul pentru ${selectedEmployee.full_name} a fost procesat cu succes.`
      });
      
      loadSalaryHistory();
    } catch (error) {
      console.error('Error processing salary:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut procesa salariul.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nu există angajați</h3>
          <p className="text-muted-foreground">
            Adaugă primul angajat pentru a putea calcula salariile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector angajat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculator Salarii
          </CardTitle>
          <CardDescription>
            Calculează salariile și obligațiile fiscale pentru angajați
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee">Selectează Angajatul</Label>
              <select
                id="employee"
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const employee = employees.find(emp => emp.id === e.target.value);
                  setSelectedEmployee(employee || null);
                }}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name} - {employee.position}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedEmployee && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nume:</span>
                    <p className="font-medium">{selectedEmployee.full_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Poziție:</span>
                    <p className="font-medium">{selectedEmployee.position}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CNP:</span>
                    <p className="font-medium">{selectedEmployee.cnp}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data angajării:</span>
                    <p className="font-medium">
                      {new Date(selectedEmployee.hire_date).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="history">Istoric</TabsTrigger>
          <TabsTrigger value="obligations">Obligații Fiscale</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input-uri pentru calcul */}
            <Card>
              <CardHeader>
                <CardTitle>Parametri Salariu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="grossSalary">Salariul Brut (RON)</Label>
                  <Input
                    id="grossSalary"
                    type="number"
                    value={grossSalary}
                    onChange={(e) => setGrossSalary(Number(e.target.value))}
                    min={MINIMUM_WAGE}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minim: {formatCurrency(MINIMUM_WAGE)}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="workingDays">Zile Lucrătoare</Label>
                  <Input
                    id="workingDays"
                    type="number"
                    value={workingDays}
                    onChange={(e) => setWorkingDays(Number(e.target.value))}
                    min={1}
                    max={31}
                  />
                </div>
                
                <div>
                  <Label htmlFor="overtimeHours">Ore Suplimentare</Label>
                  <Input
                    id="overtimeHours"
                    type="number"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(Number(e.target.value))}
                    min={0}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Majorare 50% pentru ore suplimentare
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="bonuses">Bonusuri (RON)</Label>
                  <Input
                    id="bonuses"
                    type="number"
                    value={bonuses}
                    onChange={(e) => setBonuses(Number(e.target.value))}
                    min={0}
                  />
                </div>
                
                <div>
                  <Label htmlFor="deductions">Rețineri (RON)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rezultatul calculului */}
            {calculation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Rezultatul Calculului
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Salariul brut */}
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Salariu Brut Total:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(calculation.grossSalary)}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  {/* Contribuții angajat */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">CONTRIBUȚII ANGAJAT</h4>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>CAS ({formatPercentage(TAX_RATES.EMPLOYEE_CAS)}):</span>
                      <span className="text-red-600">-{formatCurrency(calculation.cas)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>CASS ({formatPercentage(TAX_RATES.EMPLOYEE_CASS)}):</span>
                      <span className="text-red-600">-{formatCurrency(calculation.cass)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>Impozit ({formatPercentage(TAX_RATES.INCOME_TAX)}):</span>
                      <span className="text-red-600">-{formatCurrency(calculation.impozit)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Salariul net */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Salariu Net:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(calculation.netSalary)}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  {/* Costul total pentru angajator */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">CONTRIBUȚII ANGAJATOR</h4>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>CAS Angajator ({formatPercentage(TAX_RATES.EMPLOYER_CAS)}):</span>
                      <span className="text-orange-600">+{formatCurrency(calculation.employerCAS)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>CASS Angajator ({formatPercentage(TAX_RATES.EMPLOYER_CASS)}):</span>
                      <span className="text-orange-600">+{formatCurrency(calculation.employerCASS)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>Asig. Accidente ({formatPercentage(TAX_RATES.WORK_ACCIDENT)}):</span>
                      <span className="text-orange-600">+{formatCurrency(calculation.workAccidentInsurance)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>Asig. Șomaj ({formatPercentage(TAX_RATES.UNEMPLOYMENT)}):</span>
                      <span className="text-orange-600">+{formatCurrency(calculation.unemploymentInsurance)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Cost Total Angajator:</span>
                    <span className="text-xl font-bold text-red-600">
                      {formatCurrency(calculation.totalCost)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={processSalary} 
                    className="w-full mt-4"
                    disabled={loading || !selectedEmployee}
                  >
                    {loading ? 'Se procesează...' : 'Procesează Salariul'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Istoric Salarii
              </CardTitle>
              <CardDescription>
                Istoricul salariilor plătite pentru angajatul selectat
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salaryHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nu există istoric de salarii pentru acest angajat.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {salaryHistory.map((salary) => (
                    <div key={salary.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {new Date(salary.payment_date).toLocaleDateString('ro-RO', {
                              month: 'long',
                              year: 'numeric'
                            })}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Plătit pe {new Date(salary.payment_date).toLocaleDateString('ro-RO')}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {formatCurrency(salary.net_salary)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Brut:</span>
                          <p className="font-medium">{formatCurrency(salary.gross_salary)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net:</span>
                          <p className="font-medium text-green-600">{formatCurrency(salary.net_salary)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost Total:</span>
                          <p className="font-medium text-red-600">{formatCurrency(salary.total_cost)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="obligations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Obligații Fiscale și Sociale
              </CardTitle>
              <CardDescription>
                Informații despre obligațiile fiscale pentru angajatori
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Toate contribuțiile și impozitele trebuie plătite până în data de 25 a lunii următoare.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Contribuții Angajat</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>CAS (Pensii):</span>
                      <span className="font-medium">{formatPercentage(TAX_RATES.EMPLOYEE_CAS)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CASS (Sănătate):</span>
                      <span className="font-medium">{formatPercentage(TAX_RATES.EMPLOYEE_CASS)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impozit pe venit:</span>
                      <span className="font-medium">{formatPercentage(TAX_RATES.INCOME_TAX)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Contribuții Angajator</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>CAS Angajator:</span>
                      <span className="font-medium">{formatPercentage(TAX_RATES.EMPLOYER_CAS)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CASS Angajator:</span>
                      <span className="font-medium">{formatPercentage(TAX_RATES.EMPLOYER_CASS)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Asig. Accidente:</span>
                      <span className="font-medium">{formatPercentage(TAX_RATES.WORK_ACCIDENT)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Asig. Șomaj:</span>
                      <span className="font-medium">{formatPercentage(TAX_RATES.UNEMPLOYMENT)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-semibold">Declarații Obligatorii</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Declarația 112</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      Declarația privind obligațiile de plată la bugetul de stat
                    </p>
                    <Badge variant="outline">Lunar - până pe 25</Badge>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Declarația 394</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      Declarația nominală privind contribuțiile sociale
                    </p>
                    <Badge variant="outline">Lunar - până pe 25</Badge>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Registrul general de salarii</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      Evidența salariilor și contribuțiilor
                    </p>
                    <Badge variant="outline">Permanent</Badge>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Adeverințe de salarii</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      Pentru angajați la cerere
                    </p>
                    <Badge variant="outline">La cerere</Badge>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SalaryCalculator;