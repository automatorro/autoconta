import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Save, X, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import type { ExpenseCategory } from '@/types/accounting';
import { useOCR } from '@/hooks/useOCR';
import type { OCRResult } from '@/services/ocrService';
import { useBusinessSetup } from '@/hooks/useBusinessSetup';
import { BusinessSetupModal } from '@/components/BusinessSetupModal';

const documentSchema = z.object({
  type: z.enum(['invoice', 'receipt', 'expense']),
  documentNumber: z.string().min(1, 'Numărul documentului este obligatoriu'),
  date: z.date(),
  supplierName: z.string().min(1, 'Numele furnizorului este obligatoriu'),
  supplierCif: z.string().min(1, 'CIF-ul furnizorului este obligatoriu'),
  supplierAddress: z.string().optional(),
  netAmount: z.number().min(0, 'Suma netă trebuie să fie pozitivă'),
  vatAmount: z.number().min(0, 'TVA trebuie să fie pozitivă'),
  totalAmount: z.number().min(0, 'Suma totală trebuie să fie pozitivă'),
  vatRate: z.number().min(0).max(100, 'Cota TVA trebuie să fie între 0 și 100'),
  currency: z.enum(['RON', 'EUR', 'USD']),
  category: z.string().min(1, 'Categoria este obligatorie'),
  description: z.string().min(1, 'Descrierea este obligatorie'),
  vehicleId: z.string().optional()
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  file: File;
  ocrData?: OCRResult | null;
  fileId?: string;
  onSave: (documentId: string) => void;
  onCancel: () => void;
}

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: 'combustibil', label: 'Combustibil' },
  { value: 'reparatii', label: 'Reparații' },
  { value: 'asigurari', label: 'Asigurări' },
  { value: 'spalatorie', label: 'Spălătorie' },
  { value: 'service', label: 'Service' },
  { value: 'consumabile', label: 'Consumabile' },
  { value: 'parcari', label: 'Parcări' },
  { value: 'amenzi', label: 'Amenzi' },
  { value: 'comisioane', label: 'Comisioane' },
  { value: 'altele', label: 'Altele' }
];

