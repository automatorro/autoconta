export interface BusinessEntity {
  id: string;
  user_id: string;
  business_type: 'SRL_MANAGER_TRANSPORT' | 'PFA' | 'FLEET_DRIVER';
  business_name: string;
  fiscal_code: string; // CUI pentru SRL, CNP pentru PFA
  registration_number?: string; // Nr. înregistrare la Registrul Comerțului
  transport_license?: string; // Licența de transport
  manager_transport_license?: string; // Atestatul Manager Transport
  address: string;
  phone: string;
  email: string;
  bank_account?: string;
  bank_name?: string;
  vat_payer: boolean;
  micro_enterprise: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  cnp: string;
  position: 'DRIVER' | 'MANAGER_TRANSPORT' | 'ADMIN';
  hire_date: string;
  salary: number;
  contract_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  business_id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  engine_capacity: number;
  fuel_type: 'DIESEL' | 'GASOLINE' | 'ELECTRIC' | 'HYBRID';
  vehicle_type: 'TRUCK' | 'VAN' | 'CAR' | 'TRAILER';
  max_weight: number;
  insurance_policy: string;
  insurance_expiry: string;
  itp_expiry: string;
  rca_expiry: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  business_id: string;
  employee_id?: string; // null pentru PFA
  license_number: string;
  license_categories: string[];
  license_expiry: string;
  medical_certificate_expiry: string;
  psycho_certificate_expiry: string;
  atestat_expiry?: string; // Pentru transport marfă
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  business_id: string;
  driver_id: string;
  vehicle_id: string;
  start_date: string;
  end_date?: string;
  start_location: string;
  end_location: string;
  distance_km: number;
  fuel_consumed?: number;
  fuel_cost?: number;
  toll_cost?: number;
  other_expenses?: number;
  revenue?: number;
  client_name?: string;
  invoice_number?: string;
  notes?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  business_id: string;
  trip_id?: string;
  vehicle_id?: string;
  category: 'FUEL' | 'MAINTENANCE' | 'INSURANCE' | 'TOLL' | 'PARKING' | 'FINE' | 'OTHER';
  amount: number;
  vat_amount?: number;
  description: string;
  receipt_url?: string;
  expense_date: string;
  deductible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Revenue {
  id: string;
  business_id: string;
  trip_id?: string;
  client_name: string;
  invoice_number?: string;
  amount: number;
  vat_amount?: number;
  description: string;
  invoice_date: string;
  payment_date?: string;
  payment_status: 'PENDING' | 'PAID' | 'OVERDUE';
  created_at: string;
  updated_at: string;
}

export interface TaxObligation {
  id: string;
  business_id: string;
  tax_type: 'INCOME_TAX' | 'VAT' | 'SOCIAL_CONTRIBUTIONS' | 'HEALTH_CONTRIBUTIONS' | 'UNEMPLOYMENT_CONTRIBUTIONS';
  period: string; // YYYY-MM format
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  declaration_file?: string;
  created_at: string;
  updated_at: string;
}

export interface SalaryPayment {
  id: string;
  business_id: string;
  employee_id: string;
  period: string; // YYYY-MM format
  gross_salary: number;
  net_salary: number;
  income_tax: number;
  social_contributions: number;
  health_contributions: number;
  unemployment_contributions: number;
  payment_date?: string;
  status: 'PENDING' | 'PAID';
  created_at: string;
  updated_at: string;
}

// Types pentru inserturi în baza de date
export type BusinessEntityInsert = Omit<BusinessEntity, 'id' | 'created_at' | 'updated_at'>;
export type EmployeeInsert = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;
export type DriverInsert = Omit<Driver, 'id' | 'created_at' | 'updated_at'>;
export type TripInsert = Omit<Trip, 'id' | 'created_at' | 'updated_at'>;
export type ExpenseInsert = Omit<Expense, 'id' | 'created_at' | 'updated_at'>;
export type RevenueInsert = Omit<Revenue, 'id' | 'created_at' | 'updated_at'>;
export type TaxObligationInsert = Omit<TaxObligation, 'id' | 'created_at' | 'updated_at'>;
export type SalaryPaymentInsert = Omit<SalaryPayment, 'id' | 'created_at' | 'updated_at'>;