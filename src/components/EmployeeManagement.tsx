import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Users, Plus, Edit, Trash2, Calculator, FileText, AlertCircle, CheckCircle, DollarSign, Calendar } from 'lucide-react';
import { Employee, EmployeeInsert, SalaryPayment, SalaryPaymentInsert } from '@/types/business';
import { businessService } from '@/services/businessService';
import { useAuth } from '@/hooks/useAuth';
import SalaryCalculator from './SalaryCalculator';

interface EmployeeManagementProps {
  businessId: string;
}

export function EmployeeManagement({ businessId }: EmployeeManagementProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [activeTab, setActiveTab] = useState('employees');
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showSalaryDialog, setShowSalaryDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const [employeeForm, setEmployeeForm] = useState<EmployeeInsert>({
    business_id: businessId,
    first_name: '',
    last_name: '',
    cnp: '',
    position: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: 0,
    is_active: true,
    contract_type: 'FULL_TIME',
    phone: '',
    email: '',
    address: ''
  });

  const [salaryForm, setSalaryForm] = useState<SalaryPaymentInsert>({
    business_id: businessId,
    employee_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    base_salary: 0,
    overtime_hours: 0,
    overtime_rate: 0,
    bonuses: 0,
    deductions: 0,
    gross_amount: 0,
    tax_amount: 0,
    social_contributions: 0,
    net_amount: 0,
    payment_method: 'BANK_TRANSFER'
  });

  useEffect(() => {
    loadEmployees();
    loadSalaryPayments();
  }, [businessId]);

  const loadEmployees = async () => {
    try {
      const data = await businessService.getEmployees(businessId);
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadSalaryPayments = async () => {
    try {
      const data = await businessService.getSalaryPayments(businessId);
      setSalaryPayments(data);
    } catch (error) {
      console.error('Error loading salary payments:', error);
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingEmployee) {
        await businessService.updateEmployee(editingEmployee.id, employeeForm);
        toast({
          title: "Succes",
          description: "Angajatul a fost actualizat cu succes."
        });
      } else {
        await businessService.createEmployee(employeeForm);
        toast({
          title: "Succes",
          description: "Angajatul a fost adăugat cu succes."
        });
      }
      
      loadEmployees();
      setShowEmployeeDialog(false);
      resetEmployeeForm();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la salvarea angajatului.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Calculează automat sumele
      const overtimePay = salaryForm.overtime_hours * salaryForm.overtime_rate;
      const grossAmount = salaryForm.base_salary + overtimePay + salaryForm.bonuses - salaryForm.deductions;
      
      // Calculează taxele (simplificat - în realitate ar trebui să folosești calculele exacte ANAF)
      const taxAmount = grossAmount * 0.10; // Impozit 10%
      const socialContributions = grossAmount * 0.35; // Contribuții sociale ~35%
      const netAmount = grossAmount - taxAmount - socialContributions;
      
      const finalSalaryData = {
        ...salaryForm,
        gross_amount: grossAmount,
        tax_amount: taxAmount,
        social_contributions: socialContributions,
        net_amount: netAmount
      };
      
      await businessService.createSalaryPayment(finalSalaryData);
      toast({
        title: "Succes",
        description: "Plata salariului a fost înregistrată cu succes."
      });
      
      loadSalaryPayments();
      setShowSalaryDialog(false);
      resetSalaryForm();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la înregistrarea plății.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({
      business_id: businessId,
      first_name: '',
      last_name: '',
      cnp: '',
      position: '',
      hire_date: new Date().toISOString().split('T')[0],
      salary: 0,
      is_active: true,
      contract_type: 'FULL_TIME',
      phone: '',
      email: '',
      address: ''
    });
    setEditingEmployee(null);
  };

  const resetSalaryForm = () => {
    setSalaryForm({
      business_id: businessId,
      employee_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      base_salary: 0,
      overtime_hours: 0,
      overtime_rate: 0,
      bonuses: 0,
      deductions: 0,
      gross_amount: 0,
      tax_amount: 0,
      social_contributions: 0,
      net_amount: 0,
      payment_method: 'BANK_TRANSFER'
    });
    setSelectedEmployee(null);
  };

  const editEmployee = (employee: Employee) => {
    setEmployeeForm({
      business_id: employee.business_id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      cnp: employee.cnp,
      position: employee.position,
      hire_date: employee.hire_date,
      salary: employee.salary,
      is_active: employee.is_active,
      contract_type: employee.contract_type,
      phone: employee.phone || '',
      email: employee.email || '',
      address: employee.address || ''
    });
    setEditingEmployee(employee);
    setShowEmployeeDialog(true);
  };

  const deleteEmployee = async (employeeId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest angajat?')) return;
    
    try {
      await businessService.deleteEmployee(employeeId);
      toast({
        title: "Succes",
        description: "Angajatul a fost șters cu succes."
      });
      loadEmployees();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la ștergerea angajatului.",
        variant: "destructive"
      });
    }
  };

  const openSalaryDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSalaryForm({
      ...salaryForm,
      employee_id: employee.id,
      base_salary: employee.salary
    });
    setShowSalaryDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'Normă întreagă';
      case 'PART_TIME': return 'Normă parțială';
      case 'TEMPORARY': return 'Temporar';
      case 'INTERNSHIP': return 'Stagiu';
      default: return type;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER': return 'Transfer bancar';
      case 'CASH': return 'Numerar';
      case 'CHECK': return 'Cec';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">Angajați</TabsTrigger>
          <TabsTrigger value="calculator">Calculator Salarii</TabsTrigger>
          <TabsTrigger value="salaries">Istoric Salarii</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestionare Angajați
                  </CardTitle>
                  <CardDescription>
                    Administrează angajații companiei și contractele de muncă
                  </CardDescription>
                </div>
                <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={resetEmployeeForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adaugă Angajat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingEmployee ? 'Editează Angajat' : 'Adaugă Angajat Nou'}
                      </DialogTitle>
                      <DialogDescription>
                        Completează informațiile necesare pentru contractul de muncă
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">Prenume *</Label>
                          <Input
                            id="first_name"
                            value={employeeForm.first_name}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, first_name: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Nume *</Label>
                          <Input
                            id="last_name"
                            value={employeeForm.last_name}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, last_name: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cnp">CNP *</Label>
                          <Input
                            id="cnp"
                            value={employeeForm.cnp}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, cnp: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="position">Funcția *</Label>
                          <Input
                            id="position"
                            value={employeeForm.position}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                            placeholder="Ex: Șofer, Manager Transport, Contabil"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hire_date">Data Angajării *</Label>
                          <Input
                            id="hire_date"
                            type="date"
                            value={employeeForm.hire_date}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, hire_date: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="salary">Salariul de Bază (RON) *</Label>
                          <Input
                            id="salary"
                            type="number"
                            value={employeeForm.salary}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, salary: parseFloat(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="contract_type">Tipul Contractului *</Label>
                          <Select
                            value={employeeForm.contract_type}
                            onValueChange={(value: any) => setEmployeeForm({ ...employeeForm, contract_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FULL_TIME">Normă întreagă</SelectItem>
                              <SelectItem value="PART_TIME">Normă parțială</SelectItem>
                              <SelectItem value="TEMPORARY">Temporar</SelectItem>
                              <SelectItem value="INTERNSHIP">Stagiu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefon</Label>
                          <Input
                            id="phone"
                            value={employeeForm.phone}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={employeeForm.email}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adresa</Label>
                        <Input
                          id="address"
                          value={employeeForm.address}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_active"
                          checked={employeeForm.is_active}
                          onCheckedChange={(checked) => setEmployeeForm({ ...employeeForm, is_active: checked as boolean })}
                        />
                        <Label htmlFor="is_active">Angajat activ</Label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowEmployeeDialog(false)}>
                          Anulează
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Se salvează...' : (editingEmployee ? 'Actualizează' : 'Adaugă')}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {employees.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nu ai încă angajați înregistrați.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <Card key={employee.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              {employee.first_name} {employee.last_name}
                            </h4>
                            <Badge variant={employee.is_active ? "default" : "secondary"}>
                              {employee.is_active ? 'Activ' : 'Inactiv'}
                            </Badge>
                            <Badge variant="outline">
                              {getContractTypeLabel(employee.contract_type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Funcția:</strong> {employee.position}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>CNP:</strong> {employee.cnp}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Data angajării:</strong> {new Date(employee.hire_date).toLocaleDateString('ro-RO')}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            <strong>Salariu:</strong> {formatCurrency(employee.salary)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSalaryDialog(employee)}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Plată
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editEmployee(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteEmployee(employee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator">
          <SalaryCalculator 
            businessId={businessId}
            employees={employees}
            onSalaryCalculated={(calculation) => {
              // Callback pentru când se calculează un salariu
              console.log('Salary calculated:', calculation);
            }}
          />
        </TabsContent>

        <TabsContent value="salaries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Istoric Salarii
                  </CardTitle>
                  <CardDescription>
                    Vizualizează istoricul salariilor plătite
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Filtre și statistici */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Total Salarii Luna Curentă</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        salaryPayments
                          .filter(payment => {
                            const currentMonth = new Date().getMonth() + 1;
                            const currentYear = new Date().getFullYear();
                            const paymentDate = new Date(payment.payment_date);
                            return paymentDate.getMonth() + 1 === currentMonth && paymentDate.getFullYear() === currentYear;
                          })
                          .reduce((sum, payment) => sum + payment.net_amount, 0)
                      )}
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Angajați Plătiți</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {new Set(salaryPayments.map(p => p.employee_id)).size}
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Cost Total Angajator</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(
                        salaryPayments
                          .filter(payment => {
                            const currentMonth = new Date().getMonth() + 1;
                            const currentYear = new Date().getFullYear();
                            const paymentDate = new Date(payment.payment_date);
                            return paymentDate.getMonth() + 1 === currentMonth && paymentDate.getFullYear() === currentYear;
                          })
                          .reduce((sum, payment) => sum + payment.gross_amount + (payment.gross_amount * 0.35), 0)
                      )}
                    </p>
                  </Card>
                </div>
                
                {/* Lista salariilor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Istoric Plăți</h4>
                  </div>
                  
                  {salaryPayments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nu există salarii înregistrate încă.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Folosește calculatorul de salarii pentru a procesa primul salariu.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {salaryPayments
                        .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                        .map((payment) => {
                          const employee = employees.find(emp => emp.id === payment.employee_id);
                          return (
                            <div key={payment.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h5 className="font-semibold">
                                      {employee ? `${employee.first_name} ${employee.last_name}` : 'Angajat necunoscut'}
                                    </h5>
                                    <Badge variant="outline">{employee?.position}</Badge>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Data plății:</span>
                                      <p className="font-medium">
                                        {new Date(payment.payment_date).toLocaleDateString('ro-RO')}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Salariu brut:</span>
                                      <p className="font-medium">{formatCurrency(payment.gross_amount)}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Taxe + Contribuții:</span>
                                      <p className="font-medium text-red-600">
                                        -{formatCurrency(payment.tax_amount + payment.social_contributions)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Metoda plată:</span>
                                      <p className="font-medium">{getPaymentMethodLabel(payment.payment_method)}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(payment.net_amount)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Salariu net</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog pentru plata salariului */}
      <Dialog open={showSalaryDialog} onOpenChange={setShowSalaryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Înregistrează Plata Salariului</DialogTitle>
            <DialogDescription>
              {selectedEmployee && `Pentru: ${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSalarySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_date">Data Plății *</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={salaryForm.payment_date}
                  onChange={(e) => setSalaryForm({ ...salaryForm, payment_date: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_method">Metoda de Plată *</Label>
                <Select
                  value={salaryForm.payment_method}
                  onValueChange={(value: any) => setSalaryForm({ ...salaryForm, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">Transfer bancar</SelectItem>
                    <SelectItem value="CASH">Numerar</SelectItem>
                    <SelectItem value="CHECK">Cec</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_salary">Salariul de Bază (RON) *</Label>
                <Input
                  id="base_salary"
                  type="number"
                  step="0.01"
                  value={salaryForm.base_salary}
                  onChange={(e) => setSalaryForm({ ...salaryForm, base_salary: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="overtime_hours">Ore Suplimentare</Label>
                <Input
                  id="overtime_hours"
                  type="number"
                  step="0.5"
                  value={salaryForm.overtime_hours}
                  onChange={(e) => setSalaryForm({ ...salaryForm, overtime_hours: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overtime_rate">Tarif Oră Suplimentară (RON)</Label>
                <Input
                  id="overtime_rate"
                  type="number"
                  step="0.01"
                  value={salaryForm.overtime_rate}
                  onChange={(e) => setSalaryForm({ ...salaryForm, overtime_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bonuses">Bonusuri (RON)</Label>
                <Input
                  id="bonuses"
                  type="number"
                  step="0.01"
                  value={salaryForm.bonuses}
                  onChange={(e) => setSalaryForm({ ...salaryForm, bonuses: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deductions">Rețineri (RON)</Label>
                <Input
                  id="deductions"
                  type="number"
                  step="0.01"
                  value={salaryForm.deductions}
                  onChange={(e) => setSalaryForm({ ...salaryForm, deductions: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Previzualizare Calcul</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Salariu de bază:</span>
                  <span>{formatCurrency(salaryForm.base_salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ore suplimentare:</span>
                  <span>{formatCurrency(salaryForm.overtime_hours * salaryForm.overtime_rate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonusuri:</span>
                  <span>{formatCurrency(salaryForm.bonuses)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rețineri:</span>
                  <span>-{formatCurrency(salaryForm.deductions)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Brut total:</span>
                  <span>{formatCurrency(
                    salaryForm.base_salary + 
                    (salaryForm.overtime_hours * salaryForm.overtime_rate) + 
                    salaryForm.bonuses - 
                    salaryForm.deductions
                  )}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Taxe și contribuții (~45%):</span>
                  <span>-{formatCurrency(
                    (salaryForm.base_salary + 
                     (salaryForm.overtime_hours * salaryForm.overtime_rate) + 
                     salaryForm.bonuses - 
                     salaryForm.deductions) * 0.45
                  )}</span>
                </div>
                <div className="flex justify-between font-bold text-green-600">
                  <span>Net estimat:</span>
                  <span>{formatCurrency(
                    (salaryForm.base_salary + 
                     (salaryForm.overtime_hours * salaryForm.overtime_rate) + 
                     salaryForm.bonuses - 
                     salaryForm.deductions) * 0.55
                  )}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowSalaryDialog(false)}>
                Anulează
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Se înregistrează...' : 'Înregistrează Plata'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EmployeeManagement;