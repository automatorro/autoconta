import React, { useState } from 'react';
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
import { vatService } from '@/services/vatService';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import type { ExpenseCategory } from '@/types/accounting';
import { useOCR } from '@/hooks/useOCR';

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
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const { authUser, addDocument, vehicles } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const { processImage, isProcessing } = useOCR();

  const [vatRateOptions, setVatRateOptions] = React.useState<Array<{ value: number; label: string; isActive: boolean }>>([]);
  const [defaultVatRate, setDefaultVatRate] = React.useState<number>(19);

  // Încarcă opțiunile de rate TVA la montarea componentei
  React.useEffect(() => {
    const loadVatRates = async () => {
      try {
        const options = await vatService.getVatRateOptions();
        setVatRateOptions(options);
        
        const currentRate = await vatService.getCurrentVatRate();
        setDefaultVatRate(currentRate);
      } catch (error) {
        console.error('Eroare la încărcarea ratelor TVA:', error);
        // Fallback la opțiunile standard
        setVatRateOptions([
          { value: 0, label: '0%', isActive: true },
          { value: 5, label: '5%', isActive: true },
          { value: 9, label: '9%', isActive: true },
          { value: 19, label: '19%', isActive: true },
          { value: 20, label: '20% (din august 2025)', isActive: false }
        ]);
      }
    };
    
    loadVatRates();
  }, []);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      type: 'expense',
      date: new Date(),
      currency: 'RON',
      vatRate: defaultVatRate,
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

  // Auto-calculate amounts
  React.useEffect(() => {
    const { netAmount, vatRate } = watchedValues;
    if (netAmount && vatRate) {
      const calculation = vatService.calculateVat(netAmount, vatRate);
      form.setValue('vatAmount', calculation.vatAmount);
      form.setValue('totalAmount', calculation.totalAmount);
    }
  }, [watchedValues.netAmount, watchedValues.vatRate, form]);

  const handleOcrExtraction = async () => {
    try {
      const result = await processImage(file);
      
      if (result) {
        // Map OCR result to form fields
        if (result.supplierName) form.setValue('supplierName', result.supplierName);
        if (result.supplierCif) form.setValue('supplierCif', result.supplierCif);
        if (result.documentNumber) form.setValue('documentNumber', result.documentNumber);
        if (result.totalAmount) form.setValue('totalAmount', result.totalAmount);
        if (result.netAmount) form.setValue('netAmount', result.netAmount);
        if (result.vatAmount) form.setValue('vatAmount', result.vatAmount);
        if (result.vatRate) form.setValue('vatRate', result.vatRate);
        if (result.category) form.setValue('category', result.category);
        if (result.description) form.setValue('description', result.description);
        if (result.date) form.setValue('date', new Date(result.date));
      }
    } catch (error) {
      // Error handling is done in the useOCR hook
      console.error('OCR processing failed:', error);
    }
  };

  const onSubmit = async (data: DocumentFormData) => {
    if (!authUser) return;

    setIsLoading(true);
    try {
      // Get the file path from the uploaded file
      const fileName = `${authUser.id}/${Date.now()}-${file.name}`;
      
      // Insert document into database
      const { data: documentData, error } = await supabase
        .from('documents')
        .insert({
          user_id: authUser.id,
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
                        {vatRateOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value.toString()}
                            disabled={!option.isActive}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
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
    </Card>
  );
};