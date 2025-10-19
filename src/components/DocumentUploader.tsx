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
import { useOCR } from '@/hooks/useOCR';
import { OCRResult } from '@/services/ocrService';

interface UploadedFile {
  file: File;
  preview: string;
  status: 'uploading' | 'uploaded' | 'error' | 'processing';
  progress: number;
  id: string;
  documentId?: string;
  ocrData?: OCRResult;
  storagePath?: string;
}

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadComplete }) => {
  const { toast } = useToast();
  const { authUser, addDocument } = useAppStore();
  const { processImage, isProcessing } = useOCR();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'scan' | 'photo' | 'import'>('scan');

  const processOCR = async (file: File, fileId: string) => {
    try {
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'processing', progress: 75 } : f
      ));

      console.log('🔍 Starting real OCR processing for file:', file.name);
      
      // Call real OCR service
      const ocrResult = await processImage(file);

      if (!ocrResult) {
        throw new Error('OCR nu a returnat rezultate');
      }

      console.log('✅ OCR processing completed:', ocrResult);

      // Update file state with OCR results
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'uploaded', 
              progress: 100,
              ocrData: ocrResult 
            } 
          : f
      ));

      // Update selected file if it's the current one
      if (selectedFile?.id === fileId) {
        setSelectedFile(prev => prev ? { 
          ...prev, 
          status: 'uploaded', 
          progress: 100,
          ocrData: ocrResult 
        } : prev);
      }

      return ocrResult;
    } catch (error) {
      console.error('❌ OCR processing error:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error', progress: 75 } : f
      ));
      
      toast({
        title: 'Eroare procesare OCR',
        description: error instanceof Error ? error.message : 'Eroare necunoscută',
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

        const storagePath = data?.path || fileName;

        // Update status to uploaded and store storage path
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, status: 'uploaded', progress: 50, storagePath }
            : f
        ));

        // Process OCR only for images
        if (fileObj.file.type.startsWith('image/')) {
          console.log('📸 Image detected, starting OCR processing...');
          await processOCR(fileObj.file, fileObj.id);
        } else {
          console.log('📄 Non-image file, skipping OCR');
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, status: 'uploaded', progress: 100 } : f
          ));
        }

        // Keep selected file updated with storagePath
        if (selectedFile?.id === fileObj.id) {
          setSelectedFile(prev => prev ? { ...prev, storagePath } : prev);
        }

        toast({
          title: 'Succes',
          description: `${fileObj.file.name} a fost încărcat și procesat cu succes.`
        });

        // Auto-select first uploaded file for form
        if (selectedFile === null) {
          setSelectedFile({ ...fileObj, status: 'uploaded', progress: 100, storagePath });
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
          ocrData={selectedFile.ocrData}
          fileId={selectedFile.id}
          filePath={selectedFile.storagePath}
          onSave={handleDocumentSaved}
          onCancel={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
};