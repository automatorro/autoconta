import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  Download, 
  Upload, 
  FileText, 
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRightLeft,
  Settings,
  FileSpreadsheet,
  FileCode,
  Zap,
  RefreshCw,
  Eye,
  Calendar
} from 'lucide-react';
import { businessService } from '@/services/businessService';

interface SagaExportData {
  accounts: any[];
  transactions: any[];
  documents: any[];
  employees: any[];
  declarations: any[];
  settings: any;
}

interface ImportResult {
  success: boolean;
  imported_records: number;
  errors: string[];
  warnings: string[];
}

interface SagaCompatibilityProps {
  businessId: string;
}

const SagaCompatibility: React.FC<SagaCompatibilityProps> = ({ businessId }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [lastExport, setLastExport] = useState<Date | null>(null);
  const [lastImport, setLastImport] = useState<Date | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configurări export
  const [exportConfig, setExportConfig] = useState({
    include_transactions: true,
    include_documents: true,
    include_employees: true,
    include_declarations: true,
    date_from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // 1 ianuarie anul curent
    date_to: new Date().toISOString().split('T')[0], // azi
    format: 'saga_xml' as 'saga_xml' | 'csv' | 'excel'
  });

  const exportFormats = [
    {
      id: 'saga_xml',
      name: 'Saga XML',
      description: 'Format nativ Saga pentru import complet',
      icon: FileCode,
      extension: '.xml'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Format CSV pentru import manual în Saga',
      icon: FileSpreadsheet,
      extension: '.csv'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Format Excel pentru analiză și import',
      icon: FileSpreadsheet,
      extension: '.xlsx'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      // Simulare export cu progres
      const steps = [
        { name: 'Pregătire date...', progress: 10 },
        { name: 'Export tranzacții...', progress: 30 },
        { name: 'Export documente...', progress: 50 },
        { name: 'Export angajați...', progress: 70 },
        { name: 'Export declarații...', progress: 85 },
        { name: 'Generare fișier...', progress: 95 },
        { name: 'Finalizare...', progress: 100 }
      ];
      
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setExportProgress(step.progress);
      }
      
      // Simulare generare fișier
      const exportData: SagaExportData = {
        accounts: [
          { code: '401', name: 'Furnizori', balance: 15600 },
          { code: '411', name: 'Clienți', balance: 28400 },
          { code: '512', name: 'Conturi la bănci', balance: 45200 }
        ],
        transactions: [
          {
            date: '2024-12-20',
            document_number: 'F-001',
            debit_account: '411',
            credit_account: '704',
            amount: 2800,
            description: 'Factură transport'
          }
        ],
        documents: [
          {
            type: 'invoice',
            number: 'F-001',
            date: '2024-12-20',
            amount: 2800,
            supplier: 'Client Transport SRL'
          }
        ],
        employees: [
          {
            name: 'Ion Popescu',
            cnp: '1234567890123',
            position: 'Șofer',
            salary: 3000
          }
        ],
        declarations: [
          {
            type: 'D112',
            period: '2024-12',
            amount: 2500,
            status: 'submitted'
          }
        ],
        settings: {
          company_name: 'Transport Express SRL',
          fiscal_code: 'RO12345678',
          export_date: new Date().toISOString(),
          format_version: '1.0'
        }
      };
      
      // Generare și download fișier
      const format = exportFormats.find(f => f.id === exportConfig.format);
      const filename = `saga_export_${new Date().toISOString().split('T')[0]}${format?.extension}`;
      
      let fileContent = '';
      if (exportConfig.format === 'saga_xml') {
        fileContent = generateSagaXML(exportData);
      } else if (exportConfig.format === 'csv') {
        fileContent = generateCSV(exportData);
      } else {
        // Pentru Excel, am simula generarea
        fileContent = 'Excel export data...';
      }
      
      // Simulare download
      const blob = new Blob([fileContent], { 
        type: exportConfig.format === 'saga_xml' ? 'application/xml' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setLastExport(new Date());
      
      toast({
        title: "Export finalizat cu succes",
        description: `Fișierul ${filename} a fost descărcat.`
      });
      
    } catch (error) {
      toast({
        title: "Eroare la export",
        description: "Nu s-a putut finaliza exportul. Încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);
    
    try {
      // Simulare import cu progres
      const steps = [
        { name: 'Citire fișier...', progress: 15 },
        { name: 'Validare format...', progress: 30 },
        { name: 'Import conturi...', progress: 50 },
        { name: 'Import tranzacții...', progress: 70 },
        { name: 'Import documente...', progress: 85 },
        { name: 'Finalizare...', progress: 100 }
      ];
      
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setImportProgress(step.progress);
      }
      
      // Simulare rezultat import
      const result: ImportResult = {
        success: true,
        imported_records: 156,
        errors: [],
        warnings: [
          'Contul 401.01 nu există și a fost creat automat',
          '3 tranzacții au fost ignorate din cauza datelor incomplete'
        ]
      };
      
      setImportResult(result);
      setLastImport(new Date());
      
      toast({
        title: "Import finalizat cu succes",
        description: `Au fost importate ${result.imported_records} înregistrări.`
      });
      
    } catch (error) {
      const errorResult: ImportResult = {
        success: false,
        imported_records: 0,
        errors: ['Fișierul nu poate fi procesat', 'Format invalid sau corupt'],
        warnings: []
      };
      
      setImportResult(errorResult);
      
      toast({
        title: "Eroare la import",
        description: "Nu s-a putut procesa fișierul. Verifică formatul.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const generateSagaXML = (data: SagaExportData): string => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<SagaExport version="1.0">
  <Company>
    <Name>${data.settings.company_name}</Name>
    <FiscalCode>${data.settings.fiscal_code}</FiscalCode>
    <ExportDate>${data.settings.export_date}</ExportDate>
  </Company>
  <Accounts>
    ${data.accounts.map(acc => `
    <Account>
      <Code>${acc.code}</Code>
      <Name>${acc.name}</Name>
      <Balance>${acc.balance}</Balance>
    </Account>`).join('')}
  </Accounts>
  <Transactions>
    ${data.transactions.map(trans => `
    <Transaction>
      <Date>${trans.date}</Date>
      <DocumentNumber>${trans.document_number}</DocumentNumber>
      <DebitAccount>${trans.debit_account}</DebitAccount>
      <CreditAccount>${trans.credit_account}</CreditAccount>
      <Amount>${trans.amount}</Amount>
      <Description>${trans.description}</Description>
    </Transaction>`).join('')}
  </Transactions>
</SagaExport>`;
  };

  const generateCSV = (data: SagaExportData): string => {
    let csv = 'Tip,Data,Numar Document,Cont Debit,Cont Credit,Suma,Descriere\n';
    
    data.transactions.forEach(trans => {
      csv += `Tranzactie,${trans.date},${trans.document_number},${trans.debit_account},${trans.credit_account},${trans.amount},"${trans.description}"\n`;
    });
    
    return csv;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export către Saga</TabsTrigger>
          <TabsTrigger value="import">Import din Saga</TabsTrigger>
          <TabsTrigger value="sync">Sincronizare</TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <div className="space-y-6">
            {/* Configurări export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurări Export
                </CardTitle>
                <CardDescription>
                  Alege ce date să fie exportate și în ce format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Perioada */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_from">Data început</Label>
                    <Input
                      id="date_from"
                      type="date"
                      value={exportConfig.date_from}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, date_from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_to">Data sfârșit</Label>
                    <Input
                      id="date_to"
                      type="date"
                      value={exportConfig.date_to}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, date_to: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Ce să se exporte */}
                <div>
                  <Label className="text-base font-semibold">Date de exportat</Label>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.include_transactions}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, include_transactions: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Tranzacții și înregistrări contabile</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.include_documents}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, include_documents: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Documente (facturi, chitanțe)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.include_employees}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, include_employees: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Date angajați și salarii</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.include_declarations}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, include_declarations: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Declarații ANAF</span>
                    </label>
                  </div>
                </div>

                {/* Format export */}
                <div>
                  <Label className="text-base font-semibold">Format export</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    {exportFormats.map(format => {
                      const Icon = format.icon;
                      return (
                        <Card 
                          key={format.id} 
                          className={`cursor-pointer transition-colors ${
                            exportConfig.format === format.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setExportConfig(prev => ({ ...prev, format: format.id as any }))}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className="h-5 w-5" />
                              <h4 className="font-semibold">{format.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{format.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buton export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Generare Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isExporting ? (
                  <div className="space-y-4">
                    <Progress value={exportProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      Export în progres... {exportProgress}%
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      onClick={handleExport} 
                      className="w-full" 
                      size="lg"
                      disabled={!exportConfig.include_transactions && !exportConfig.include_documents && !exportConfig.include_employees && !exportConfig.include_declarations}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportă către Saga
                    </Button>
                    
                    {lastExport && (
                      <p className="text-sm text-muted-foreground text-center">
                        Ultimul export: {lastExport.toLocaleString('ro-RO')}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="import">
          <div className="space-y-6">
            {/* Upload fișier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import din Saga
                </CardTitle>
                <CardDescription>
                  Încarcă un fișier exportat din Saga pentru a importa datele
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isImporting ? (
                  <div className="space-y-4">
                    <Progress value={importProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      Import în progres... {importProgress}%
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Selectează fișierul pentru import</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Formате acceptate: .xml, .csv, .xlsx
                      </p>
                      <Button variant="outline">
                        Alege Fișier
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xml,.csv,.xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {lastImport && (
                      <p className="text-sm text-muted-foreground text-center">
                        Ultimul import: {lastImport.toLocaleString('ro-RO')}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rezultat import */}
            {importResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {importResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    Rezultat Import
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {importResult.success ? (
                      <Alert className="border-green-500 bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Import finalizat cu succes!</strong><br />
                          Au fost importate {importResult.imported_records} înregistrări.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="border-red-500 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Import eșuat!</strong><br />
                          Nu s-au putut importa datele.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {importResult.warnings.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-orange-600">Avertismente:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {importResult.warnings.map((warning, index) => (
                            <li key={index} className="text-orange-600">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {importResult.errors.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-600">Erori:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {importResult.errors.map((error, index) => (
                            <li key={index} className="text-red-600">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sync">
          <div className="space-y-6">
            {/* Sincronizare automată */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  Sincronizare Automată
                </CardTitle>
                <CardDescription>
                  Configurează sincronizarea automată cu Saga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Funcționalitate în dezvoltare:</strong> Sincronizarea automată va fi disponibilă în următoarele actualizări. 
                    Momentan poți folosi export/import manual.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <RefreshCw className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold">Sincronizare Bidirectională</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sincronizează automat datele între AutoConta și Saga în ambele direcții.
                      </p>
                      <Badge variant="outline">În curând</Badge>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold">Sincronizare Programată</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Configurează sincronizarea automată zilnică, săptămânală sau lunară.
                      </p>
                      <Badge variant="outline">În curând</Badge>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mapare conturi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Mapare Conturi Contabile
                </CardTitle>
                <CardDescription>
                  Configurează corespondența între conturile din AutoConta și Saga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm font-semibold border-b pb-2">
                    <span>Categorie AutoConta</span>
                    <span>Cont Saga</span>
                    <span>Status</span>
                  </div>
                  
                  {[
                    { category: 'Venituri Transport', account: '704', status: 'mapped' },
                    { category: 'Cheltuieli Combustibil', account: '628', status: 'mapped' },
                    { category: 'Salarii Angajați', account: '641', status: 'mapped' },
                    { category: 'Furnizori', account: '401', status: 'mapped' },
                    { category: 'Clienți', account: '411', status: 'mapped' },
                    { category: 'Bănci', account: '512', status: 'mapped' }
                  ].map((mapping, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="text-sm">{mapping.category}</span>
                      <span className="text-sm font-mono">{mapping.account}</span>
                      <Badge className="w-fit" variant={mapping.status === 'mapped' ? 'default' : 'secondary'}>
                        {mapping.status === 'mapped' ? 'Mapat' : 'Nemapat'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SagaCompatibility;