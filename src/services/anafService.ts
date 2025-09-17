/**
 * Serviciu pentru integrarea cu API-ul ANAF
 * Permite obținerea datelor companiei pe baza CIF-ului
 */

<<<<<<< HEAD
export interface AnafCompanyData {
=======
// Interfață pentru API-ul RO e-Factura (nou)
export interface AnafEFacturaData {
  cui: number;
  denumire: string;
  adresa: string;
  registru: string;
  categorie: string;
  dataInscriere: string;
  dataRenuntare?: string;
  dataRadiere?: string;
  dataOptiuneB2G?: string;
  stare: string;
}

// Interfață pentru API-ul TVA (vechi - backup)
export interface AnafTVAData {
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
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

<<<<<<< HEAD
export interface AnafResponse {
  cod: number;
  message: string;
  found: AnafCompanyData[];
=======
// Tip unificat pentru datele companiei
export type AnafCompanyData = AnafEFacturaData | AnafTVAData;

// Răspuns pentru API-ul RO e-Factura
export interface AnafEFacturaResponse {
  found: AnafEFacturaData[];
  notFound: number[];
}

// Răspuns pentru API-ul TVA (backup)
export interface AnafTVAResponse {
  cod: number;
  message: string;
  found: AnafTVAData[];
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
  notfound: Array<{
    cui: string;
    data: string;
  }>;
}

class AnafService {
<<<<<<< HEAD
  private readonly baseUrl = '/api/anaf/tva';
  private readonly fallbackUrl = 'https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva';
=======
  // API principal - RO e-Factura (mai stabil)
  private readonly baseUrl = '/api/anaf/efactura';
  private readonly primaryUrl = 'https://webservicesp.anaf.ro/api/registruroefactura/v1/interogare';
  
  // API backup - TVA (în caz că primul nu funcționează)
  private readonly backupUrl = '/api/anaf/tva';
  private readonly fallbackUrl = 'https://webservicesp.anaf.ro/PlatitorTvaRest/api/v7/ws/tva';
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
  
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
<<<<<<< HEAD
=======
   * Folosește API-ul RO e-Factura ca principal și API-ul TVA ca backup
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
   */
  public async getCompanyData(cif: string, date?: string): Promise<AnafCompanyData | null> {
    try {
      if (!this.validateCif(cif)) {
        throw new Error('CIF invalid');
      }

      const normalizedCif = this.normalizeCif(cif);
      const checkDate = date || new Date().toISOString().split('T')[0];
      
<<<<<<< HEAD
      const requestBody = [
        {
          cui: parseInt(normalizedCif),
          data: checkDate
        }
      ];

      console.log('🔍 ANAF API Request:', { cif: normalizedCif, date: checkDate });

      let response;
      try {
        // Încearcă mai întâi proxy-ul local
        response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      } catch (proxyError) {
        console.warn('⚠️ Proxy not available, trying direct API:', proxyError.message);
        // Fallback la API-ul direct (va avea probleme CORS în browser)
        response = await fetch(this.fallbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }

      if (!response.ok) {
        throw new Error(`ANAF API Error: ${response.status} ${response.statusText}`);
      }

      const data: AnafResponse = await response.json();
      console.log('📊 ANAF API Response:', data);

      if (data.found && data.found.length > 0) {
        return data.found[0];
      }

      if (data.notfound && data.notfound.length > 0) {
        console.log('❌ Company not found in ANAF database');
        return null;
      }

      throw new Error('Răspuns neașteptat de la ANAF');
=======
      // Încearcă mai întâi API-ul RO e-Factura
      try {
        return await this.getCompanyDataFromEFactura(normalizedCif, checkDate);
      } catch (eFacturaError) {
        console.warn('⚠️ RO e-Factura API failed, trying TVA API:', eFacturaError.message);
        // Fallback la API-ul TVA
        return await this.getCompanyDataFromTVA(normalizedCif, checkDate);
      }
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
    } catch (error) {
      console.error('❌ ANAF Service Error:', error);
      throw error;
    }
  }

  /**
<<<<<<< HEAD
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
=======
   * Obține datele companiei din API-ul RO e-Factura
   */
  private async getCompanyDataFromEFactura(normalizedCif: string, checkDate: string): Promise<AnafEFacturaData | null> {
    const requestBody = [
      {
        cui: parseInt(normalizedCif),
        data: checkDate
      }
    ];

    console.log('🔍 ANAF RO e-Factura API Request:', { cif: normalizedCif, date: checkDate });

    let response;
    try {
      // Încearcă mai întâi proxy-ul local
      response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    } catch (proxyError) {
      console.warn('⚠️ Proxy not available, trying direct API:', proxyError.message);
      // Fallback la API-ul direct (va avea probleme CORS în browser)
      response = await fetch(this.primaryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    }

    if (!response.ok) {
      throw new Error(`ANAF RO e-Factura API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON response but got: ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    const data: AnafEFacturaResponse = await response.json();
    console.log('📊 ANAF RO e-Factura API Response:', data);

    if (data.found && data.found.length > 0) {
      return data.found[0];
    }

    if (data.notFound && data.notFound.length > 0) {
      console.log('❌ Company not found in ANAF RO e-Factura database');
      return null;
    }

    throw new Error('Răspuns neașteptat de la ANAF RO e-Factura');
  }

  /**
   * Obține datele companiei din API-ul TVA (backup)
   */
  private async getCompanyDataFromTVA(normalizedCif: string, checkDate: string): Promise<AnafTVAData | null> {
    const requestBody = [
      {
        cui: parseInt(normalizedCif),
        data: checkDate
      }
    ];

    console.log('🔍 ANAF TVA API Request (backup):', { cif: normalizedCif, date: checkDate });

    let response;
    try {
      // Încearcă mai întâi proxy-ul local
      response = await fetch(this.backupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    } catch (proxyError) {
      console.warn('⚠️ Backup proxy not available, trying direct API:', proxyError.message);
      // Fallback la API-ul direct (va avea probleme CORS în browser)
      response = await fetch(this.fallbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    }

    if (!response.ok) {
      throw new Error(`ANAF TVA API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON response but got: ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    const data: AnafTVAResponse = await response.json();
    console.log('📊 ANAF TVA API Response:', data);

    if (data.found && data.found.length > 0) {
      return data.found[0];
    }

    if (data.notfound && data.notfound.length > 0) {
      console.log('❌ Company not found in ANAF TVA database');
      return null;
    }

    throw new Error('Răspuns neașteptat de la ANAF TVA');
  }

  /**
   * Convertește datele ANAF în formatul aplicației
   * Funcționează cu ambele tipuri de API (RO e-Factura și TVA)
   */
  public convertToCompanyFormat(anafData: AnafCompanyData) {
    // Verifică dacă sunt date din API-ul RO e-Factura
    if ('registru' in anafData) {
      const eFacturaData = anafData as AnafEFacturaData;
      return {
        name: eFacturaData.denumire || '',
        cif: this.formatCif(eFacturaData.cui.toString()),
        regCom: eFacturaData.registru || '',
        address: {
          street: eFacturaData.adresa || '',
          city: '', // API-ul RO e-Factura nu oferă orașul separat
          county: '', // API-ul RO e-Factura nu oferă județul separat
          postalCode: ''
        },
        contact: {
          phone: '',
          email: '', // API-ul RO e-Factura nu oferă contact
          fax: ''
        },
        vatPayer: eFacturaData.stare === 'ACTIV',
        vatCollection: false, // Nu este disponibil în API-ul RO e-Factura
        isActive: eFacturaData.stare === 'ACTIV',
        caenCode: '', // Nu este disponibil în API-ul RO e-Factura
        legalForm: eFacturaData.categorie || '',
        registrationDate: eFacturaData.dataInscriere || ''
      };
    } else {
      // Date din API-ul TVA
      const tvaData = anafData as AnafTVAData;
      return {
        name: tvaData.denumire || '',
        cif: this.formatCif(tvaData.cui),
        regCom: tvaData.nrRegCom || '',
        address: {
          street: tvaData.adresa || '',
          city: '', // ANAF nu oferă orașul separat
          county: '', // ANAF nu oferă județul separat
          postalCode: tvaData.codPostal || ''
        },
        contact: {
          phone: tvaData.telefon || '',
          email: '', // ANAF nu oferă email
          fax: tvaData.fax || ''
        },
        vatPayer: tvaData.scpTVA || false,
        vatCollection: tvaData.tvainc || false,
        isActive: !tvaData.statusInactivi,
        caenCode: tvaData.cod_CAEN || '',
        legalForm: tvaData.forma_juridica || '',
        registrationDate: tvaData.data_inregistrare || ''
      };
    }
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
  }
}

export const anafService = new AnafService();
export default anafService;