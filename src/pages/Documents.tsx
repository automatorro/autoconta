import React, { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentUploader } from '@/components/DocumentUploader';
import { DocumentCard } from '@/components/DocumentCard';
import { useAppStore } from '@/store/useAppStore';
import { useDocuments } from '@/hooks/useDocuments';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Documents = () => {
  const { getDocumentsByCategory } = useAppStore();
  const { documents, refreshDocuments } = useDocuments();
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'Toate categoriile' },
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: documents.length,
    unverified: documents.filter(d => !d.verified).length,
    thisMonth: documents.filter(d => {
      const docDate = new Date(d.date);
      const now = new Date();
      return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documente</h1>
          <p className="text-muted-foreground mt-1">
            Gestionează facturile, chitanțele și cheltuielile tale
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowUpload(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adaugă Document
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Documente</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Badge variant="outline">{stats.total}</Badge>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Neverificate</p>
              <p className="text-2xl font-bold text-amber-600">{stats.unverified}</p>
            </div>
            <Badge variant="secondary">{stats.unverified}</Badge>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Luna Aceasta</p>
              <p className="text-2xl font-bold text-green-600">{stats.thisMonth}</p>
            </div>
            <Badge variant="outline">{stats.thisMonth}</Badge>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Caută după descriere, furnizor sau număr document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-64">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Selectează categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Niciun document găsit</h3>
              <p className="text-sm mb-4">
                {documents.length === 0 
                  ? 'Începe prin a adăuga primul tău document.'
                  : 'Încearcă să modifici filtrele sau criteriile de căutare.'
                }
              </p>
              <Button onClick={() => setShowUpload(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adaugă Primul Document
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adaugă Document Nou</DialogTitle>
          </DialogHeader>
          <DocumentUploader onUploadComplete={() => {
            setShowUpload(false);
            refreshDocuments();
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;