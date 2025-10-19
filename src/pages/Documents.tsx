import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentUploader } from '@/components/DocumentUploader';
import { DocumentForm } from '@/components/DocumentForm';
import { DocumentCard } from '@/components/DocumentCard';
import { useAppStore } from '@/store/useAppStore';
import { useDocuments } from '@/hooks/useDocuments';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Document } from '@/types/accounting';
import { useLocation } from 'react-router-dom';

const Documents = () => {
  const { getDocumentsByCategory, removeDocument, updateDocument } = useAppStore();
  const { documents, refreshDocuments } = useDocuments();
  const { toast } = useToast();
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('altele');
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('upload')) {
      setShowUpload(true);
    }
  }, [location.search]);

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

  const handleView = async (doc: Document) => {
    try {
      if (!doc.filePath) {
        toast({ title: 'Eroare', description: 'Document fără fișier atașat', variant: 'destructive' });
        return;
      }
      const { data, error } = await supabase.storage.from('documents').createSignedUrl(doc.filePath, 60);
      if (error || !data?.signedUrl) throw error || new Error('URL semnat indisponibil');
      setViewerUrl(data.signedUrl);
    } catch (e) {
      toast({ title: 'Eroare', description: 'Nu s-a putut deschide documentul', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const doc = documents.find(d => d.id === id);
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      removeDocument(id);
      // Opțional: șterge fișierul din storage dacă există
      if (doc?.filePath) {
        await supabase.storage.from('documents').remove([doc.filePath]);
      }
      toast({ title: 'Șters', description: 'Documentul a fost șters.' });
    } catch (e) {
      toast({ title: 'Eroare', description: 'Nu s-a putut șterge documentul', variant: 'destructive' });
    }
  };

  const openEdit = (doc: Document) => {
    setEditingDoc(doc);
    setEditDescription(doc.description || '');
    setEditCategory(doc.category || 'altele');
  };

  const openDetails = (doc: Document) => {
    setViewingDoc(doc);
  };

  const saveEdit = async () => {
    if (!editingDoc) return;
    try {
      const { error } = await supabase
        .from('documents')
        .update({ description: editDescription, category: editCategory })
        .eq('id', editingDoc.id);
      if (error) throw error;
      updateDocument(editingDoc.id, { description: editDescription, category: editCategory as any });
      toast({ title: 'Salvat', description: 'Documentul a fost actualizat.' });
      setEditingDoc(null);
    } catch (e) {
      toast({ title: 'Eroare', description: 'Nu s-a putut salva modificarea', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
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
            <DocumentCard
              key={document.id}
              document={document}
              onView={() => setEditingDoc(document)}
              onDelete={handleDelete}
              onEdit={openEdit}
            />
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
        <DialogContent className="max-w-2xl max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adaugă Document Nou</DialogTitle>
          </DialogHeader>
          <DocumentUploader onUploadComplete={() => {
            setShowUpload(false);
            refreshDocuments();
          }} />
        </DialogContent>
      </Dialog>

      {/* Viewer Dialog */}
      <Dialog open={!!viewerUrl} onOpenChange={() => setViewerUrl(null)}>
        <DialogContent className="max-w-3xl max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vizualizare Document</DialogTitle>
          </DialogHeader>
          {viewerUrl && (
            <iframe src={viewerUrl} className="w-full h-[65svh] sm:h-[70vh]" />
          )}
        </DialogContent>
      </Dialog>

      {/* Expense Details Dialog */}
      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalii Cheltuială</DialogTitle>
          </DialogHeader>
          {viewingDoc && (
            <Dialog open={true} onOpenChange={() => setViewingDoc(null)}>
              <DialogContent className="sm:max-w-[700px] max-h-[90svh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detalii cheltuială</DialogTitle>
                  <DialogDescription>
                    Vezi informațiile cheltuielii și atașamentul dacă este necesar.
                  </DialogDescription>
                </DialogHeader>
            
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-muted-foreground">Tip</div>
                      <div className="font-medium">{viewingDoc.type}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Număr</div>
                      <div className="font-medium">{viewingDoc.documentNumber}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Data</div>
                      <div className="font-medium">{new Date(viewingDoc.date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Monedă</div>
                      <div className="font-medium">{viewingDoc.currency}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Categorie</div>
                      <div className="font-medium">{viewingDoc.category}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Vehicul</div>
                      <div className="font-medium">{viewingDoc.vehicleId || '-'}</div>
                    </div>
                  </div>
            
                  <div>
                    <div className="text-muted-foreground">Furnizor</div>
                    <div className="font-medium">{viewingDoc.supplier?.name}</div>
                    {viewingDoc.supplier?.cif && (
                      <div className="text-muted-foreground">CIF: {viewingDoc.supplier?.cif}</div>
                    )}
                    {viewingDoc.supplier?.address && (
                      <div className="text-muted-foreground">Adresă: {viewingDoc.supplier?.address}</div>
                    )}
                  </div>
            
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-muted-foreground">Net</div>
                      <div className="font-medium">{viewingDoc.amount?.netAmount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">TVA</div>
                      <div className="font-medium">{viewingDoc.amount?.vatAmount} ({viewingDoc.amount?.vatRate}%)</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-medium">{viewingDoc.amount?.totalAmount}</div>
                    </div>
                  </div>
            
                  {viewingDoc.description && (
                    <div>
                      <div className="text-muted-foreground">Descriere</div>
                      <div className="font-medium">{viewingDoc.description}</div>
                    </div>
                  )}
            
                  {viewingDoc.filePath && (
                    <div className="mt-2">
                      <Button variant="secondary" onClick={() => onViewAttachment(viewingDoc)}>
                        Vezi atașamentul
                      </Button>
                    </div>
                  )}
                </div>
            
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewingDoc(null)}>
                    Închide
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog (formular complet) */}
      <Dialog open={!!editingDoc} onOpenChange={() => setEditingDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editează Document</DialogTitle>
          </DialogHeader>
          {editingDoc && (
            <DocumentForm
              existingDocument={editingDoc}
              filePath={editingDoc.filePath}
              onSave={(id) => {
                setEditingDoc(null);
                toast({ title: 'Salvat', description: 'Documentul a fost actualizat.' });
                refreshDocuments();
              }}
              onCancel={() => setEditingDoc(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;