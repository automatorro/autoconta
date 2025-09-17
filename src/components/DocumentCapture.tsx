import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Camera, Upload, FileText, Image, Trash2, Eye, Download, Search, Filter, Fuel, Car, FileCheck, Building, Truck, MapPin, Clock, Euro, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Document {
  id: string;
  business_id: string;
  document_type: 'RECEIPT' | 'INVOICE' | 'CONTRACT' | 'LICENSE' | 'OTHER' | 'fuel_receipt' | 'maintenance' | 'toll_receipt' | 'parking_receipt' | 'transport_invoice' | 'cmr_document' | 'insurance' | 'itp_document' | 'license_document' | 'driver_license' | 'salary_slip';
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  amount?: number;
  currency?: string;
  date_issued?: string;
  vendor_name?: string;
  tags: string[];
  extracted_data?: any;
  created_at: string;
  updated_at: string;
}

// Tipuri de documente specifice transportatorilor
const documentTypes = [
  { value: 'fuel_receipt', label: 'Bon Combustibil', icon: Fuel, category: 'expenses' },
  { value: 'maintenance', label: 'Service/Reparații Auto', icon: Car, category: 'expenses' },
  { value: 'toll_receipt', label: 'Taxe Drum/Viniete', icon: MapPin, category: 'expenses' },
  { value: 'parking_receipt', label: 'Parcare', icon: Clock, category: 'expenses' },
  { value: 'transport_invoice', label: 'Factură Transport', icon: Truck, category: 'revenue' },
  { value: 'cmr_document', label: 'CMR/Scrisoare de Trăsură', icon: FileCheck, category: 'transport' },
  { value: 'insurance', label: 'Asigurare RCA/CASCO', icon: Building, category: 'documents' },
  { value: 'itp_document', label: 'ITP/Revizie Tehnică', icon: FileCheck, category: 'documents' },
  { value: 'license_document', label: 'Licență Transport', icon: FileText, category: 'documents' },
  { value: 'driver_license', label: 'Permis Conducere', icon: FileText, category: 'documents' },
  { value: 'salary_slip', label: 'Fluturaș Salariu', icon: Euro, category: 'hr' },
  { value: 'other', label: 'Alte Documente', icon: FileText, category: 'other' }
];

interface DocumentCaptureProps {
  businessId: string;
  onDocumentAdded?: (document: Document) => void;
}

