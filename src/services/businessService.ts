import { supabase } from '@/integrations/supabase/client';
import {
  BusinessEntity,
  BusinessEntityInsert,
  Employee,
  EmployeeInsert,
  Vehicle,
  VehicleInsert,
  Driver,
  DriverInsert,
  Trip,
  TripInsert,
  Expense,
  ExpenseInsert,
  Revenue,
  RevenueInsert,
  TaxObligation,
  TaxObligationInsert,
  SalaryPayment,
  SalaryPaymentInsert
} from '@/types/business';

class BusinessService {
  private static instance: BusinessService;

  public static getInstance(): BusinessService {
    if (!BusinessService.instance) {
      BusinessService.instance = new BusinessService();
    }
    return BusinessService.instance;
  }

  // ===== BUSINESS ENTITIES =====
  async createBusinessEntity(data: BusinessEntityInsert): Promise<BusinessEntity> {
    const { data: result, error } = await supabase
      .from('business_entities')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getBusinessEntities(userId: string): Promise<BusinessEntity[]> {
    const { data, error } = await supabase
      .from('business_entities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateBusinessEntity(id: string, data: Partial<BusinessEntityInsert>): Promise<BusinessEntity> {
    const { data: result, error } = await supabase
      .from('business_entities')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async deleteBusinessEntity(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_entities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== EMPLOYEES =====
  async createEmployee(data: EmployeeInsert): Promise<Employee> {
    const { data: result, error } = await supabase
      .from('employees')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getEmployees(businessId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('business_id', businessId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateEmployee(id: string, data: Partial<EmployeeInsert>): Promise<Employee> {
    const { data: result, error } = await supabase
      .from('employees')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async deactivateEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // ===== VEHICLES =====
  async createVehicle(data: VehicleInsert): Promise<Vehicle> {
    const { data: result, error } = await supabase
      .from('vehicles')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getVehicles(businessId: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('business_id', businessId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateVehicle(id: string, data: Partial<VehicleInsert>): Promise<Vehicle> {
    const { data: result, error } = await supabase
      .from('vehicles')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getVehiclesWithExpiringDocuments(businessId: string, daysAhead: number = 30): Promise<Vehicle[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('business_id', businessId)
      .eq('active', true)
      .or(`insurance_expiry.lte.${futureDate.toISOString().split('T')[0]},itp_expiry.lte.${futureDate.toISOString().split('T')[0]},rca_expiry.lte.${futureDate.toISOString().split('T')[0]}`);

    if (error) throw error;
    return data || [];
  }

  // ===== DRIVERS =====
  async createDriver(data: DriverInsert): Promise<Driver> {
    const { data: result, error } = await supabase
      .from('drivers')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getDrivers(businessId: string): Promise<Driver[]> {
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        employee:employees(*)
      `)
      .eq('business_id', businessId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateDriver(id: string, data: Partial<DriverInsert>): Promise<Driver> {
    const { data: result, error } = await supabase
      .from('drivers')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  // ===== TRIPS =====
  async createTrip(data: TripInsert): Promise<Trip> {
    const { data: result, error } = await supabase
      .from('trips')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getTrips(businessId: string, limit?: number): Promise<Trip[]> {
    let query = supabase
      .from('trips')
      .select(`
        *,
        driver:drivers(*),
        vehicle:vehicles(*)
      `)
      .eq('business_id', businessId)
      .order('start_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updateTrip(id: string, data: Partial<TripInsert>): Promise<Trip> {
    const { data: result, error } = await supabase
      .from('trips')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getTripsByPeriod(businessId: string, startDate: string, endDate: string): Promise<Trip[]> {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        driver:drivers(*),
        vehicle:vehicles(*)
      `)
      .eq('business_id', businessId)
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ===== EXPENSES =====
  async createExpense(data: ExpenseInsert): Promise<Expense> {
    const { data: result, error } = await supabase
      .from('expenses')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getExpenses(businessId: string, limit?: number): Promise<Expense[]> {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        trip:trips(*),
        vehicle:vehicles(*)
      `)
      .eq('business_id', businessId)
      .order('expense_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updateExpense(id: string, data: Partial<ExpenseInsert>): Promise<Expense> {
    const { data: result, error } = await supabase
      .from('expenses')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getExpensesByPeriod(businessId: string, startDate: string, endDate: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('business_id', businessId)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ===== REVENUES =====
  async createRevenue(data: RevenueInsert): Promise<Revenue> {
    const { data: result, error } = await supabase
      .from('revenues')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getRevenues(businessId: string, limit?: number): Promise<Revenue[]> {
    let query = supabase
      .from('revenues')
      .select(`
        *,
        trip:trips(*)
      `)
      .eq('business_id', businessId)
      .order('invoice_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updateRevenue(id: string, data: Partial<RevenueInsert>): Promise<Revenue> {
    const { data: result, error } = await supabase
      .from('revenues')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getRevenuesByPeriod(businessId: string, startDate: string, endDate: string): Promise<Revenue[]> {
    const { data, error } = await supabase
      .from('revenues')
      .select('*')
      .eq('business_id', businessId)
      .gte('invoice_date', startDate)
      .lte('invoice_date', endDate)
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ===== TAX OBLIGATIONS =====
  async createTaxObligation(data: TaxObligationInsert): Promise<TaxObligation> {
    const { data: result, error } = await supabase
      .from('tax_obligations')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getTaxObligations(businessId: string): Promise<TaxObligation[]> {
    const { data, error } = await supabase
      .from('tax_obligations')
      .select('*')
      .eq('business_id', businessId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updateTaxObligation(id: string, data: Partial<TaxObligationInsert>): Promise<TaxObligation> {
    const { data: result, error } = await supabase
      .from('tax_obligations')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  // ===== SALARY PAYMENTS =====
  async createSalaryPayment(data: SalaryPaymentInsert): Promise<SalaryPayment> {
    const { data: result, error } = await supabase
      .from('salary_payments')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getSalaryPayments(businessId: string): Promise<SalaryPayment[]> {
    const { data, error } = await supabase
      .from('salary_payments')
      .select(`
        *,
        employee:employees(*)
      `)
      .eq('business_id', businessId)
      .order('period', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateSalaryPayment(id: string, data: Partial<SalaryPaymentInsert>): Promise<SalaryPayment> {
    const { data: result, error } = await supabase
      .from('salary_payments')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  // ===== ANALYTICS & REPORTS =====
  async getMonthlyProfit(businessId: string, month: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('calculate_monthly_profit', {
        business_uuid: businessId,
        target_month: month
      });

    if (error) throw error;
    return data || 0;
  }

  async getTaxObligationsForMonth(businessId: string, month: string): Promise<{
    income_tax: number;
    vat_to_pay: number;
    social_contributions: number;
    health_contributions: number;
  }> {
    const { data, error } = await supabase
      .rpc('calculate_tax_obligations', {
        business_uuid: businessId,
        target_month: month
      });

    if (error) throw error;
    return data?.[0] || {
      income_tax: 0,
      vat_to_pay: 0,
      social_contributions: 0,
      health_contributions: 0
    };
  }

  async getDashboardStats(businessId: string): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
    activeTrips: number;
    pendingTaxes: number;
    expiringDocuments: number;
  }> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Calculează statisticile pentru luna curentă
    const [revenues, expenses, trips, taxObligations, expiringVehicles] = await Promise.all([
      this.getRevenuesByPeriod(businessId, `${currentMonth}-01`, `${currentMonth}-31`),
      this.getExpensesByPeriod(businessId, `${currentMonth}-01`, `${currentMonth}-31`),
      this.getTrips(businessId),
      this.getTaxObligations(businessId),
      this.getVehiclesWithExpiringDocuments(businessId)
    ]);

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalRevenue - totalExpenses;
    const activeTrips = trips.filter(t => t.status === 'IN_PROGRESS').length;
    const pendingTaxes = taxObligations.filter(t => t.status === 'PENDING').length;
    const expiringDocuments = expiringVehicles.length;

    return {
      totalRevenue,
      totalExpenses,
      profit,
      activeTrips,
      pendingTaxes,
      expiringDocuments
    };
  }

  // ===== SAGA COMPATIBILITY =====
  async exportToSaga(businessId: string, startDate: string, endDate: string): Promise<{
    revenues: Revenue[];
    expenses: Expense[];
    trips: Trip[];
  }> {
    const [revenues, expenses, trips] = await Promise.all([
      this.getRevenuesByPeriod(businessId, startDate, endDate),
      this.getExpensesByPeriod(businessId, startDate, endDate),
      this.getTripsByPeriod(businessId, startDate, endDate)
    ]);

    return { revenues, expenses, trips };
  }
}

export const businessService = BusinessService.getInstance();
export default businessService;