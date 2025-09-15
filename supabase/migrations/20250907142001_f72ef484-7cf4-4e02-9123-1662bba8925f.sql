-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'receipt', 'expense')),
  document_number TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  supplier_name TEXT NOT NULL,
  supplier_cif TEXT NOT NULL,
  supplier_address TEXT,
  net_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RON' CHECK (currency IN ('RON', 'EUR', 'USD')),
  category TEXT NOT NULL CHECK (category IN ('combustibil', 'reparatii', 'asigurari', 'spalatorie', 'service', 'consumabile', 'parcari', 'amenzi', 'comisioane', 'altele')),
  description TEXT NOT NULL,
  file_path TEXT NOT NULL,
  ocr_confidence DECIMAL(3,2),
  ocr_extracted_text TEXT,
  ocr_extracted_cif TEXT,
  ocr_extracted_amount DECIMAL(10,2),
  ocr_extracted_date TEXT,
  ocr_extracted_supplier TEXT,
  ocr_corrections JSONB,
  verified BOOLEAN NOT NULL DEFAULT false,
  vehicle_id UUID,
  reconciled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage policies for documents
CREATE POLICY "Users can view their own document files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own document files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own document files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own document files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_date ON public.documents(date);
CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_documents_verified ON public.documents(verified);
CREATE INDEX idx_documents_reconciled ON public.documents(reconciled);