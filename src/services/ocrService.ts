import Tesseract from 'tesseract.js';
import { ExpenseCategory } from '@/types/accounting';

export interface OCRResult {
  supplierName: string;
  supplierCif: string;
  documentNumber: string;
  date?: string;
  totalAmount?: number;
  netAmount?: number;
  vatAmount?: number;
  vatRate?: number;
  category: ExpenseCategory;
  description: string;
  confidence: number;
  extractedText: string;
}

// Romanian vendor patterns for categorization
const VENDOR_CATEGORIES: Record<ExpenseCategory, string[]> = {
  combustibil: ['OMV', 'PETROM', 'MOL', 'ROMPETROL', 'SHELL', 'LUKOIL', 'benzinarie', 'carburant', 'motorina', 'benzina'],
  reparatii: ['vulcanizare', 'piese auto', 'mecanica', 'reparatie', 'cauciuc', 'tinichigerie'],
  asigurari: ['asigurare', 'rca', 'casco', 'city insurance', 'omniasig', 'groupama'],
  spalatorie: ['spalatorie', 'car wash', 'detailing', 'curatenie auto'],
  service: ['service auto', 'service', 'revizie', 'schimb ulei', 'filtre', 'distributie'],
  consumabile: ['consumabile', 'ulei motor', 'filtre', 'becuri', 'stergatori', 'antigel'],
  parcari: ['parcare', 'parking', 'abonament parcare', 'taxa parcare'],
  amenzi: ['amenda', 'contraventie', 'politia rutiera', 'radar'],
  comisioane: ['comision', 'taxa', 'fee', 'uber', 'bolt', 'comision platforma'],
  altele: []
};

class OCRService {
  private worker: Tesseract.Worker | null = null;

