import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Printer, 
  FileText, 
  Download,
  Eye,
  Settings,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building2,
  User,
  Receipt,
  FileSpreadsheet,
  Clock,
  Zap
} from 'lucide-react';

interface PrintableDocument {
  id: string;
  type: 'declaration' | 'invoice' | 'receipt' | 'report' | 'contract';
  title: string;
  description: string;
  date: string;
  status: 'draft' | 'ready' | 'submitted';
  pages: number;
  size: string;
  category: string;
}

interface PrintSettings {
  paperSize: 'A4' | 'A3' | 'Letter';
  orientation: 'portrait' | 'landscape';
  quality: 'draft' | 'normal' | 'high';
  copies: number;
  duplex: boolean;
  margins: 'normal' | 'narrow' | 'wide';
}

interface PrintManagerProps {
  businessId: string;
}

const PrintManager: React.FC<PrintManagerProps> = ({ businessId }) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    paperSize: 'A4',
    orientation: 'portrait',
    quality: 'normal',
    copies: 1,
    duplex: false,
    margins: 'normal'
  });
  const printRef = useRef<HTMLDivElement>(null);

  // Date simulate pentru documente
  const documents: PrintableDocument[] = [
    {
      id: '1',
      type: 'declaration',
      title: 'Declarația D112 - Decembrie 2024',
      description: 'Declarația privind obligațiile de plată la bugetul de stat',
      date: '2024-12-20',
      status: 'ready',
      pages: 3,
      size: '245 KB',
      category: 'ANAF'
    },
    {
      id: '2',
      type: 'declaration',
      title: 'Declarația D394 - Decembrie 2024',
      description: 'Declarația privind obligațiile de plată la bugetul asigurărilor sociale',
      date: '2024-12-20',
      status: 'ready',
      pages: 2,
      size: '189 KB',
      category: 'ANAF'
    },
    {
      id: '3',
      type: 'declaration',
      title: 'REVISAL - Raportare lunară',
      description: 'Registrul general de evidență a salariaților',
      date: '2024-12-20',
      status: 'ready',
      pages: 5,
      size: '312 KB',
      category: 'ANAF'
    },
    {
      id: '4',
      type: 'invoice',
      title: 'Factură F-2024-001',
      description: 'Servicii transport marfă - Client ABC SRL',
      date: '2024-12-18',
      status: 'ready',
      pages: 1,
      size: '156 KB',
      category: 'Facturi'
    },
    {
      id: '5',
      type: 'receipt',
      title: 'Chitanță combustibil - OMV',
      description: 'Alimentare combustibil - 150L motorină',
      date: '2024-12-19',
      status: 'ready',
      pages: 1,
      size: '89 KB',
      category: 'Cheltuieli'
    },
    {
      id: '6',
      type: 'report',
      title: 'Raport profit/pierdere - Decembrie',
      description: 'Situația financiară pe luna decembrie 2024',
      date: '2024-12-20',
      status: 'ready',
      pages: 4,
      size: '278 KB',
      category: 'Rapoarte'
    },
    {
      id: '7',
      type: 'contract',
      title: 'Contract de muncă - Ion Popescu',
      description: 'Contract individual de muncă pentru șofer',
      date: '2024-12-15',
      status: 'ready',
      pages: 6,
      size: '445 KB',
      category: 'Contracte'
    }
  ];

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'declaration': return FileText;
      case 'invoice': return Receipt;
      case 'receipt': return Receipt;
      case 'report': return FileSpreadsheet;
      case 'contract': return FileText;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Gata printare';
      case 'draft': return 'Ciornă';
      case 'submitted': return 'Trimis';
      default: return 'Necunoscut';
    }
  };

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    const readyDocuments = documents.filter(doc => doc.status === 'ready').map(doc => doc.id);
    setSelectedDocuments(prev => 
      prev.length === readyDocuments.length ? [] : readyDocuments
    );
  };

  const handlePrint = async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "Niciun document selectat",
        description: "Selectează cel puțin un document pentru printare.",
        variant: "destructive"
      });
      return;
    }

    setIsPrinting(true);
    
    try {
      // Simulare pregătire printare
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generare conținut pentru printare
      const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
      
      // Creează o fereastră nouă pentru printare
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Nu s-a putut deschide fereastra de printare');
      }
      
      // Generează HTML pentru printare
      const printHTML = generatePrintHTML(selectedDocs);
      
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      // Așteaptă încărcarea și printează
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
      
      toast({
        title: "Printare inițiată",
        description: `S-au trimis ${selectedDocuments.length} documente la imprimantă.`
      });
      
      // Resetează selecția
      setSelectedDocuments([]);
      
    } catch (error) {
      toast({
        title: "Eroare la printare",
        description: "Nu s-a putut finaliza printarea. Încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePreview = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;
    
    // Simulare preview
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut deschide preview-ul.",
        variant: "destructive"
      });
      return;
    }
    
    const previewHTML = generateDocumentPreview(doc);
    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
  };

  const handleDownload = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;
    
    // Simulare download
    const blob = new Blob([`Conținut document: ${doc.title}`], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download inițiat",
      description: `Documentul "${doc.title}" se descarcă.`
    });
  };

  const generatePrintHTML = (docs: PrintableDocument[]): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AutoConta - Printare Documente</title>
        <style>
          @page {
            size: ${printSettings.paperSize};
            orientation: ${printSettings.orientation};
            margin: ${printSettings.margins === 'narrow' ? '1cm' : printSettings.margins === 'wide' ? '3cm' : '2cm'};
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
          }
          .document {
            page-break-after: always;
            padding: 20px;
          }
          .document:last-child {
            page-break-after: auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .company-info {
            text-align: right;
            margin-bottom: 20px;
            font-size: 10px;
          }
          .document-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .document-content {
            margin-top: 20px;
          }
          .footer {
            position: fixed;
            bottom: 1cm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
        </style>
      </head>
      <body>
        ${docs.map(doc => `
          <div class="document">
            <div class="company-info">
              Transport Express SRL<br>
              CUI: RO12345678<br>
              Data printare: ${new Date().toLocaleDateString('ro-RO')}
            </div>
            
            <div class="header">
              <div class="document-title">${doc.title}</div>
              <div>${doc.description}</div>
            </div>
            
            <div class="document-content">
              ${generateDocumentContent(doc)}
            </div>
          </div>
        `).join('')}
        
        <div class="footer">
          Generat de AutoConta - Pagina <span id="pageNumber"></span>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
  };

  const generateDocumentContent = (doc: PrintableDocument): string => {
    switch (doc.type) {
      case 'declaration':
        return `
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Perioada de raportare:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">Decembrie 2024</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Suma de plată:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">2,450 RON</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Termen de plată:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">25.01.2025</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Status:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">Pregătit pentru transmitere</td>
            </tr>
          </table>
          <br>
          <p><strong>Detalii calcul:</strong></p>
          <ul>
            <li>Venituri brute: 15,600 RON</li>
            <li>Cheltuieli deductibile: 8,200 RON</li>
            <li>Baza impozabilă: 7,400 RON</li>
            <li>Impozit calculat: 2,450 RON</li>
          </ul>
        `;
      case 'invoice':
        return `
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Client:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">ABC Transport SRL</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Servicii:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">Transport marfă București - Cluj</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Valoare:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">2,800 RON</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>TVA:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">532 RON</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Total:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">3,332 RON</td>
            </tr>
          </table>
        `;
      default:
        return `
          <p>Conținutul documentului "${doc.title}" va fi afișat aici.</p>
          <p>Tip: ${doc.type}</p>
          <p>Data: ${doc.date}</p>
          <p>Descriere: ${doc.description}</p>
        `;
    }
  };

  const generateDocumentPreview = (doc: PrintableDocument): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Preview: ${doc.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #f5f5f5;
          }
          .preview-container {
            background: white;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div class="header">
            <h1>${doc.title}</h1>
            <p>${doc.description}</p>
          </div>
          ${generateDocumentContent(doc)}
        </div>
      </body>
      </html>
    `;
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, PrintableDocument[]>);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Documente</TabsTrigger>
          <TabsTrigger value="settings">Setări Printare</TabsTrigger>
          <TabsTrigger value="queue">Coadă Printare</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <div className="space-y-6">
            {/* Acțiuni rapide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Printare Documente
                </CardTitle>
                <CardDescription>
                  Selectează documentele pentru printare sau download
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Button 
                    variant="outline" 
                    onClick={handleSelectAll}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {selectedDocuments.length === documents.filter(d => d.status === 'ready').length ? 'Deselectează tot' : 'Selectează tot'}
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    {selectedDocuments.length} documente selectate
                  </div>
                  
                  <div className="ml-auto flex gap-2">
                    <Button 
                      onClick={handlePrint}
                      disabled={selectedDocuments.length === 0 || isPrinting}
                      className="flex items-center gap-2"
                    >
                      {isPrinting ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Printer className="h-4 w-4" />
                      )}
                      {isPrinting ? 'Se printează...' : 'Printează'}
                    </Button>
                  </div>
                </div>
                
                {selectedDocuments.length > 0 && (
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Printare rapidă:</strong> Documentele selectate vor fi printate cu setările curente: 
                      {printSettings.paperSize}, {printSettings.orientation}, {printSettings.copies} {printSettings.copies === 1 ? 'copie' : 'copii'}.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Lista documentelor grupate */}
            <div className="space-y-6">
              {Object.entries(groupedDocuments).map(([category, docs]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                    <CardDescription>
                      {docs.length} {docs.length === 1 ? 'document' : 'documente'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {docs.map(doc => {
                        const Icon = getDocumentIcon(doc.type);
                        const isSelected = selectedDocuments.includes(doc.id);
                        const isReady = doc.status === 'ready';
                        
                        return (
                          <div 
                            key={doc.id} 
                            className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            } ${!isReady ? 'opacity-60' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleDocumentSelect(doc.id)}
                              disabled={!isReady}
                              className="rounded"
                            />
                            
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            
                            <div className="flex-1">
                              <h4 className="font-semibold">{doc.title}</h4>
                              <p className="text-sm text-muted-foreground">{doc.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(doc.date).toLocaleDateString('ro-RO')}
                                </span>
                                <span>{doc.pages} {doc.pages === 1 ? 'pagină' : 'pagini'}</span>
                                <span>{doc.size}</span>
                              </div>
                            </div>
                            
                            <Badge className={getStatusColor(doc.status)}>
                              {getStatusText(doc.status)}
                            </Badge>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreview(doc.id)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Preview
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(doc.id)}
                                className="flex items-center gap-1"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Setări Printare
              </CardTitle>
              <CardDescription>
                Configurează opțiunile de printare pentru toate documentele
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dimensiune hârtie */}
              <div>
                <label className="text-sm font-semibold">Dimensiune hârtie</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {['A4', 'A3', 'Letter'].map(size => (
                    <Button
                      key={size}
                      variant={printSettings.paperSize === size ? 'default' : 'outline'}
                      onClick={() => setPrintSettings(prev => ({ ...prev, paperSize: size as any }))}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Orientare */}
              <div>
                <label className="text-sm font-semibold">Orientare</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    variant={printSettings.orientation === 'portrait' ? 'default' : 'outline'}
                    onClick={() => setPrintSettings(prev => ({ ...prev, orientation: 'portrait' }))}
                  >
                    Portret
                  </Button>
                  <Button
                    variant={printSettings.orientation === 'landscape' ? 'default' : 'outline'}
                    onClick={() => setPrintSettings(prev => ({ ...prev, orientation: 'landscape' }))}
                  >
                    Peisaj
                  </Button>
                </div>
              </div>
              
              {/* Calitate */}
              <div>
                <label className="text-sm font-semibold">Calitate printare</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { key: 'draft', label: 'Ciornă' },
                    { key: 'normal', label: 'Normală' },
                    { key: 'high', label: 'Înaltă' }
                  ].map(quality => (
                    <Button
                      key={quality.key}
                      variant={printSettings.quality === quality.key ? 'default' : 'outline'}
                      onClick={() => setPrintSettings(prev => ({ ...prev, quality: quality.key as any }))}
                    >
                      {quality.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Numărul de copii */}
              <div>
                <label className="text-sm font-semibold">Numărul de copii</label>
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPrintSettings(prev => ({ ...prev, copies: Math.max(1, prev.copies - 1) }))}
                    disabled={printSettings.copies <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">{printSettings.copies}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPrintSettings(prev => ({ ...prev, copies: Math.min(10, prev.copies + 1) }))}
                    disabled={printSettings.copies >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              {/* Opțiuni suplimentare */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={printSettings.duplex}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, duplex: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Printare pe ambele fețe (duplex)</span>
                </label>
              </div>
              
              {/* Margini */}
              <div>
                <label className="text-sm font-semibold">Margini</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { key: 'narrow', label: 'Înguste' },
                    { key: 'normal', label: 'Normale' },
                    { key: 'wide', label: 'Largi' }
                  ].map(margin => (
                    <Button
                      key={margin.key}
                      variant={printSettings.margins === margin.key ? 'default' : 'outline'}
                      onClick={() => setPrintSettings(prev => ({ ...prev, margins: margin.key as any }))}
                    >
                      {margin.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Coadă Printare
              </CardTitle>
              <CardDescription>
                Monitorizează statusul lucrărilor de printare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Funcționalitate în dezvoltare:</strong> Monitorizarea cozii de printare va fi disponibilă în următoarele actualizări.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Printer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nu există lucrări de printare în curs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrintManager;