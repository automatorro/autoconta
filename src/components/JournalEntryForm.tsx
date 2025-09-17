import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Calculator, FileText, Eye } from 'lucide-react';
import { accountingService, type ChartOfAccounts, type JournalEntry, type JournalEntryLine } from '@/services/accountingService';

interface JournalEntryFormProps {
  onEntryCreated?: () => void;
}

interface EntryLineForm {
  account_id: string;
  account_code: string;
  account_name: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
}

export function JournalEntryForm({ onEntryCreated }: JournalEntryFormProps) {
  const [accounts, setAccounts] = useState<ChartOfAccounts[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entryLines, setEntryLines] = useState<JournalEntryLine[]>([]);
  const [showLinesDialog, setShowLinesDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    description: '',
    entry_date: new Date().toISOString().split('T')[0],
    reference_document: ''
  });
  
  const [lines, setLines] = useState<EntryLineForm[]>([
    {
      account_id: '',
      account_code: '',
      account_name: '',
      description: '',
      debit_amount: 0,
      credit_amount: 0
    },
    {
      account_id: '',
      account_code: '',
      account_name: '',
      description: '',
      debit_amount: 0,
      credit_amount: 0
    }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, entriesData] = await Promise.all([
        accountingService.getChartOfAccounts(),
        accountingService.getJournalEntries()
      ]);
      setAccounts(accountsData);
      setEntries(entriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const addLine = () => {
    setLines(prev => [...prev, {
      account_id: '',
      account_code: '',
      account_name: '',
      description: '',
      debit_amount: 0,
      credit_amount: 0
    }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: keyof EntryLineForm, value: any) => {
    setLines(prev => prev.map((line, i) => {
      if (i === index) {
        const updatedLine = { ...line, [field]: value };
        
        // If account is selected, update account info
        if (field === 'account_id') {
          const account = accounts.find(acc => acc.id === value);
          if (account) {
            updatedLine.account_code = account.account_code;
            updatedLine.account_name = account.account_name;
          }
        }
        
        return updatedLine;
      }
      return line;
    }));
  };

  const getTotalDebits = () => {
    return lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
  };

  const getTotalCredits = () => {
    return lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
  };

  const isBalanced = () => {
    const debits = getTotalDebits();
    const credits = getTotalCredits();
    return Math.abs(debits - credits) < 0.01 && debits > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.entry_date) {
      toast.error('Vă rugăm să completați toate câmpurile obligatorii');
      return;
    }

    if (!isBalanced()) {
      toast.error('Înregistrarea nu este echilibrată. Debitele trebuie să fie egale cu creditele.');
      return;
    }

    const validLines = lines.filter(line => 
      line.account_id && (line.debit_amount > 0 || line.credit_amount > 0)
    );

    if (validLines.length < 2) {
      toast.error('Înregistrarea trebuie să aibă cel puțin 2 linii valide');
      return;
    }

    try {
      await accountingService.createJournalEntry(
        formData.description,
        formData.entry_date,
        validLines.map(line => ({
          account_code: line.account_code,
          account_name: line.account_name,
          description: line.description,
          debit_amount: line.debit_amount || 0,
          credit_amount: line.credit_amount || 0,
          line_order: 0 // Will be set by the service
        })),
        formData.reference_document || undefined
      );
      
      toast.success('Înregistrarea contabilă a fost creată cu succes');
      resetForm();
      setIsDialogOpen(false);
      await loadData();
      onEntryCreated?.();
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast.error('Eroare la crearea înregistrării contabile');
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      entry_date: new Date().toISOString().split('T')[0],
      reference_document: ''
    });
    setLines([
      {
        account_id: '',
        account_code: '',
        account_name: '',
        description: '',
        debit_amount: 0,
        credit_amount: 0
      },
      {
        account_id: '',
        account_code: '',
        account_name: '',
        description: '',
        debit_amount: 0,
        credit_amount: 0
      }
    ]);
  };

  const viewEntryLines = async (entry: JournalEntry) => {
    try {
      const lines = await accountingService.getJournalEntryLines(entry.id);
      setEntryLines(lines);
      setSelectedEntry(entry);
      setShowLinesDialog(true);
    } catch (error) {
      console.error('Error loading entry lines:', error);
      toast.error('Eroare la încărcarea liniilor înregistrării');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Se încarcă înregistrările contabile...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Jurnal Contabil</CardTitle>
              <CardDescription>
                Gestionați înregistrările contabile și jurnalul general
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Înregistrare nouă
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Înregistrare contabilă nouă</DialogTitle>
                  <DialogDescription>
                    Creați o nouă înregistrare în jurnalul contabil
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entry_date">Data înregistrării *</Label>
                      <Input
                        id="entry_date"
                        type="date"
                        value={formData.entry_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reference_document">Document de referință</Label>
                      <Input
                        id="reference_document"
                        value={formData.reference_document}
                        onChange={(e) => setFormData(prev => ({ ...prev, reference_document: e.target.value }))}
                        placeholder="ex: Factura nr. 123"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descriere *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrierea înregistrării contabile..."
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-base font-semibold">Linii contabile</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addLine}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adaugă linie
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {lines.map((line, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-12 gap-4 items-end">
                            <div className="col-span-3">
                              <Label>Cont contabil *</Label>
                              <Select
                                value={line.account_id}
                                onValueChange={(value) => updateLine(index, 'account_id', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selectați contul" />
                                </SelectTrigger>
                                <SelectContent>
                                  {accounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                      {account.account_code} - {account.account_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="col-span-3">
                              <Label>Descriere</Label>
                              <Input
                                value={line.description}
                                onChange={(e) => updateLine(index, 'description', e.target.value)}
                                placeholder="Descrierea operațiunii"
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <Label>Debit (RON)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={line.debit_amount || ''}
                                onChange={(e) => updateLine(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <Label>Credit (RON)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={line.credit_amount || ''}
                                onChange={(e) => updateLine(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                              />
                            </div>
                            
                            <div className="col-span-2">
                              {lines.length > 2 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeLine(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium">Total Debit:</span> {formatCurrency(getTotalDebits())}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Total Credit:</span> {formatCurrency(getTotalCredits())}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Diferență:</span> {formatCurrency(getTotalDebits() - getTotalCredits())}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4" />
                          <Badge variant={isBalanced() ? 'default' : 'destructive'}>
                            {isBalanced() ? 'Echilibrată' : 'Neechilibrată'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Anulează
                    </Button>
                    <Button type="submit" disabled={!isBalanced()}>
                      Creează înregistrarea
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nr. înregistrare</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Descriere</TableHead>
                  <TableHead>Document referință</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nu există înregistrări contabile
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono font-medium">
                        {entry.entry_number}
                      </TableCell>
                      <TableCell>
                        {new Date(entry.entry_date).toLocaleDateString('ro-RO')}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {entry.description}
                      </TableCell>
                      <TableCell>
                        {entry.reference_document || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(entry.total_debit)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.is_balanced ? 'default' : 'destructive'}>
                          {entry.is_balanced ? 'Echilibrată' : 'Neechilibrată'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewEntryLines(entry)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Entry Lines Dialog */}
      <Dialog open={showLinesDialog} onOpenChange={setShowLinesDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Detalii înregistrare: {selectedEntry?.entry_number}
            </DialogTitle>
            <DialogDescription>
              {selectedEntry?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Data:</span> {selectedEntry && new Date(selectedEntry.entry_date).toLocaleDateString('ro-RO')}
              </div>
              <div>
                <span className="font-medium">Document:</span> {selectedEntry?.reference_document || '-'}
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cont</TableHead>
                    <TableHead>Descriere</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entryLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-mono">
                        {line.account_code} - {line.account_name}
                      </TableCell>
                      <TableCell>
                        {line.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {line.debit_amount > 0 ? formatCurrency(line.debit_amount) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {line.credit_amount > 0 ? formatCurrency(line.credit_amount) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium">
                Total: {selectedEntry && formatCurrency(selectedEntry.total_debit)}
              </div>
              <Badge variant={selectedEntry?.is_balanced ? 'default' : 'destructive'}>
                {selectedEntry?.is_balanced ? 'Echilibrată' : 'Neechilibrată'}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}