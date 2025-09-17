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
import type { BadgeInsert } from '@/types/accounting';

interface BadgeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BadgeForm({ onSuccess, onCancel }: BadgeFormProps) {
  const [formData, setFormData] = useState<BadgeInsert>({
    number: '',
    issue_date: new Date(),
    expiry_date: new Date(),
    platform: 'bolt',
    badge_type: 'driver'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueDateOpen, setIssueDateOpen] = useState(false);
  const [expiryDateOpen, setExpiryDateOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number) {
      toast.error('Vă rugăm să completați numărul ecusonului');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('badges')
        .insert(formData as BadgeInsert);

      if (error) throw error;

      toast.success('Ecusonul a fost adăugat cu succes');
      onSuccess?.();
    } catch (error) {
      console.error('Error saving badge:', error);
      toast.error('Eroare la salvarea ecusonului');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Ecuson</CardTitle>
        <CardDescription>
          Adăugați un nou ecuson pentru platformele de transport
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
              placeholder="Ex: ECU-123456"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platformă</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectați platforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bolt">Bolt</SelectItem>
                  <SelectItem value="uber">Uber</SelectItem>
                  <SelectItem value="free_now">Free Now</SelectItem>
                  <SelectItem value="clever">Clever</SelectItem>
                  <SelectItem value="other">Altă platformă</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge_type">Tipul Ecusonului</Label>
              <Select
                value={formData.badge_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, badge_type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectați tipul" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">Șofer</SelectItem>
                  <SelectItem value="vehicle">Vehicul</SelectItem>
                  <SelectItem value="company">Companie</SelectItem>
                  <SelectItem value="temporary">Temporar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Obținerii *</Label>
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
              {isSubmitting ? 'Se salvează...' : 'Salvează Ecusonul'}
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