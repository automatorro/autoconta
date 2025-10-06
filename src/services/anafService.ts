/**
 * Serviciu pentru integrarea cu API-ul ANAF
 * Permite obținerea datelor companiei pe baza CIF-ului
 */

export interface AnafCompanyData {
  cui: string;
  data: string;
  denumire: string;
  adresa: string;
  nrRegCom: string;
  telefon?: string;
  fax?: string;
  codPostal?: string;
  act?: string;
  stare_inregistrare?: string;
  data_inregistrare?: string;
  cod_CAEN?: string;
  iban?: string;
  statusRO_e_Factura?: boolean;
  organFiscalCompetent?: string;
  forma_de_proprietate?: string;
  forma_organizare?: string;
  forma_juridica?: string;
  // Informații TVA
  scpTVA?: boolean;
  perioade_TVA?: Array<{
    data_inceput_ScpTVA?: string;
    data_sfarsit_ScpTVA?: string;
  }>;
  // TVA la încasare
  tvainc?: boolean;
  perioade_TVA_inc?: Array<{
    data_inceput_tvainc?: string;
    data_sfarsit_tvainc?: string;
  }>;
  // Split TVA (istoric)
  splitTVA?: boolean;
  perioade_split_TVA?: Array<{
    data_inceput_split_TVA?: string;
    data_sfarsit_split_TVA?: string;
  }>;
  // Status inactiv
  dataInactivare?: string;
  dataReactivare?: string;
  dataRadiere?: string;
  statusInactivi?: boolean;
}

export interface AnafResponse {
  cod: number;
  message: string;
  found: AnafCompanyData[];
  notfound: Array<{
    cui: string;
    data: string;
  }>;
}

class AnafService {
  private readonly baseUrl = '/api/anaf/tva';
  private readonly fallbackUrl = 'https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva';
  
  /**
   * Normalizează CIF-ul pentru a fi compatibil cu API-ul ANAF
   */
  private normalizeCif(cif: string): string {
    // Elimină spațiile și caracterele speciale
    let normalizedCif = cif.replace(/[^0-9]/g, '');
    
    // Adaugă prefixul RO dacă nu există
    if (!cif.toUpperCase().startsWith('RO')) {
      normalizedCif = normalizedCif;
    }
    
    return normalizedCif;
  }

  /**
   * Validează formatul CIF-ului
   */
  public validateCif(cif: string): boolean {
    const normalizedCif = this.normalizeCif(cif);
    
    // CIF-ul trebuie să aibă între 2 și 10 cifre
    if (normalizedCif.length < 2 || normalizedCif.length > 10) {
      return false;
    }
    
    // Verifică dacă conține doar cifre
    return /^[0-9]+$/.test(normalizedCif);
  }

  /**
   * Formatează CIF-ul pentru afișare
   */
  public formatCif(cif: string): string {
    const normalizedCif = this.normalizeCif(cif);
    return `RO${normalizedCif}`;
  }

  /**
   * Obține datele companiei de la ANAF pe baza CIF-ului
   */
  public async getCompanyData(cif: string, date?: string): Promise<AnafCompanyData | null> {
    try {
      console.log('🔍 Input CIF received:', cif, 'Type:', typeof cif);
      
      if (!this.validateCif(cif)) {
        throw new Error('CIF invalid');
      }

      const normalizedCif = this.normalizeCif(cif);
      console.log('🔍 Searching ANAF for CIF:', normalizedCif);

      // Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');

      // Folosim supabase.functions.invoke în loc de fetch direct
      const { data, error } = await supabase.functions.invoke('anaf-search', {
        body: { cui: normalizedCif }
      });

      if (error) {
        console.error('❌ Edge Function Error:', error);
        throw new Error(`Eroare ANAF: ${error.message}`);
      }

      console.log('✅ ANAF Response:', data);

      if (data.found && data.found.length > 0) {
        return data.found[0];
      }

      if (data.notfound && data.notfound.length > 0) {
        console.log('❌ Company not found in ANAF database');
        return null;
      }

      throw new Error('Răspuns neașteptat de la ANAF');
    } catch (error) {
      console.error('❌ ANAF Service Error:', error);
      throw error;
    }
  }

  /**
   * Convertește datele ANAF în formatul aplicației
   */
  public convertToCompanyFormat(anafData: AnafCompanyData) {
    return {
      name: anafData.denumire || '',
      cif: this.formatCif(anafData.cui),
      regCom: anafData.nrRegCom || '',
      address: {
        street: anafData.adresa || '',
        city: '', // ANAF nu oferă orașul separat
        county: '', // ANAF nu oferă județul separat
        postalCode: anafData.codPostal || ''
      },
      contact: {
        phone: anafData.telefon || '',
        email: '', // ANAF nu oferă email
        fax: anafData.fax || ''
      },
      vatPayer: anafData.scpTVA || false,
      vatCollection: anafData.tvainc || false,
      isActive: !anafData.statusInactivi,
      caenCode: anafData.cod_CAEN || '',
      legalForm: anafData.forma_juridica || '',
      registrationDate: anafData.data_inregistrare || ''
    };
  }
}

export const anafService = new AnafService();
export default anafService;