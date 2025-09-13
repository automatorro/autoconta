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
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { accountingService, type ChartOfAccounts } from '@/services/accountingService';

interface ChartOfAccountsFormProps {
  onAccountCreated?: () => void;
}

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Active (Asset)', description: 'Bunuri și drepturi' },
  { value: 'liability', label: 'Pasive (Liability)', description: 'Datorii și obligații' },
  { value: 'equity', label: 'Capitaluri (Equity)', description: 'Capital propriu' },
  { value: 'revenue', label: 'Venituri (Revenue)', description: 'Încasări și venituri' },
  { value: 'expense', label: 'Cheltuieli (Expense)', description: 'Costuri și cheltuieli' }
];

const getAccountTypeColor = (type: string) => {
  switch (type) {
    case 'asset': return 'bg-blue-100 text-blue-800';
    case 'liability': return 'bg-red-100 text-red-800';
    case 'equity': return 'bg-purple-100 text-purple-800';
    case 'revenue': return 'bg-green-100 text-green-800';
    case 'expense': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function ChartOfAccountsForm({ onAccountCreated }: ChartOfAccountsFormProps) {
  const [accounts, setAccounts] = useState<ChartOfAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccounts | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: '',
    parent_account_id: '',
    description: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountingService.getChartOfAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Eroare la încărcarea planului de conturi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_code || !formData.account_name || !formData.account_type) {
      toast.error('Vă rugăm să completați toate câmpurile obligatorii');
      return;
    }

    try {
      if (editingAccount) {
        await accountingService.updateAccount(editingAccount.id, {
          account_code: formData.account_code,
          account_name: formData.account_name,
          account_type: formData.account_type as any,
          parent_account_id: formData.parent_account_id || undefined,
          description: formData.description
        });
        toast.success('Contul a fost actualizat cu succes');
      } else {
        await accountingService.createAccount({
          account_code: formData.account_code,
          account_name: formData.account_name,
          account_type: formData.account_type as any,
          parent_account_id: formData.parent_account_id || undefined,
          description: formData.description,
          is_active: true
        });
        toast.success('Contul a fost creat cu succes');
      }
      
      resetForm();
      setIsDialogOpen(false);
      setEditingAccount(null);
      await loadAccounts();
      onAccountCreated?.();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Eroare la salvarea contului');
    }
  };

  const handleEdit = (account: ChartOfAccounts) => {
    setEditingAccount(account);
    setFormData({
      account_code: account.account_code,
      account_name: account.account_name,
      account_type: account.account_type,
      parent_account_id: account.parent_account_id || '',
      description: account.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeactivate = async (account: ChartOfAccounts) => {
    if (!confirm(`Sigur doriți să dezactivați contul ${account.account_code} - ${account.account_name}?`)) {
      return;
    }

    try {
      await accountingService.deactivateAccount(account.id);
      toast.success('Contul a fost dezactivat');
      await loadAccounts();
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast.error('Eroare la dezactivarea contului');
    }
  };

  const handleActivate = async (account: ChartOfAccounts) => {
    try {
      await accountingService.updateAccount(account.id, { is_active: true });
      toast.success('Contul a fost reactivat');
      await loadAccounts();
    } catch (error) {
      console.error('Error activating account:', error);
      toast.error('Eroare la reactivarea contului');
    }
  };

  const resetForm = () => {
    setFormData({
      account_code: '',
      account_name: '',
      account_type: '',
      parent_account_id: '',
      description: ''
    });
  };

  const filteredAccounts = showInactive 
    ? accounts 
    : accounts.filter(account => account.is_active);

  const parentAccounts = accounts.filter(account => 
    account.is_active && 
    (!editingAccount || account.id !== editingAccount.id)
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Se încarcă planul de conturi...</div>
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
              <CardTitle>Planul de Conturi</CardTitle>
              <CardDescription>
                Gestionați planul de conturi conform standardelor românești
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showInactive ? 'Ascunde inactive' : 'Arată inactive'}
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setEditingAccount(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Cont nou
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAccount ? 'Editează cont' : 'Cont nou'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAccount 
                        ? 'Modificați detaliile contului contabil'
                        : 'Adăugați un cont nou în planul de conturi'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="account_code">Cod cont *</Label>
                        <Input
                          id="account_code"
                          value={formData.account_code}
                          onChange={(e) => setFormData(prev => ({ ...prev, account_code: e.target.value }))}
                          placeholder="ex: 411"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="account_type">Tip cont *</Label>
                        <Select
                          value={formData.account_type}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, account_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selectați tipul" />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCOUNT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div>
                                  <div className="font-medium">{type.label}</div>
                                  <div className="text-xs text-muted-foreground">{type.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="account_name">Denumire cont *</Label>
                      <Input
                        id="account_name"
                        value={formData.account_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                        placeholder="ex: Clienți"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="parent_account_id">Cont părinte (opțional)</Label>
                      <Select
                        value={formData.parent_account_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, parent_account_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selectați contul părinte" />
                        </SelectTrigger>
                        <SelectContent>
                          {parentAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.account_code} - {account.account_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descriere</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrierea contului..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Anulează
                      </Button>
                      <Button type="submit">
                        {editingAccount ? 'Actualizează' : 'Creează'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cod</TableHead>
                  <TableHead>Denumire</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Descriere</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nu există conturi în planul de conturi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono font-medium">
                        {account.account_code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {account.account_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getAccountTypeColor(account.account_type)}>
                          {ACCOUNT_TYPES.find(t => t.value === account.account_type)?.label || account.account_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.is_active ? 'default' : 'secondary'}>
                          {account.is_active ? 'Activ' : 'Inactiv'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {account.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(account)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {account.is_active ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivate(account)}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivate(account)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}