  private async initializeWorker(): Promise<Tesseract.Worker> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('ron', 1, {
        logger: m => console.log(m)
      });
    }
    return this.worker;
  }

  async processImage(imageFile: File): Promise<OCRResult> {
    const worker = await this.initializeWorker();
    
    try {
      const { data } = await worker.recognize(imageFile);
      const extractedText = data.text;
      
      console.log('OCR Text extracted:', extractedText);
      
      return this.parseRomanianReceipt(extractedText);
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to process image with OCR');
    }
  }

  private parseRomanianReceipt(text: string): OCRResult {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const result: OCRResult = {
      supplierName: '',
      supplierCif: '',
      documentNumber: '',
      category: 'altele',
      description: '',
      confidence: 0,
      extractedText: text
    };

    // Extract CIF (Romanian tax ID)
    const cifPattern = /(?:CIF|C\.I\.F\.?|cod fiscal|CF)[:\s]*(?:RO\s*)?(\d{8,10})/i;
    const cifMatch = text.match(cifPattern);
    if (cifMatch) {
      result.supplierCif = `RO${cifMatch[1]}`;
    }

    // Extract supplier name (usually first meaningful line or after header keywords)
    const headerKeywords = ['bon fiscal', 'chitanta', 'factura', 'receipt'];
    let supplierLine = lines.find(line => 
      line.length > 3 && 
      !headerKeywords.some(keyword => line.toLowerCase().includes(keyword)) &&
      !/^\d/.test(line) && // Not starting with numbers
      !/^[*\-=+]/.test(line) // Not starting with symbols
    );
    
    if (supplierLine) {
      result.supplierName = supplierLine.replace(/[*\-=+]/g, '').trim();
    }

    // Extract document number
    const docNumberPattern = /(?:seria|nr|doc|document|bon)[:\s]*([A-Z0-9\-\/]+)/i;
    const docMatch = text.match(docNumberPattern);
    if (docMatch) {
      result.documentNumber = docMatch[1];
    }

    // Extract date
    const datePattern = /(\d{1,2})[\.\/\-](\d{1,2})[\.\/\-](\d{2,4})/;
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      let year = dateMatch[3];
      if (year.length === 2) {
        year = `20${year}`;
      }
      result.date = `${year}-${month}-${day}`;
    } else {
      // Year-first format: 2025-08-12 or 2025/08/12
      const ymdPattern = /(\d{4})[\.|\/\-](\d{1,2})[\.|\/\-](\d{1,2})/;
      const ymdMatch = text.match(ymdPattern);
      if (ymdMatch) {
        const year = ymdMatch[1];
        const month = ymdMatch[2].padStart(2, '0');
        const day = ymdMatch[3].padStart(2, '0');
        result.date = `${year}-${month}-${day}`;
      }
    }

    // Extract amounts
    const amounts = this.extractAmounts(text);
    Object.assign(result, amounts);

    // Categorize based on supplier name and text content
    result.category = this.categorizeExpense(result.supplierName, text);
    
    // Generate description
    result.description = this.generateDescription(result.category, result.supplierName);

    // Calculate confidence score
    result.confidence = this.calculateConfidence(result);

    return result;
  }

  private extractAmounts(text: string): Partial<OCRResult> {
    const amounts: Partial<OCRResult> = {};
    
    // Extract total amount (look for TOTAL, Total plata, DE PLATA)
    const totalPattern = /(?:total|total plata|de plata|suma)[:\s]*(\d+[,.]?\d*)/i;
    const totalMatch = text.match(totalPattern);
    if (totalMatch) {
      const raw = totalMatch[1];
      const normalized = raw.replace(/\s+/g, '').replace(/\./g, '').replace(',', '.');
      amounts.totalAmount = parseFloat(normalized);
    }

    // Extract VAT info
    const vatPattern = /(?:tva|t\.v\.a\.?)\s*(\d+)%[:\s]*(\d+[,.]?\d*)/i;
    const vatMatch = text.match(vatPattern);
    if (vatMatch) {
      amounts.vatRate = parseFloat(vatMatch[1]);
      const rawVat = vatMatch[2];
      const normalizedVat = rawVat.replace(/\s+/g, '').replace(/\./g, '').replace(',', '.');
      amounts.vatAmount = parseFloat(normalizedVat);
    }

    // Calculate net amount if we have total and VAT
    if (amounts.totalAmount && amounts.vatAmount) {
      amounts.netAmount = amounts.totalAmount - amounts.vatAmount;
    }

    // If no VAT found but we have total, assume it includes VAT at 21%
    if (amounts.totalAmount && !amounts.vatAmount) {
      amounts.vatRate = 21;
      amounts.netAmount = amounts.totalAmount / 1.21;
      amounts.vatAmount = amounts.totalAmount - amounts.netAmount;
    }

    return amounts;
  }

  private categorizeExpense(supplierName: string, text: string): ExpenseCategory {
    const content = `${supplierName} ${text}`.toLowerCase();
    
    for (const [category, keywords] of Object.entries(VENDOR_CATEGORIES)) {
      if (category === 'altele') continue;
      
      if (keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
        return category as ExpenseCategory;
      }
    }
    
    return 'altele';
  }

  private generateDescription(category: ExpenseCategory, supplierName: string): string {
    const descriptions: Record<ExpenseCategory, string> = {
      combustibil: `Combustibil ${supplierName}`,
      reparatii: `Reparație vehicul ${supplierName}`,
      asigurari: `Asigurare vehicul ${supplierName}`,
      spalatorie: `Spălătorie auto ${supplierName}`,
      service: `Service auto ${supplierName}`,
      consumabile: `Consumabile auto ${supplierName}`,
      parcari: `Parcare ${supplierName}`,
      amenzi: `Amendă ${supplierName}`,
      comisioane: `Comision ${supplierName}`,
      altele: `Cheltuială ${supplierName}`
    };

    return descriptions[category] || `Cheltuială ${supplierName}`;
  }

  private calculateConfidence(result: OCRResult): number {
    let score = 0;
    
    if (result.supplierName.length > 3) score += 25;
    if (result.supplierCif) score += 25;
    if (result.documentNumber) score += 20;
    if (result.totalAmount && result.totalAmount > 0) score += 20;
    if (result.date) score += 10;
    
    return Math.min(score, 100);
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();