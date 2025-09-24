import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle, Camera, FolderOpen, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { DocumentForm } from '@/components/DocumentForm';

interface UploadedFile {
  file: File;
  preview: string;
  status: 'uploading' | 'uploaded' | 'error' | 'processing';
  progress: number;
  id: string;
  documentId?: string;
}

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadComplete }) => {
  const { toast } = useToast();
  const { authUser, addDocument } = useAppStore();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'scan' | 'photo' | 'import'>('scan');

  const processOCR = async (fileUrl: string, fileId: string) => {
    try {
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'processing', progress: 75 } : f
      ));

      // Simulăm procesul OCR - în implementarea reală, aici ar fi un apel API către serviciul OCR
      // De exemplu: const ocrResult = await fetch('/api/ocr', { method: 'POST', body: JSON.stringify({ fileUrl }) });
      
      // Simulăm un delay pentru procesare OCR
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulăm rezultate OCR - în implementarea reală, acestea ar veni de la serviciul OCR
      const mockOcrResult = {
        success: true,
        data: {
          supplier: { name: 'Auto Detect', cui: '12345678' },
          documentNumber: `INV-${Math.floor(Math.random() * 10000)}`,
          date: new Date().toISOString(),
          total: Math.floor(Math.random() * 1000) + 100,
          vat: Math.floor(Math.random() * 100),
          category: 'combustibil',
          items: [{ description: 'Articol detectat automat', quantity: 1, price: 100 }]
        }
      };

      // Actualizăm starea fișierului cu rezultatele OCR
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'uploaded', 
              progress: 100,
              ocrData: mockOcrResult.data 
            } 
          : f
      ));

      // Actualizăm fișierul selectat dacă este cel curent
      if (selectedFile?.id === fileId) {
        setSelectedFile(prev => prev ? { 
          ...prev, 
          status: 'uploaded', 
          progress: 100,
          ocrData: mockOcrResult.data 
        } : prev);
      }

      return mockOcrResult.data;
    } catch (error) {
      console.error('OCR processing error:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error', progress: 75 } : f
      ));
      
      toast({
        title: 'Eroare procesare OCR',
        description: `Nu s-au putut extrage datele din document: ${error.message}`,
        variant: 'destructive'
      });
      
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!authUser) {
      toast({
        title: 'Eroare',
        description: 'Trebuie să fii autentificat pentru a încărca documente.',
        variant: 'destructive'
      });
      return;
    }

    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading' as const,
      progress: 0,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload files to Supabase Storage
    for (const fileObj of newFiles) {
      try {
        const fileName = `${authUser.id}/${Date.now()}-${fileObj.file.name}`;
        
        // Update progress
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, progress: 30 } : f
        ));

        const { data, error } = await supabase.storage
          .from('documents')
          .upload(fileName, fileObj.file);

        if (error) throw error;

        // Update status to uploaded
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, status: 'uploaded', progress: 50 }
            : f
        ));

        // Obținem URL-ul fișierului pentru procesare OCR
        const { data: urlData } = await supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          // Procesăm OCR pentru fișierul încărcat
          await processOCR(urlData.publicUrl, fileObj.id);
        }

        toast({
          title: 'Succes',
          description: `${fileObj.file.name} a fost încărcat și procesat cu succes.`
        });

        // Auto-select first uploaded file for form
        if (selectedFile === null) {
          setSelectedFile({ ...fileObj, status: 'uploaded', progress: 100 });
        }

      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'error', progress: 0 } : f
        ));
        
        toast({
          title: 'Eroare',
          description: `Eroare la încărcarea ${fileObj.file.name}: ${error.message}`,
          variant: 'destructive'
        });
      }
    }
  }, [authUser, toast, selectedFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const handleDocumentSaved = (documentId: string) => {
    if (selectedFile) {
      setUploadedFiles(prev => prev.map(f => 
        f.id === selectedFile.id 
          ? { ...f, status: 'processing', documentId }
          : f
      ));
      setSelectedFile(null);
    }
    
    toast({
      title: 'Succes',
      description: 'Documentul a fost salvat cu succes!'
    });
    
    onUploadComplete?.();
  };

  const getUploadMethodConfig = () => {
    switch (uploadMethod) {
      case 'photo':
        return {
          title: 'Fotografiază Bonul',
          description: 'Fă o poză bonului fiscal cu camera telefonului',
          icon: Camera,
          accept: 'image/*',
          capture: 'environment' as const
        };
      case 'import':
        return {
          title: 'Import CSV/Excel',
          description: 'Importă date din fișiere CSV sau Excel',
          icon: FileSpreadsheet,
          accept: '.csv,.xls,.xlsx'
        };
      default:
        return {
          title: 'Încarcă Scanări',
          description: 'Încarcă PDF-uri sau imagini scanate',
          icon: FolderOpen,
          accept: 'image/*,application/pdf'
        };
    }
  };

  const config = getUploadMethodConfig();
  const IconComponent = config.icon;

  return (
    <div className="space-y-6">
      {/* Upload Method Selection */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={uploadMethod === 'scan' ? 'default' : 'outline'}
          onClick={() => setUploadMethod('scan')}
          className="p-3"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Scanări
        </Button>
        <Button
          variant={uploadMethod === 'photo' ? 'default' : 'outline'}
          onClick={() => setUploadMethod('photo')}
          className="p-3"
        >
          <Camera className="w-4 h-4 mr-2" />
          Foto
        </Button>
        <Button
          variant={uploadMethod === 'import' ? 'default' : 'outline'}
          onClick={() => setUploadMethod('import')}
          className="p-3"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Import
        </Button>
      </div>

      {/* Dropzone */}
      <Card 
        {...getRootProps()} 
        className={`p-8 border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} accept={config.accept} />
        <div className="text-center space-y-4">
          <IconComponent className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">{config.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
          {isDragActive ? (
            <p className="text-primary font-medium">
              Eliberează fișierele pentru a le încărca...
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Trage și eliberează fișierele aici sau fă clic pentru a selecta
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">JPG</Badge>
                <Badge variant="outline">PNG</Badge>
                <Badge variant="outline">PDF</Badge>
                {uploadMethod === 'import' && (
                  <>
                    <Badge variant="outline">CSV</Badge>
                    <Badge variant="outline">Excel</Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Dimensiune maximă: 10MB per fișier
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Fișiere încărcate ({uploadedFiles.length})</h4>
          <div className="grid gap-2">
            {uploadedFiles.map((fileObj) => (
              <Card 
                key={fileObj.id} 
                className={`p-3 cursor-pointer transition-colors ${
                  selectedFile?.id === fileObj.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedFile(fileObj)}
              >
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fileObj.file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={fileObj.progress} className="h-1 flex-1" />
                      {fileObj.status === 'uploaded' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {fileObj.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(fileObj.id);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Document Form */}
      {selectedFile && selectedFile.status === 'uploaded' && (
        <DocumentForm
          file={selectedFile.file}
          onSave={handleDocumentSaved}
          onCancel={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
};