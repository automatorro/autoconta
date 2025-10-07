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

  // Auto-calculate amounts
  React.useEffect(() => {
    const { netAmount, vatRate } = watchedValues;
    if (netAmount && vatRate) {
      const vatAmount = (netAmount * vatRate) / 100;
      const totalAmount = netAmount + vatAmount;
      form.setValue('vatAmount', Number(vatAmount.toFixed(2)));
      form.setValue('totalAmount', Number(totalAmount.toFixed(2)));
    }
  }, [watchedValues.netAmount, watchedValues.vatRate, form]);
  
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
        // Avertizăm dacă încrederea este scăzută
        if (typeof result.confidence === 'number' && result.confidence < 50) {
          toast({
            title: 'Încredere OCR scăzută',
            description: 'Rezultatele pot fi inexacte. Verifică și corectează manual câmpurile.'
          });
        }
        // Procesăm și validăm datele extrase
        const isValid = processOcrData(result);
        
        if (isValid) {
          toast({
            title: 'Extragere reușită',
            description: 'Datele au fost extrase și validate cu succes.'
          });
        } else {
          toast({
            title: 'Extragere parțială',
            description: 'Datele au fost extrase, dar există erori de validare. Verificați și corectați manual.'
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
                  <FormLabel>Număr Document</FormLabel>
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
                  <FormLabel>Data</FormLabel>
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
                  <FormLabel>Categorie</FormLabel>
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

          {/* Supplier Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Informații Furnizor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nume Furnizor</FormLabel>
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
                    <FormLabel>CIF Furnizor</FormLabel>
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
                    <FormLabel>Suma Netă</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                <Label>TVA Calculat</Label>
                <div className="p-2 bg-muted rounded text-sm font-medium">
                  {watchedValues.vatAmount?.toFixed(2) || '0.00'} {watchedValues.currency}
                </div>
              </div>

              <div>
                <Label>Total Calculat</Label>
                <div className="p-2 bg-muted rounded text-sm font-bold">
                  {watchedValues.totalAmount?.toFixed(2) || '0.00'} {watchedValues.currency}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descriere</FormLabel>
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