export function DocumentCapture({ businessId, onDocumentAdded }: DocumentCaptureProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCaptureDialog, setShowCaptureDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload'>('upload');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const [documentForm, setDocumentForm] = useState({
    document_type: 'RECEIPT' as const,
    title: '',
    description: '',
    amount: '',
    currency: 'RON',
    date_issued: new Date().toISOString().split('T')[0],
    vendor_name: '',
    tags: [] as string[],
    file: null as File | null
  });

  // Simulare încărcare documente (în realitate ar veni din Supabase)
  React.useEffect(() => {
    loadDocuments();
  }, [businessId]);

  const loadDocuments = async () => {
    // Simulare date pentru demonstrație
    const mockDocuments: Document[] = [
      {
        id: '1',
        business_id: businessId,
        document_type: 'RECEIPT',
        title: 'Chitanță combustibil OMV',
        description: 'Alimentare autovehicul',
        file_url: '/mock-receipt.jpg',
        file_name: 'receipt_omv_001.jpg',
        file_size: 245760,
        mime_type: 'image/jpeg',
        amount: 250.50,
        currency: 'RON',
        date_issued: '2024-12-19',
        vendor_name: 'OMV Petrom',
        tags: ['combustibil', 'transport'],
        created_at: '2024-12-19T10:30:00Z',
        updated_at: '2024-12-19T10:30:00Z'
      },
      {
        id: '2',
        business_id: businessId,
        document_type: 'INVOICE',
        title: 'Factură service auto',
        description: 'Revizie tehnică anuală',
        file_url: '/mock-invoice.pdf',
        file_name: 'factura_service_2024.pdf',
        file_size: 156432,
        mime_type: 'application/pdf',
        amount: 450.00,
        currency: 'RON',
        date_issued: '2024-12-18',
        vendor_name: 'Auto Service SRL',
        tags: ['service', 'mentenanță'],
        created_at: '2024-12-18T14:15:00Z',
        updated_at: '2024-12-18T14:15:00Z'
      }
    ];
    setDocuments(mockDocuments);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Cameră din spate pe mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut accesa camera. Verifică permisiunile.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        
        // Convertește în File object
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `document_${Date.now()}.jpg`, {
              type: 'image/jpeg'
            });
            setDocumentForm({ ...documentForm, file });
          }
        }, 'image/jpeg', 0.8);
        
        stopCamera();
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verifică tipul și dimensiunea fișierului
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tip fișier neacceptat",
          description: "Sunt acceptate doar imagini (JPEG, PNG, WebP) și PDF-uri.",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "Fișier prea mare",
          description: "Dimensiunea maximă acceptată este 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      setDocumentForm({ ...documentForm, file });
      
      // Previzualizare pentru imagini
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentForm.file) {
      toast({
        title: "Eroare",
        description: "Te rog să selectezi sau să fotografiezi un document.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // În realitate, aici ar fi upload-ul în Supabase Storage
      // și salvarea metadatelor în baza de date
      
      const newDocument: Document = {
        id: Date.now().toString(),
        business_id: businessId,
        document_type: documentForm.document_type,
        title: documentForm.title,
        description: documentForm.description,
        file_url: `/uploads/${documentForm.file.name}`,
        file_name: documentForm.file.name,
        file_size: documentForm.file.size,
        mime_type: documentForm.file.type,
        amount: documentForm.amount ? parseFloat(documentForm.amount) : undefined,
        currency: documentForm.currency,
        date_issued: documentForm.date_issued,
        vendor_name: documentForm.vendor_name,
        tags: documentForm.tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setDocuments([newDocument, ...documents]);
      onDocumentAdded?.(newDocument);
      
      toast({
        title: "Succes",
        description: "Documentul a fost salvat cu succes."
      });
      
      resetForm();
      setShowCaptureDialog(false);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la salvarea documentului.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDocumentForm({
      document_type: 'RECEIPT',
      title: '',
      description: '',
      amount: '',
      currency: 'RON',
      date_issued: new Date().toISOString().split('T')[0],
      vendor_name: '',
      tags: [],
      file: null
    });
    setCapturedImage(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest document?')) return;
    
    try {
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast({
        title: "Succes",
        description: "Documentul a fost șters cu succes."
      });
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la ștergerea documentului.",
        variant: "destructive"
      });
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'RECEIPT': return 'Chitanță';
      case 'INVOICE': return 'Factură';
      case 'CONTRACT': return 'Contract';
      case 'LICENSE': return 'Licență';
      case 'OTHER': return 'Altele';
      default: return type;
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'RECEIPT': return 'bg-green-100 text-green-800';
      case 'INVOICE': return 'bg-blue-100 text-blue-800';
      case 'CONTRACT': return 'bg-purple-100 text-purple-800';
      case 'LICENSE': return 'bg-orange-100 text-orange-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  const filteredDocuments = documents.filter(doc => {
    const docType = documentTypes.find(type => type.value === doc.document_type);
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || doc.document_type === filterType;
    const matchesCategory = !categoryFilter || docType?.category === categoryFilter;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const getDocumentIcon = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType?.icon || FileText;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'expenses': return 'text-red-600';
      case 'revenue': return 'text-green-600';
      case 'transport': return 'text-blue-600';
      case 'documents': return 'text-purple-600';
      case 'hr': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Încărcare Documente</TabsTrigger>
          <TabsTrigger value="documents">Documente Salvate</TabsTrigger>
          <TabsTrigger value="analytics">Analiză Cheltuieli</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Gestionare Documente Transport
                  </CardTitle>
                  <CardDescription>
                    Fotografiază sau încarcă bonuri combustibil, facturi transport, CMR-uri și alte documente
                  </CardDescription>
                </div>
            <Dialog open={showCaptureDialog} onOpenChange={setShowCaptureDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Camera className="h-4 w-4 mr-2" />
                  Adaugă Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adaugă Document Nou</DialogTitle>
                  <DialogDescription>
                    Fotografiază sau încarcă un document și completează informațiile
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Mod de capturare */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={captureMode === 'upload' ? 'default' : 'outline'}
                      onClick={() => setCaptureMode('upload')}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Încarcă Fișier
                    </Button>
                    <Button
                      type="button"
                      variant={captureMode === 'camera' ? 'default' : 'outline'}
                      onClick={() => setCaptureMode('camera')}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Fotografiază
                    </Button>
                  </div>

                  {/* Zona de capturare */}
                  <Card className="p-4">
                    {captureMode === 'upload' ? (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">
                            Selectează un fișier sau trage și lasă aici
                          </p>
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Selectează Fișier
                          </Button>
                        </div>
                        {capturedImage && (
                          <div className="text-center">
                            <img
                              src={capturedImage}
                              alt="Preview"
                              className="max-w-full max-h-64 mx-auto rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {!stream && !capturedImage && (
                          <div className="text-center">
                            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                              Pornește camera pentru a fotografia documentul
                            </p>
                            <Button type="button" onClick={startCamera}>
                              Pornește Camera
                            </Button>
                          </div>
                        )}
                        
                        {stream && (
                          <div className="text-center space-y-4">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="max-w-full max-h-64 mx-auto rounded-lg border"
                            />
                            <div className="flex gap-2 justify-center">
                              <Button type="button" onClick={capturePhoto}>
                                <Camera className="h-4 w-4 mr-2" />
                                Fotografiază
                              </Button>
                              <Button type="button" variant="outline" onClick={stopCamera}>
                                Oprește Camera
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {capturedImage && (
                          <div className="text-center space-y-4">
                            <img
                              src={capturedImage}
                              alt="Captured"
                              className="max-w-full max-h-64 mx-auto rounded-lg border"
                            />
                            <div className="flex gap-2 justify-center">
                              <Button type="button" variant="outline" onClick={() => {
                                setCapturedImage(null);
                                setDocumentForm({ ...documentForm, file: null });
                                startCamera();
                              }}>
                                Fotografiază Din Nou
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    )}
                  </Card>

                  {/* Informații document */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="document_type">Tipul Documentului *</Label>
                      <Select
                        value={documentForm.document_type}
                        onValueChange={(value: any) => setDocumentForm({ ...documentForm, document_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Titlul Documentului *</Label>
                      <Input
                        id="title"
                        value={documentForm.title}
                        onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                        placeholder="Ex: Chitanță combustibil OMV"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrierea (Opțional)</Label>
                    <Textarea
                      id="description"
                      value={documentForm.description}
                      onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                      placeholder="Detalii suplimentare despre document"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Suma (Opțional)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={documentForm.amount}
                        onChange={(e) => setDocumentForm({ ...documentForm, amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Moneda</Label>
                      <Select
                        value={documentForm.currency}
                        onValueChange={(value) => setDocumentForm({ ...documentForm, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RON">RON</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date_issued">Data Emiterii</Label>
                      <Input
                        id="date_issued"
                        type="date"
                        value={documentForm.date_issued}
                        onChange={(e) => setDocumentForm({ ...documentForm, date_issued: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor_name">Furnizorul/Emitentul (Opțional)</Label>
                    <Input
                      id="vendor_name"
                      value={documentForm.vendor_name}
                      onChange={(e) => setDocumentForm({ ...documentForm, vendor_name: e.target.value })}
                      placeholder="Ex: OMV Petrom, Auto Service SRL"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCaptureDialog(false)}>
                      Anulează
                    </Button>
                    <Button type="submit" disabled={loading || !documentForm.file}>
                      {loading ? 'Se salvează...' : 'Salvează Document'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtre și căutare */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Caută documente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toate tipurile</SelectItem>
                <SelectItem value="RECEIPT">Chitanțe</SelectItem>
                <SelectItem value="INVOICE">Facturi</SelectItem>
                <SelectItem value="CONTRACT">Contracte</SelectItem>
                <SelectItem value="LICENSE">Licențe</SelectItem>
                <SelectItem value="OTHER">Altele</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista documentelor */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'ALL' 
                  ? 'Nu s-au găsit documente care să corespundă criteriilor de căutare.'
                  : 'Nu ai încă documente încărcate.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getDocumentTypeColor(document.document_type)}>
                            {getDocumentTypeLabel(document.document_type)}
                          </Badge>
                          {document.amount && (
                            <Badge variant="outline">
                              {formatCurrency(document.amount)}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm line-clamp-2">{document.title}</h4>
                        {document.vendor_name && (
                          <p className="text-xs text-muted-foreground">{document.vendor_name}</p>
                        )}
                      </div>
                    </div>
                    
                    {document.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {document.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(document.date_issued || document.created_at).toLocaleDateString('ro-RO')}</span>
                      <span>{formatFileSize(document.file_size)}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDocument(document);
                          setShowPreviewDialog(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Simulare download
                          toast({
                            title: "Download",
                            description: `Se descarcă ${document.file_name}`
                          });
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(document.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documente Salvate ({filteredDocuments.length})
                  </CardTitle>
                  <CardDescription>
                    Gestionează și vizualizează documentele încărcate
                  </CardDescription>
                </div>
                
                {/* Filtre îmbunătățite */}
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Caută documente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Toate categoriile</option>
                    <option value="expenses">Cheltuieli</option>
                    <option value="revenue">Venituri</option>
                    <option value="transport">Documente Transport</option>
                    <option value="documents">Acte Oficiale</option>
                    <option value="hr">Resurse Umane</option>
                  </select>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Toate tipurile</SelectItem>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'ALL' 
                      ? 'Nu s-au găsit documente care să corespundă criteriilor de căutare.'
                      : 'Nu ai încă documente încărcate.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map((document) => {
                    const DocIcon = getDocumentIcon(document.document_type);
                    const docType = documentTypes.find(type => type.value === document.document_type);
                    
                    return (
                      <Card key={document.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <DocIcon className={`h-4 w-4 ${docType ? getCategoryColor(docType.category) : 'text-primary'}`} />
                                <Badge className={getDocumentTypeColor(document.document_type)}>
                                  {getDocumentTypeLabel(document.document_type)}
                                </Badge>
                                {document.amount && (
                                  <Badge variant="outline">
                                    {formatCurrency(document.amount)}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-semibold text-sm line-clamp-2">{document.title}</h4>
                              {document.vendor_name && (
                                <p className="text-xs text-muted-foreground">{document.vendor_name}</p>
                              )}
                            </div>
                          </div>
                          
                          {document.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {document.description}
                            </p>
                          )}
                          
                          {/* Afișare date extrase automat */}
                          {document.extracted_data && Object.keys(document.extracted_data).length > 0 && (
                            <div className="mb-2 p-2 bg-green-50 rounded text-xs">
                              <p className="font-medium text-green-800 mb-1">Date extrase automat:</p>
                              {document.extracted_data.amount && (
                                <p className="text-green-700">Sumă: {document.extracted_data.amount} RON</p>
                              )}
                              {document.extracted_data.liters && (
                                <p className="text-green-700">Litri: {document.extracted_data.liters}L</p>
                              )}
                              {document.extracted_data.station && (
                                <p className="text-green-700">Stație: {document.extracted_data.station}</p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{new Date(document.date_issued || document.created_at).toLocaleDateString('ro-RO')}</span>
                            <span>{formatFileSize(document.file_size)}</span>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDocument(document);
                                setShowPreviewDialog(true);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Simulare download
                                toast({
                                  title: "Download",
                                  description: `Se descarcă ${document.file_name}`
                                });
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteDocument(document.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Analiză Cheltuieli Transport
              </CardTitle>
              <CardDescription>
                Vizualizează statistici despre cheltuielile din documente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Fuel className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Total Combustibil</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {new Intl.NumberFormat('ro-RO', {
                      style: 'currency',
                      currency: 'RON'
                    }).format(
                      documents
                        .filter(doc => doc.document_type === 'fuel_receipt' && doc.extracted_data?.amount)
                        .reduce((sum, doc) => sum + (doc.extracted_data?.amount || 0), 0)
                    )}
                  </p>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Service & Reparații</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {documents.filter(doc => doc.document_type === 'maintenance').length}
                  </p>
                  <p className="text-xs text-muted-foreground">documente</p>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Facturi Transport</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {documents.filter(doc => doc.document_type === 'transport_invoice').length}
                  </p>
                  <p className="text-xs text-muted-foreground">facturi emise</p>
                </Card>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Funcționalitate în dezvoltare:</strong> Grafice detaliate și rapoarte de cheltuieli vor fi disponibile în curând.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog previzualizare */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.vendor_name && `${selectedDocument.vendor_name} • `}
              {selectedDocument?.date_issued && new Date(selectedDocument.date_issued).toLocaleDateString('ro-RO')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getDocumentTypeColor(selectedDocument.document_type)}>
                  {getDocumentTypeLabel(selectedDocument.document_type)}
                </Badge>
                {selectedDocument.amount && (
                  <Badge variant="outline">
                    {formatCurrency(selectedDocument.amount)}
                  </Badge>
                )}
                <Badge variant="secondary">
                  {formatFileSize(selectedDocument.file_size)}
                </Badge>
              </div>
              
              {selectedDocument.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedDocument.description}
                </p>
              )}
              
              <div className="border rounded-lg p-4 bg-muted/50 text-center">
                {selectedDocument.mime_type.startsWith('image/') ? (
                  <div>
                    <Image className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Previzualizarea imaginii va fi disponibilă după implementarea completă
                    </p>
                  </div>
                ) : (
                  <div>
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Previzualizarea PDF-ului va fi disponibilă după implementarea completă
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DocumentCapture;