import { supabase } from '@/integrations/supabase/client';
import { VatRate } from '@/types/accounting';

/**
 * Serviciu pentru gestionarea ratelor TVA conform legislației române
 */
export class VatService {
  private static instance: VatService;
  private cachedRates: VatRate[] = [];
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 oră

  private constructor() {}

  public static getInstance(): VatService {
    if (!VatService.instance) {
      VatService.instance = new VatService();
    }
    return VatService.instance;
  }

  /**
   * Obține toate ratele TVA din baza de date
   */
  public async getAllVatRates(): Promise<VatRate[]> {
    try {
      const { data, error } = await supabase
        .from('vat_rates')
        .select('*')
        .order('effective_from', { ascending: false });

      if (error) {
        console.error('Eroare la obținerea ratelor TVA:', error);
        throw error;
      }

      return data.map(rate => ({
        id: rate.id,
        ratePercentage: rate.rate_percentage,
        effectiveFrom: new Date(rate.effective_from),
        effectiveTo: rate.effective_to ? new Date(rate.effective_to) : undefined,
        isDefault: rate.is_default,
        description: rate.description || undefined,
        createdAt: new Date(rate.created_at)
      }));
    } catch (error) {
      console.error('Eroare la obținerea ratelor TVA:', error);
      return [];
    }
  }

  /**
   * Obține rata TVA activă pentru o dată specificată
   */
  public async getActiveVatRate(targetDate: Date = new Date()): Promise<number> {
    try {
      // Verifică cache-ul
      if (this.shouldRefreshCache()) {
        await this.refreshCache();
      }

      // Caută rata activă în cache
      const activeRate = this.cachedRates.find(rate => {
        const effectiveFrom = rate.effectiveFrom;
        const effectiveTo = rate.effectiveTo;
        
        return effectiveFrom <= targetDate && 
               (!effectiveTo || effectiveTo >= targetDate);
      });

      if (activeRate) {
        return activeRate.ratePercentage;
      }

      // Dacă nu se găsește o rată activă, încearcă să folosească funcția din baza de date
      const { data, error } = await supabase
        .rpc('get_active_vat_rate', { 
          target_date: targetDate.toISOString().split('T')[0] 
        });

      if (error) {
        console.error('Eroare la obținerea ratei TVA active:', error);
        return this.getDefaultVatRate();
      }

      return data || this.getDefaultVatRate();
    } catch (error) {
      console.error('Eroare la obținerea ratei TVA active:', error);
      return this.getDefaultVatRate();
    }
  }

  /**
   * Obține rata TVA implicită
   */
  public getDefaultVatRate(): number {
    const defaultRate = this.cachedRates.find(rate => rate.isDefault);
    return defaultRate?.ratePercentage || 19; // Fallback la 19% dacă nu se găsește
  }

  /**
   * Obține rata TVA pentru perioada curentă (august 2025+)
   */
  public async getCurrentVatRate(): Promise<number> {
    const now = new Date();
    const august2025 = new Date('2025-08-01');
    
    if (now >= august2025) {
      return await this.getActiveVatRate(now);
    } else {
      return await this.getActiveVatRate(now);
    }
  }

  /**
   * Verifică dacă cache-ul trebuie reîmprospătat
   */
  private shouldRefreshCache(): boolean {
    if (!this.lastFetch || this.cachedRates.length === 0) {
      return true;
    }
    
    const now = new Date();
    const timeDiff = now.getTime() - this.lastFetch.getTime();
    return timeDiff > this.CACHE_DURATION;
  }

  /**
   * Reîmprospătează cache-ul cu ratele TVA
   */
  private async refreshCache(): Promise<void> {
    this.cachedRates = await this.getAllVatRates();
    this.lastFetch = new Date();
  }

  /**
   * Calculează TVA-ul pe baza unei sume nete și a unei rate
   */
  public calculateVat(netAmount: number, vatRate?: number): { vatAmount: number; totalAmount: number } {
    const rate = vatRate || this.getDefaultVatRate();
    const vatAmount = (netAmount * rate) / 100;
    const totalAmount = netAmount + vatAmount;
    
    return {
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  }

  /**
   * Calculează suma netă din suma totală cu TVA inclus
   */
  public calculateNetFromTotal(totalAmount: number, vatRate?: number): { netAmount: number; vatAmount: number } {
    const rate = vatRate || this.getDefaultVatRate();
    const netAmount = totalAmount / (1 + rate / 100);
    const vatAmount = totalAmount - netAmount;
    
    return {
      netAmount: Math.round(netAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100
    };
  }

  /**
   * Obține opțiunile de rate TVA pentru formulare
   */
  public async getVatRateOptions(): Promise<Array<{ value: number; label: string; isActive: boolean }>> {
    const rates = await this.getAllVatRates();
    const now = new Date();
    
    // Adaugă ratele standard
    const standardRates = [0, 5, 9];
    const options = standardRates.map(rate => ({
      value: rate,
      label: `${rate}%`,
      isActive: true
    }));

    // Adaugă ratele din baza de date
    rates.forEach(rate => {
      const isActive = rate.effectiveFrom <= now && 
                      (!rate.effectiveTo || rate.effectiveTo >= now);
      
      // Evită duplicatele
      if (!options.find(opt => opt.value === rate.ratePercentage)) {
        options.push({
          value: rate.ratePercentage,
          label: `${rate.ratePercentage}%${rate.description ? ` (${rate.description})` : ''}`,
          isActive
        });
      }
    });

    return options.sort((a, b) => a.value - b.value);
  }

  /**
   * Verifică dacă o rată TVA este validă pentru o dată specificată
   */
  public async isVatRateValid(rate: number, targetDate: Date = new Date()): Promise<boolean> {
    const rates = await this.getAllVatRates();
    const validRate = rates.find(r => 
      r.ratePercentage === rate &&
      r.effectiveFrom <= targetDate &&
      (!r.effectiveTo || r.effectiveTo >= targetDate)
    );
    
    return !!validRate || [0, 5, 9].includes(rate);
  }
}

// Export singleton instance
export const vatService = VatService.getInstance();