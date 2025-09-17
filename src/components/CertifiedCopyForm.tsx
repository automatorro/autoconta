import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CertifiedCopyInsert } from '@/types/accounting';

interface CertifiedCopyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CertifiedCopyForm({ onSuccess, onCancel }: CertifiedCopyFormProps) {
  const [formData, setFormData] = useState<Partial<CertifiedCopyInsert>>({
    number: '',
    issue_date: new Date(),
    expiry_date: new Date(),
    document_type: 'driving_license'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueDateOpen, setIssueDateOpen] = useState(false);
  const [expiryDateOpen, setExpiryDateOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number) {
      toast.error('Vă rugăm să completați numărul copiei conforme');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('certified_copies')
        .insert(formData as CertifiedCopyInsert);

      if (error) throw error;

      toast.success('Copia conformă a fost adăugată cu succes');
      onSuccess?.();
    } catch (error) {
      console.error('Error saving certified copy:', error);
      toast.error('Eroare la salvarea copiei conforme');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Copie Conformă</CardTitle>
        <CardDescription>
          Adăugați o nouă copie conformă pentru documentele necesare
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Număr *</Label>
            <Input
              id="number"
              value={formData.number || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              placeholder="Ex: CC-123456"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_type">Tipul Documentului</Label>
            <Select
              value={formData.document_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectați tipul documentului" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driving_license">Permis de Conducere</SelectItem>
                <SelectItem value="id_card">Carte de Identitate</SelectItem>
                <SelectItem value="passport">Pașaport</SelectItem>
                <SelectItem value="vehicle_registration">Certificat de Înmatriculare</SelectItem>
                <SelectItem value="insurance">Asigurare</SelectItem>
                <SelectItem value="other">Altul</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Emiterii *</Label>
              <Popover open={issueDateOpen} onOpenChange={setIssueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.issue_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issue_date ? format(formData.issue_date, "dd/MM/yyyy") : "Selectați data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.issue_date}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, issue_date: date }));
                      setIssueDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Expirării *</Label>
              <Popover open={expiryDateOpen} onOpenChange={setExpiryDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expiry_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiry_date ? format(formData.expiry_date, "dd/MM/yyyy") : "Selectați data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expiry_date}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, expiry_date: date }));
                      setExpiryDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Se salvează...' : 'Salvează Copia Conformă'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Anulează
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}