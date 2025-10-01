import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Document, ExpenseCategory } from '@/types/accounting';

export const useDocuments = () => {
  const { authUser, documents, addDocument, setDocuments } = useAppStore();
  const { toast } = useToast();

  const loadDocuments = async () => {
    if (!authUser) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDocuments: Document[] = data.map(doc => ({
        id: doc.id,
        type: doc.type as 'expense' | 'invoice' | 'receipt',
        documentNumber: doc.document_number,
        date: new Date(doc.date),
        supplier: {
          name: doc.supplier_name,
          cif: doc.supplier_cif,
          address: doc.supplier_address
        },
        amount: {
          netAmount: doc.net_amount,
          vatAmount: doc.vat_amount,
          totalAmount: doc.total_amount,
          vatRate: doc.vat_rate
        },
        currency: doc.currency as 'RON' | 'EUR' | 'USD',
        category: doc.category as ExpenseCategory,
        description: doc.description,
        filePath: doc.file_path,
        verified: doc.verified,
        vehicleId: doc.vehicle_id,
        reconciled: doc.reconciled,
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at)
      }));

      setDocuments(formattedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca documentele.',
        variant: 'destructive'
      });
    }
  };

  const refreshDocuments = () => {
    loadDocuments();
  };

  useEffect(() => {
    loadDocuments();
  }, [authUser]);

  return {
    documents,
    loadDocuments,
    refreshDocuments
  };
};