export const DocumentForm: React.FC<DocumentFormProps> = ({
  file,
  ocrData,
  fileId,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const { authUser, addDocument, vehicles, getActiveCompany } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const { processImage, isProcessing } = useOCR();
  const { isBusinessSetupComplete, isLoading: isCheckingSetup } = useBusinessSetup();
  const [showBusinessSetupModal, setShowBusinessSetupModal] = useState(false);
  const [rawOcrText, setRawOcrText] = useState<string>('');
  const [ocrConfidenceScores, setOcrConfidenceScores] = useState<Record<string, number>>({});
  const [lastAmountEdited, setLastAmountEdited] = useState<null | 'net' | 'total'>(null);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      type: 'expense',
      date: new Date(),
      currency: 'RON',
      vatRate: 21,
      netAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
      documentNumber: '',
      supplierName: '',
      supplierCif: '',
      supplierAddress: '',
      category: 'altele',
      description: ''
    }
  });

  const watchedValues = form.watch();
  const prefillAppliedRef = useRef(false);
  const draftLoadedRef = useRef(false);
  const draftKey = fileId ? `docDraft:${fileId}` : undefined;

  // Prefill form from OCR result if available
  useEffect(() => {
    if (!ocrData || prefillAppliedRef.current) return;

    // Dacă încrederea OCR este scăzută, avertizăm și nu precompletăm automat
    if (typeof ocrData.confidence === 'number' && ocrData.confidence < 50) {
      toast({
        title: 'Încredere OCR scăzută',
        description: 'Datele extrase pot fi inexacte. Verifică manual câmpurile.'
      });
      return;
    }

    if (ocrData.supplierName) form.setValue('supplierName', ocrData.supplierName);
    if (ocrData.supplierCif) {
      const cif = ocrData.supplierCif.toUpperCase();
      const cifRegex = /^RO?[0-9]{6,10}$/i;
      if (cifRegex.test(cif)) form.setValue('supplierCif', cif);
    }
    if (ocrData.documentNumber) form.setValue('documentNumber', ocrData.documentNumber);
    if (ocrData.date) {
      const d = new Date(ocrData.date);
      if (!isNaN(d.getTime())) form.setValue('date', d);
    }
    if (ocrData.totalAmount && ocrData.totalAmount > 0) form.setValue('totalAmount', Number(ocrData.totalAmount.toFixed(2)));
    if (ocrData.vatAmount !== undefined) form.setValue('vatAmount', Number((ocrData.vatAmount || 0).toFixed(2)));
    if (ocrData.netAmount && ocrData.netAmount > 0) form.setValue('netAmount', Number(ocrData.netAmount.toFixed(2)));
    if (ocrData.vatRate !== undefined) form.setValue('vatRate', Number(ocrData.vatRate));
    if (ocrData.category) form.setValue('category', ocrData.category);
    if (ocrData.description) form.setValue('description', ocrData.description);

    prefillAppliedRef.current = true;
    toast({
      title: 'Date OCR precompletate',
      description: 'Am populat automat câmpurile extrase din document.'
    });
  }, [ocrData, form, toast]);

  // Restore draft from localStorage (prioritar față de OCR), o singură dată
  useEffect(() => {
    if (!draftKey || draftLoadedRef.current) return;
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      // Setăm valorile existente din draft
      if (draft.type) form.setValue('type', draft.type);
      if (draft.documentNumber) form.setValue('documentNumber', draft.documentNumber);
      if (draft.date) {
        const d = new Date(draft.date);
        if (!isNaN(d.getTime())) form.setValue('date', d);
      }
      if (draft.supplierName) form.setValue('supplierName', draft.supplierName);
      if (draft.supplierCif) form.setValue('supplierCif', draft.supplierCif);
      if (draft.supplierAddress) form.setValue('supplierAddress', draft.supplierAddress);
      if (typeof draft.netAmount === 'number') form.setValue('netAmount', draft.netAmount);
      if (typeof draft.vatAmount === 'number') form.setValue('vatAmount', draft.vatAmount);
      if (typeof draft.totalAmount === 'number') form.setValue('totalAmount', draft.totalAmount);
      if (typeof draft.vatRate === 'number') form.setValue('vatRate', draft.vatRate);
      if (draft.currency) form.setValue('currency', draft.currency);
      if (draft.category) form.setValue('category', draft.category);
      if (draft.description) form.setValue('description', draft.description);
      if (draft.vehicleId) form.setValue('vehicleId', draft.vehicleId);

      draftLoadedRef.current = true;
      toast({
        title: 'Draft restaurat',
        description: 'Am încărcat automat draftul salvat pentru acest fișier.'
      });
    } catch (e) {
      console.warn('Nu s-a putut încărca draftul:', e);
    }
  }, [draftKey, form, toast]);

  // Persist draft on changes
  useEffect(() => {
    if (!draftKey) return;
    const subscription = form.watch((value) => {
      try {
        const payload = {
          ...value,
          // serializăm data în ISO pentru stocare
          date: value.date instanceof Date ? value.date.toISOString() : value.date
        };
        localStorage.setItem(draftKey, JSON.stringify(payload));
      } catch (e) {
        console.warn('Nu s-a putut salva draftul:', e);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, draftKey]);

  // Helper pentru rotunjire la 2 zecimale (numeric)
  const round2 = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

  // Auto-calculate amounts: suportă introducerea TOTALULUI sau a NETULUI
  React.useEffect(() => {
    const { netAmount, totalAmount, vatRate } = watchedValues;
    const rate = typeof vatRate === 'number' ? vatRate : 0;
    const r = rate / 100;

    if (rate >= 0) {
      if (lastAmountEdited === 'total' && typeof totalAmount === 'number' && totalAmount >= 0) {
        // Calcul din total: net = total / (1 + r); tva = total - net
        const netCalc = r > -1 ? totalAmount / (1 + r) : totalAmount; // protecție
        const vatCalc = totalAmount - netCalc;
        form.setValue('netAmount', round2(netCalc));
        form.setValue('vatAmount', round2(vatCalc));
      } else if (lastAmountEdited === 'net' && typeof netAmount === 'number' && netAmount >= 0) {
        // Calcul din net: tva = net * r; total = net + tva
        const vatCalc = netAmount * r;
        const totalCalc = netAmount + vatCalc;
        form.setValue('vatAmount', round2(vatCalc));
        form.setValue('totalAmount', round2(totalCalc));
      } else {
        // Fallback: dacă avem total și rată, preferăm calcul din total; altfel din net
        if (typeof totalAmount === 'number' && totalAmount >= 0) {
          const netCalc = r > -1 ? totalAmount / (1 + r) : totalAmount;
          const vatCalc = totalAmount - netCalc;
          form.setValue('netAmount', round2(netCalc));
          form.setValue('vatAmount', round2(vatCalc));
        } else if (typeof netAmount === 'number' && netAmount >= 0) {
          const vatCalc = netAmount * r;
          const totalCalc = netAmount + vatCalc;
          form.setValue('vatAmount', round2(vatCalc));
          form.setValue('totalAmount', round2(totalCalc));
        }
      }
    }
  }, [watchedValues.netAmount, watchedValues.totalAmount, watchedValues.vatRate, lastAmountEdited, form]);
  
  // Validare date OCR
  const validateOcrData = (ocrData: any) => {
    const validationResults = {
      isValid: true,
      warnings: [] as string[],
      errors: [] as string[]
    };
    
    // Validare CIF furnizor
    if (ocrData.supplier?.cui) {
      const cifRegex = /^RO?[0-9]{6,10}$/i;
      if (!cifRegex.test(ocrData.supplier.cui)) {
        validationResults.warnings.push(`CIF-ul furnizorului (${ocrData.supplier.cui}) pare invalid.`);
        validationResults.isValid = false;
      }
    }
    
    // Validare număr document
    if (ocrData.documentNumber) {
      const invoiceRegex = /^[A-Z0-9]{2,}-?[0-9]{1,}$/i;
      if (!invoiceRegex.test(ocrData.documentNumber)) {
        validationResults.warnings.push(`Numărul documentului (${ocrData.documentNumber}) pare invalid.`);
      }
    }
    
    // Validare sumă totală
    if (ocrData.total) {
      if (ocrData.total <= 0) {
        validationResults.errors.push('Suma totală trebuie să fie pozitivă.');
        validationResults.isValid = false;
      }
    }
    
    // Validare dată
    if (ocrData.date) {
      const docDate = new Date(ocrData.date);
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      
      if (docDate > now) {
        validationResults.errors.push('Data documentului nu poate fi în viitor.');
        validationResults.isValid = false;
      } else if (docDate < oneYearAgo) {
        validationResults.warnings.push('Documentul este mai vechi de un an.');
      }
    }
    
    return validationResults;
  };
  
  // Procesare și validare date OCR
  const processOcrData = (ocrData: any) => {
    // Validăm datele extrase
    const validation = validateOcrData(ocrData);
    
    // Afișăm avertismente și erori
    if (validation.warnings.length > 0) {
      toast({
        title: 'Avertismente la validarea datelor',
        description: validation.warnings.join('\n')
      });
    }
    
    if (validation.errors.length > 0) {
      toast({
        title: 'Erori la validarea datelor',
        description: validation.errors.join('\n'),
        variant: 'destructive'
      });
      return false;
    }
    
    // Completăm formularul cu datele validate
    if (ocrData.supplier?.name) form.setValue('supplierName', ocrData.supplier.name);
    if (ocrData.supplier?.cui) form.setValue('supplierCif', ocrData.supplier.cui);
    if (ocrData.documentNumber) form.setValue('documentNumber', ocrData.documentNumber);
    if (ocrData.date) form.setValue('date', new Date(ocrData.date));
    if (ocrData.total) form.setValue('totalAmount', parseFloat(ocrData.total));
    if (ocrData.vat) form.setValue('vatAmount', parseFloat(ocrData.vat));
    if (ocrData.category) form.setValue('category', ocrData.category);
    
    // Calculăm suma netă din total și TVA
    if (ocrData.total && ocrData.vat) {
      const netAmount = parseFloat(ocrData.total) - parseFloat(ocrData.vat);
      form.setValue('netAmount', parseFloat(netAmount.toFixed(2)));
      
      // Calculăm cota de TVA
      if (netAmount > 0) {
        const vatRate = (parseFloat(ocrData.vat) / netAmount) * 100;
        form.setValue('vatRate', parseFloat(vatRate.toFixed(0)));
      }
    }
    
    return validation.isValid;
  };

  const handleOcrExtraction = async () => {
    try {
      setIsLoading(true);
      const result = await processImage(file);
      
      if (result) {
        console.log('🔍 OCR Result:', result);
        
        // Salvăm textul brut OCR
        setRawOcrText(result.extractedText || '');
        
        // Calculăm confidence pentru fiecare câmp
        const confidenceScores: Record<string, number> = {
          supplierName: result.supplierName && result.supplierName.length > 3 ? 80 : 0,
          supplierCif: result.supplierCif && result.supplierCif.length > 5 ? 85 : 0,
          documentNumber: result.documentNumber && result.documentNumber.length > 0 ? 75 : 0,
          date: result.date ? 70 : 0,
          totalAmount: result.totalAmount && result.totalAmount > 0 ? 90 : 0,
          vatAmount: result.vatAmount !== undefined ? 85 : 0,
          netAmount: result.netAmount && result.netAmount > 0 ? 85 : 0,
          vatRate: result.vatRate !== undefined ? 80 : 0,
          category: result.category !== 'altele' ? 70 : 30,
          description: result.description && result.description.length > 5 ? 65 : 0
        };
        setOcrConfidenceScores(confidenceScores);
        
        // Pre-populăm câmpurile cu datele OCR
        if (result.supplierName) form.setValue('supplierName', result.supplierName);
        if (result.supplierCif) form.setValue('supplierCif', result.supplierCif);
        if (result.documentNumber) form.setValue('documentNumber', result.documentNumber);
        if (result.date) {
          const d = new Date(result.date);
          if (!isNaN(d.getTime())) form.setValue('date', d);
        }
        if (result.totalAmount && result.totalAmount > 0) form.setValue('totalAmount', Number(result.totalAmount.toFixed(2)));
        if (result.vatAmount !== undefined) form.setValue('vatAmount', Number((result.vatAmount || 0).toFixed(2)));
        if (result.netAmount && result.netAmount > 0) form.setValue('netAmount', Number(result.netAmount.toFixed(2)));
        if (result.vatRate !== undefined) form.setValue('vatRate', Number(result.vatRate));
        if (result.category) form.setValue('category', result.category);
        if (result.description) form.setValue('description', result.description);
        
        // Afișăm toast cu rezultatul
        const avgConfidence = Object.values(confidenceScores).reduce((a, b) => a + b, 0) / Object.values(confidenceScores).filter(v => v > 0).length;
        
        if (avgConfidence < 50) {
          toast({
            title: '⚠️ Încredere OCR scăzută',
            description: `Confidence medie: ${avgConfidence.toFixed(0)}%. Verifică manual toate câmpurile.`
          });
        } else {
          toast({
            title: '✅ OCR Completat',
            description: `Datele au fost extrase cu ${avgConfidence.toFixed(0)}% încredere. Verifică corectitudinea.`
          });
        }
      } else {
        toast({
          title: 'Extragere eșuată',
          description: 'Nu s-au putut extrage date din document. Completați manual.'
        });
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
      toast({
        title: 'Eroare la extragerea datelor',
        description: error.message || 'A apărut o eroare la procesarea documentului.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: DocumentFormData) => {
    if (!authUser) return;

    // Check if business setup is complete before saving
    if (!isBusinessSetupComplete) {
      setShowBusinessSetupModal(true);
      return;
    }

    // Ensure an active company is selected for RLS insert policy
    const activeCompany = getActiveCompany();
    if (!activeCompany) {
      toast({
        title: 'Companie activă lipsă',
        description: 'Selectează sau configurează compania înainte de a salva documente.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get the file path from the uploaded file
      const fileName = `${authUser.id}/${Date.now()}-${file.name}`;
      
      // Insert document into database
      const { data: documentData, error } = await supabase
        .from('documents')
        .insert({
          user_id: authUser.id,
          company_id: activeCompany.id,
          type: data.type,
          document_number: data.documentNumber,
          date: data.date.toISOString(),
          supplier_name: data.supplierName,
          supplier_cif: data.supplierCif,
          supplier_address: data.supplierAddress,
          net_amount: data.netAmount,
          vat_amount: data.vatAmount,
          total_amount: data.totalAmount,
          vat_rate: data.vatRate,
          currency: data.currency,
          category: data.category,
          description: data.description,
          file_path: fileName,
          vehicle_id: data.vehicleId,
          verified: false,
          reconciled: false
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local store
      const newDocument = {
        id: documentData.id,
        type: data.type,
        documentNumber: data.documentNumber,
        date: data.date,
        supplier: {
          name: data.supplierName,
          cif: data.supplierCif,
          address: data.supplierAddress
        },
        amount: {
          netAmount: data.netAmount,
          vatAmount: data.vatAmount,
          totalAmount: data.totalAmount,
          vatRate: data.vatRate
        },
        currency: data.currency,
        category: data.category as ExpenseCategory,
        description: data.description,
        filePath: fileName,
        verified: false,
        vehicleId: data.vehicleId,
        reconciled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addDocument(newDocument);
      // Curățăm draftul din localStorage după salvare
      if (draftKey) {
        localStorage.removeItem(draftKey);
      }
      onSave(documentData.id);

    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva documentul. Încearcă din nou.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Detalii Document</h3>
          <p className="text-sm text-muted-foreground">
            Completează informațiile despre document
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={handleOcrExtraction}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {isProcessing ? 'Procesez...' : 'OCR Auto'}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* File Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-background rounded flex items-center justify-center">
                {file.type.startsWith('image/') ? (
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-xs font-medium">PDF</div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Document Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip Document</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează tipul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="invoice">Factură</SelectItem>
                      <SelectItem value="receipt">Chitanță</SelectItem>
                      <SelectItem value="expense">Cheltuială</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Number */}
            <FormField
              control={form.control}
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Număr Document
                    {ocrConfidenceScores.documentNumber > 0 && (
                      <Badge 
                        variant={ocrConfidenceScores.documentNumber > 70 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {ocrConfidenceScores.documentNumber}% încredere
                      </Badge>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: FAC-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Data
                    {ocrConfidenceScores.date > 0 && (
                      <Badge 
                        variant={ocrConfidenceScores.date > 70 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {ocrConfidenceScores.date}% încredere
                      </Badge>
                    )}
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ro })
                          ) : (
                            <span>Selectează data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        locale={ro}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Categorie
                    {ocrConfidenceScores.category > 0 && (
                      <Badge 
                        variant={ocrConfidenceScores.category > 70 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {ocrConfidenceScores.category}% încredere
                      </Badge>
                    )}
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Text OCR Brut - afișat dacă există */}
          {rawOcrText && (
            <Card className="p-4 bg-muted/50 border-primary/20">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  📄 Text OCR Original
                  <Badge variant="outline" className="text-xs">
                    Pentru copiere manuală
                  </Badge>
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(rawOcrText);
                    toast({ 
                      title: "✓ Text copiat!",
                      description: "Textul OCR a fost copiat în clipboard."
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  📋 Copiază tot
                </Button>
              </div>
              <ScrollArea className="h-[200px] w-full rounded-md border bg-background p-4">
                <pre className="text-xs whitespace-pre-wrap font-mono">{rawOcrText}</pre>
              </ScrollArea>
            </Card>
          )}

          {/* Supplier Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Informații Furnizor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Nume Furnizor
                      {ocrConfidenceScores.supplierName > 0 && (
                        <Badge 
                          variant={ocrConfidenceScores.supplierName > 70 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {ocrConfidenceScores.supplierName}% încredere
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: OMV Petrom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierCif"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      CIF Furnizor
                      {ocrConfidenceScores.supplierCif > 0 && (
                        <Badge 
                          variant={ocrConfidenceScores.supplierCif > 70 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {ocrConfidenceScores.supplierCif}% încredere
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: RO12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplierAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresă Furnizor (opțional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Adresa completă" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Informații Financiare</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="netAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Suma Netă
                      {ocrConfidenceScores.netAmount > 0 && (
                        <Badge 
                          variant={ocrConfidenceScores.netAmount > 70 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {ocrConfidenceScores.netAmount}% încredere
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          field.onChange(isNaN(val) ? 0 : round2(val));
                          setLastAmountEdited('net');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vatRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cotă TVA (%)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="9">9%</SelectItem>
                        <SelectItem value="21">21%</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monedă</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RON">RON</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  TVA Calculat
                  {ocrConfidenceScores.vatAmount > 0 && (
                    <Badge 
                      variant={ocrConfidenceScores.vatAmount > 70 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {ocrConfidenceScores.vatAmount}% încredere
                    </Badge>
                  )}
                </Label>
                <div className="p-2 bg-muted rounded text-sm font-medium">
                  {watchedValues.vatAmount?.toFixed(2) || '0.00'} {watchedValues.currency}
                </div>
              </div>

              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Total (bon/factură)
                      {ocrConfidenceScores.totalAmount > 0 && (
                        <Badge 
                          variant={ocrConfidenceScores.totalAmount > 70 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {ocrConfidenceScores.totalAmount}% încredere
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          field.onChange(isNaN(val) ? 0 : round2(val));
                          setLastAmountEdited('total');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Descriere
                  {ocrConfidenceScores.description > 0 && (
                    <Badge 
                      variant={ocrConfidenceScores.description > 70 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {ocrConfidenceScores.description}% încredere
                    </Badge>
                  )}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descrierea documentului..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vehicle Selection */}
          {vehicles.length > 0 && (
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicul Asociat (opțional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează vehiculul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Fără vehicul asociat</SelectItem>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} - {vehicle.plateNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Se salvează...' : 'Salvează Document'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Anulează
            </Button>
          </div>
        </form>
      </Form>
      
      <BusinessSetupModal
        isOpen={showBusinessSetupModal}
        onClose={() => setShowBusinessSetupModal(false)}
      />
    </Card>
  );
};