import React from 'react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { FileText, Eye, Download, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Document } from '@/types/accounting';
import { supabase } from '@/integrations/supabase/client';

interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (documentId: string) => void;
  onView?: (document: Document) => void;
}

const categoryLabels: Record<string, string> = {
  combustibil: 'Combustibil',
  reparatii: 'Reparații',
  asigurari: 'Asigurări',
  spalatorie: 'Spălătorie',
  service: 'Service',
  consumabile: 'Consumabile',
  parcari: 'Parcări',
  amenzi: 'Amenzi',
  comisioane: 'Comisioane',
  altele: 'Altele'
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    combustibil: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    reparatii: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    asigurari: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    spalatorie: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    service: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    consumabile: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    parcari: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    amenzi: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    comisioane: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    altele: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  };
  return colors[category] || colors.altele;
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
  onView
}) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      // Export detaliile cheltuielii ca CSV, nu atașamentul
      const headers = [
        'ID', 'Tip', 'Număr', 'Data', 'Furnizor', 'CIF', 'Adresă',
        'Net', 'TVA', 'CotaTVA', 'Total', 'Monedă', 'Categorie', 'Descriere', 'VehiculID',
        'Verificat', 'Reconciliat'
      ];

      const values = [
        document.id,
        document.type,
        document.documentNumber,
        new Date(document.date).toISOString(),
        document.supplier.name,
        document.supplier.cif || '',
        document.supplier.address || '',
        String(document.amount.netAmount),
        String(document.amount.vatAmount),
        String(document.amount.vatRate),
        String(document.amount.totalAmount),
        document.currency,
        document.category,
        document.description || '',
        document.vehicleId || '',
        document.verified ? 'da' : 'nu',
        document.reconciled ? 'da' : 'nu'
      ];

      const escape = (val: string) => {
        const v = val ?? '';
        return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}` : v;
      };

      const csv = `${headers.join(',')}\n${values.map(v => escape(String(v))).join(',')}`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `cheltuiala_${document.documentNumber || document.id}.csv`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export reușit',
        description: 'Cheltuiala a fost descărcată ca CSV.'
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Exportul cheltuielii a eșuat.',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: document.currency
    }).format(amount);
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {document.documentNumber}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(document.date), 'dd MMM yyyy', { locale: ro })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {document.verified ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
          </div>
        </div>

        {/* Category and Amount */}
        <div className="space-y-2">
          <Badge className={getCategoryColor(document.category)} variant="secondary">
            {categoryLabels[document.category]}
          </Badge>
          
          <div className="text-right">
            <p className="text-lg font-semibold">
              {formatCurrency(document.amount.totalAmount)}
            </p>
            {document.amount.vatAmount > 0 && (
              <p className="text-xs text-muted-foreground">
                TVA: {formatCurrency(document.amount.vatAmount)}
              </p>
            )}
          </div>
        </div>

        {/* Supplier */}
        <div className="border-t pt-2">
          <p className="text-sm font-medium truncate">
            {document.supplier.name}
          </p>
          {document.supplier.cif && (
            <p className="text-xs text-muted-foreground">
              CIF: {document.supplier.cif}
            </p>
          )}
        </div>

        {/* Description */}
        {document.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {document.description}
          </p>
        )}

        {/* Status Badges */}
        <div className="flex gap-2 flex-wrap">
          {!document.verified && (
            <Badge variant="outline" className="text-xs">
              Neverificat
            </Badge>
          )}
          {!document.reconciled && (
            <Badge variant="outline" className="text-xs">
              Nereconciliat
            </Badge>
          )}
          {document.ocrData && (
            <Badge variant="outline" className="text-xs">
              OCR: {Math.round((document.ocrData.confidence || 0) * 100)}%
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onView?.(document)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit?.(document)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete?.(document.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};