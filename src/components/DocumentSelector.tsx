import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, FileText } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';

interface DocumentSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (documentId: string) => void;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  open,
  onOpenChange,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { documents } = useDocuments();
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (documents) {
      setFilteredDocuments(
        documents.filter(doc => 
          doc.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, documents]);

  const handleSelect = (documentId: string) => {
    onSelect(documentId);
    onOpenChange(false);
  };

  // Formatare dată
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  };

  // Formatare sumă
  const formatAmount = (amount: number) => {
    return amount.toFixed(2) + ' RON';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Selectează un document pentru asociere</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Caută după număr, furnizor sau descriere..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">Nr. document</th>
                <th className="p-2 text-left font-medium">Furnizor</th>
                <th className="p-2 text-left font-medium">Data</th>
                <th className="p-2 text-left font-medium">Sumă</th>
                <th className="p-2 text-left font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center">Nu s-au găsit documente</td>
                </tr>
              ) : (
                filteredDocuments.map(doc => (
                  <tr key={doc.id} className="border-b">
                    <td className="p-2">{doc.documentNumber}</td>
                    <td className="p-2">{doc.supplier?.name}</td>
                    <td className="p-2">{formatDate(doc.date.toString())}</td>
                    <td className="p-2">{formatAmount(doc.amount || 0)}</td>
                    <td className="p-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSelect(doc.id)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Selectează
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentSelector;