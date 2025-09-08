import { useState, useCallback } from 'react';
import { ocrService, OCRResult } from '@/services/ocrService';
import { useToast } from '@/hooks/use-toast';

export interface UseOCRReturn {
  processImage: (file: File) => Promise<OCRResult | null>;
  isProcessing: boolean;
  error: string | null;
}

export const useOCR = (): UseOCRReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const processImage = useCallback(async (file: File): Promise<OCRResult | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Fișierul trebuie să fie o imagine');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Imaginea este prea mare. Mărimea maximă este 10MB');
      }

      toast({
        title: 'Procesez imaginea...',
        description: 'OCR în curs de desfășurare. Vă rugăm așteptați.'
      });

      const result = await ocrService.processImage(file);

      if (result.confidence < 30) {
        toast({
          title: 'Calitate scăzută OCR',
          description: 'Datele extrase au o încredere scăzută. Verificați și corectați manual.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'OCR Completat',
          description: `Datele au fost extrase cu ${result.confidence}% încredere. Verificați corectitudinea.`
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Eroare necunoscută la procesarea OCR';
      setError(errorMessage);
      
      toast({
        title: 'Eroare OCR',
        description: errorMessage,
        variant: 'destructive'
      });

      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  return {
    processImage,
    isProcessing,
    error
  };
};