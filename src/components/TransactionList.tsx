import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, FileText, Link } from 'lucide-react';
import { Transaction } from '@/services/reconciliation';
import DocumentSelector from './DocumentSelector';

interface TransactionListProps {
  transactions: Transaction[];
  onMatchTransaction: (transactionId: string, documentId: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  onMatchTransaction
}) => {
  const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  // Formatare dată
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  };

  // Formatare sumă
  const formatAmount = (amount: number) => {
    return amount.toFixed(2) + ' RON';
  };

  // Deschide selectorul de documente pentru o tranzacție
  const handleOpenDocumentSelector = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsDocumentSelectorOpen(true);
  };

  // Asociază documentul selectat cu tranzacția
  const handleSelectDocument = (documentId: string) => {
    if (selectedTransactionId) {
      onMatchTransaction(selectedTransactionId, documentId);
      setSelectedTransactionId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descriere</TableHead>
            <TableHead className="text-right">Sumă</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell className="text-right">{formatAmount(transaction.amount)}</TableCell>
                <TableCell>
                  {transaction.matched ? (
                    <Badge className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Reconciliat
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Nereconciliat
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {transaction.matched && transaction.documentId ? (
                      <Button variant="outline" size="sm" className="h-8 px-2">
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        Vezi document
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => handleOpenDocumentSelector(transaction.id)}
                      >
                        <Link className="h-3.5 w-3.5 mr-1" />
                        Asociază document
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nu există tranzacții disponibile.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Selector de documente */}
      <DocumentSelector
        open={isDocumentSelectorOpen}
        onOpenChange={setIsDocumentSelectorOpen}
        onSelect={handleSelectDocument}
      />
    </div>
  );
};

export default TransactionList;