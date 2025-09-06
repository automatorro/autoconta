import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Company, Vehicle, Driver, Document, Alert } from '@/types/accounting';

interface AppStore extends AppState {
  // Actions
  setCompany: (company: Company) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  addDriver: (driver: Driver) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  removeDriver: (id: string) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  addAlert: (alert: Alert) => void;
  dismissAlert: (id: string) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  
  // Computed values
  getActiveAlerts: () => Alert[];
  getExpiringDocuments: (days?: number) => Array<{
    type: string;
    entityName: string;
    expiryDate: Date;
    daysUntilExpiry: number;
  }>;
  getTotalIncome: (month?: number, year?: number) => number;
  getTotalExpenses: (month?: number, year?: number) => number;
}

const initialState: AppState = {
  user: {
    company: null,
    vehicles: [],
    drivers: []
  },
  documents: [],
  transactions: [],
  platformReports: [],
  declarations: [],
  alerts: [],
  settings: {
    notifications: true,
    autoCategories: true,
    vatReporting: 'monthly',
    currency: 'RON',
    language: 'ro'
  }
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Company actions
      setCompany: (company) => set((state) => ({
        user: { ...state.user, company }
      })),
      
      // Vehicle actions
      addVehicle: (vehicle) => set((state) => ({
        user: {
          ...state.user,
          vehicles: [...state.user.vehicles, vehicle]
        }
      })),
      
      updateVehicle: (id, updates) => set((state) => ({
        user: {
          ...state.user,
          vehicles: state.user.vehicles.map(vehicle =>
            vehicle.id === id ? { ...vehicle, ...updates } : vehicle
          )
        }
      })),
      
      removeVehicle: (id) => set((state) => ({
        user: {
          ...state.user,
          vehicles: state.user.vehicles.filter(vehicle => vehicle.id !== id)
        }
      })),
      
      // Driver actions
      addDriver: (driver) => set((state) => ({
        user: {
          ...state.user,
          drivers: [...state.user.drivers, driver]
        }
      })),
      
      updateDriver: (id, updates) => set((state) => ({
        user: {
          ...state.user,
          drivers: state.user.drivers.map(driver =>
            driver.id === id ? { ...driver, ...updates } : driver
          )
        }
      })),
      
      removeDriver: (id) => set((state) => ({
        user: {
          ...state.user,
          drivers: state.user.drivers.filter(driver => driver.id !== id)
        }
      })),
      
      // Document actions
      addDocument: (document) => set((state) => ({
        documents: [...state.documents, document]
      })),
      
      updateDocument: (id, updates) => set((state) => ({
        documents: state.documents.map(doc =>
          doc.id === id ? { ...doc, ...updates } : doc
        )
      })),
      
      removeDocument: (id) => set((state) => ({
        documents: state.documents.filter(doc => doc.id !== id)
      })),
      
      // Alert actions
      addAlert: (alert) => set((state) => ({
        alerts: [...state.alerts, alert]
      })),
      
      dismissAlert: (id) => set((state) => ({
        alerts: state.alerts.map(alert =>
          alert.id === id ? { ...alert, dismissed: true } : alert
        )
      })),
      
      // Settings actions
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      // Computed values
      getActiveAlerts: () => {
        const state = get();
        return state.alerts.filter(alert => !alert.dismissed);
      },
      
      getExpiringDocuments: (days = 30) => {
        const state = get();
        const now = new Date();
        const cutoffDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        const expiring: Array<{
          type: string;
          entityName: string;
          expiryDate: Date;
          daysUntilExpiry: number;
        }> = [];
        
        // Check vehicle documents
        state.user.vehicles.forEach(vehicle => {
          Object.entries(vehicle.documents).forEach(([docType, doc]) => {
            if (doc && 'expiryDate' in doc && doc.expiryDate <= cutoffDate) {
              const daysUntil = Math.ceil((doc.expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
              expiring.push({
                type: docType,
                entityName: `${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`,
                expiryDate: doc.expiryDate,
                daysUntilExpiry: daysUntil
              });
            }
          });
        });
        
        // Check driver documents
        state.user.drivers.forEach(driver => {
          Object.entries(driver.certificates).forEach(([certType, cert]) => {
            if (cert && 'expiryDate' in cert && cert.expiryDate <= cutoffDate) {
              const daysUntil = Math.ceil((cert.expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
              expiring.push({
                type: certType,
                entityName: driver.name,
                expiryDate: cert.expiryDate,
                daysUntilExpiry: daysUntil
              });
            }
          });
        });
        
        return expiring.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
      },
      
      getTotalIncome: (month, year) => {
        const state = get();
        const targetDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth());
        
        return state.transactions
          .filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transaction.type === 'income' &&
                   transactionDate.getMonth() === targetDate.getMonth() &&
                   transactionDate.getFullYear() === targetDate.getFullYear();
          })
          .reduce((total, transaction) => total + transaction.amount, 0);
      },
      
      getTotalExpenses: (month, year) => {
        const state = get();
        const targetDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth());
        
        return state.transactions
          .filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transaction.type === 'expense' &&
                   transactionDate.getMonth() === targetDate.getMonth() &&
                   transactionDate.getFullYear() === targetDate.getFullYear();
          })
          .reduce((total, transaction) => total + transaction.amount, 0);
      }
    }),
    {
      name: 'contauber-storage',
      version: 1,
    }
  )
);