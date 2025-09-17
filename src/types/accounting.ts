// Types pentru aplicația de contabilitate Uber/Bolt România

export interface Company {
  id: string;
  name: string;
  cif: string;
  cnp?: string;
  type: 'PFA' | 'SRL';
  vatPayer: boolean;
  vatIntraCommunity?: string;
  address: {
    street: string;
    city: string;
    county: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  plateNumber: string;
  year: number;
  vin?: string;
  documents: {
    itp: DocumentExpiry;
    rca: DocumentExpiry;
    casco?: DocumentExpiry;
    uberBadge?: DocumentExpiry;
    boltBadge?: DocumentExpiry;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  id: string;
  name: string;
  cnp: string;
  licenseNumber: string;
  certificates: {
    professionalAttestation: DocumentExpiry;
    medicalCertificate: DocumentExpiry;
  };
  vehicleIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentExpiry {
  documentNumber: string;
  issueDate: Date;
  expiryDate: Date;
  filePath?: string;
  reminderSent?: Date;
}

export interface Document {
  id: string;
  type: 'invoice' | 'receipt' | 'expense';
  documentNumber: string;
  date: Date;
  supplier: {
    name: string;
    cif: string;
    address?: string;
  };
  amount: {
    netAmount: number;
    vatAmount: number;
    totalAmount: number;
    vatRate: number;
  };
  currency: 'RON' | 'EUR' | 'USD';
  category: ExpenseCategory;
  description: string;
  filePath: string;
  ocrData?: OCRData;
  verified: boolean;
  vehicleId?: string;
  reconciled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OCRData {
  confidence: number;
  extractedText: string;
  fields: {
    cif?: string;
    amount?: number;
    date?: string;
    supplier?: string;
  };
  corrections?: Record<string, any>;
}

export interface Transaction {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  amount: number;
  vatAmount: number;
  description: string;
  category: string;
  documentId?: string;
  platformSource?: 'uber' | 'bolt';
  reconciled: boolean;
  vehicleId?: string;
  createdAt: Date;
}

export interface PlatformReport {
  id: string;
  platform: 'uber' | 'bolt';
  reportType: 'weekly' | 'monthly' | 'payment';
  period: {
    startDate: Date;
    endDate: Date;
  };
  data: {
    grossAmount: number;
    fees: number;
    netAmount: number;
    rides: number;
    adjustments?: number;
    bonuses?: number;
  };
  filePath: string;
  processed: boolean;
  createdAt: Date;
}

export interface TaxDeclaration {
  id: string;
  type: '212' | '301' | '394';
  period: {
    year: number;
    month?: number;
    quarter?: number;
  };
  data: Record<string, any>;
  status: 'draft' | 'ready' | 'submitted';
  filePath?: string;
  submittedAt?: Date;
  createdAt: Date;
}

export interface Alert {
  id: string;
  type: 'document_expiry' | 'tax_deadline' | 'threshold_exceeded' | 'reconciliation_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  entityId: string;
  entityType: 'vehicle' | 'driver' | 'document' | 'declaration';
  actionRequired: boolean;
  dismissed: boolean;
  createdAt: Date;
}

export type ExpenseCategory = 
  | 'combustibil'
  | 'reparatii'
  | 'asigurari'
  | 'spalatorie'
  | 'service'
  | 'consumabile'
  | 'parcari'
  | 'amenzi'
  | 'comisioane'
  | 'altele';

export interface AppState {
  user: {
    company: Company | null;
    vehicles: Vehicle[];
    drivers: Driver[];
  };
  documents: Document[];
  transactions: Transaction[];
  platformReports: PlatformReport[];
  declarations: TaxDeclaration[];
  alerts: Alert[];
  settings: {
    notifications: boolean;
    autoCategories: boolean;
    vatReporting: 'monthly' | 'quarterly';
    currency: 'RON';
    language: 'ro';
  };
}

export interface DashboardStats {
  currentMonth: {
    income: number;
    expenses: number;
    profit: number;
    rides: number;
    vatToCollect: number;
    vatToDeduct: number;
  };
  previousMonth: {
    income: number;
    expenses: number;
    profit: number;
    rides: number;
  };
  yearToDate: {
    income: number;
    expenses: number;
    profit: number;
    rides: number;
  };
  upcomingDeadlines: Array<{
    type: string;
    date: Date;
    description: string;
  }>;
<<<<<<< HEAD
}
=======
}

// Tipuri pentru conformitatea cu legislația română
export interface TransportAuthorization {
  id: string;
  userId: string;
  companyId: string;
  series: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  issuedToCompany: string;
  status: 'active' | 'expired' | 'revoked';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertifiedCopy {
  id: string;
  userId: string;
  companyId: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  documentType: string;
  issuingAuthority?: string;
  status: 'active' | 'expired' | 'revoked';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  userId: string;
  companyId: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  platform: string;
  badgeType: string;
  status: 'active' | 'expired' | 'lost' | 'damaged';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VatRate {
  id: string;
  ratePercentage: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isDefault: boolean;
  description?: string;
  createdAt: Date;
}

// Tipuri pentru inserare în baza de date
export interface TransportAuthorizationInsert {
  series: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  issuedToCompany: string;
  status?: 'active' | 'expired' | 'revoked';
  notes?: string;
}

export interface CertifiedCopyInsert {
  number: string;
  issueDate: Date;
  expiryDate: Date;
  documentType: string;
  issuingAuthority?: string;
  status?: 'active' | 'expired' | 'revoked';
  notes?: string;
}

export interface BadgeInsert {
  number: string;
  issueDate: Date;
  expiryDate: Date;
  platform: string;
  badgeType: string;
  status?: 'active' | 'expired' | 'lost' | 'damaged';
  notes?: string;
}

// Tipuri pentru actualizare
export interface TransportAuthorizationUpdate {
  series?: string;
  number?: string;
  issueDate?: Date;
  expiryDate?: Date;
  issuedToCompany?: string;
  status?: 'active' | 'expired' | 'revoked';
  notes?: string;
}

export interface CertifiedCopyUpdate {
  number?: string;
  issueDate?: Date;
  expiryDate?: Date;
  documentType?: string;
  issuingAuthority?: string;
  status?: 'active' | 'expired' | 'revoked';
  notes?: string;
}

export interface BadgeUpdate {
  number?: string;
  issueDate?: Date;
  expiryDate?: Date;
  platform?: string;
  badgeType?: string;
  status?: 'active' | 'expired' | 'lost' | 'damaged';
  notes?: string;
}

// Tipuri pentru platformele de transport
export type TransportPlatform = 
  | 'Uber'
  | 'Bolt'
  | 'FreeNow'
  | 'Clever'
  | 'Star Taxi'
  | 'Speed Taxi'
  | 'Altele';

// Tipuri pentru tipurile de ecusoane
export type BadgeType = 
  | 'Șofer'
  | 'Vehicul'
  | 'Companie'
  | 'Temporar'
  | 'Permanent';

// Tipuri pentru tipurile de documente pentru copii conforme
export type DocumentType = 
  | 'Autorizație transport'
  | 'Certificat înmatriculare'
  | 'Asigurare RCA'
  | 'ITP'
  | 'Permis conducere'
  | 'Certificat fiscal'
  | 'Altele';
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
