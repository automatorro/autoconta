import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Download, Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { accountingService, type TrialBalance, type IncomeStatement, type BalanceSheet } from '@/services/accountingService';

export function FinancialReports() {
  const [trialBalance, setTrialBalance] = useState<TrialBalance[]>([]);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [reportDates, setReportDates] = useState({
    trialBalanceDate: new Date().toISOString().split('T')[0],
    incomeStartDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    incomeEndDate: new Date().toISOString().split('T')[0],
    balanceSheetDate: new Date().toISOString().split('T')[0]
  });

  const loadTrialBalance = async () => {
    try {
      setLoading(true);
      const data = await accountingService.getTrialBalance(reportDates.trialBalanceDate);
      setTrialBalance(data);
      toast.success('Balanța de verificare a fost încărcată');
    } catch (error) {
      console.error('Error loading trial balance:', error);
      toast.error('Eroare la încărcarea balanței de verificare');
    } finally {
      setLoading(false);
    }
  };

  const loadIncomeStatement = async () => {
    try {
      setLoading(true);
      const data = await accountingService.getIncomeStatement(
        reportDates.incomeStartDate,
        reportDates.incomeEndDate
      );
      setIncomeStatement(data);
      toast.success('Contul de profit și pierdere a fost încărcat');
    } catch (error) {
      console.error('Error loading income statement:', error);
      toast.error('Eroare la încărcarea contului de profit și pierdere');
    } finally {
      setLoading(false);
    }
  };

  const loadBalanceSheet = async () => {
    try {
      setLoading(true);
      const data = await accountingService.getBalanceSheet(reportDates.balanceSheetDate);
      setBalanceSheet(data);
      toast.success('Bilanțul a fost încărcat');
    } catch (error) {
      console.error('Error loading balance sheet:', error);
      toast.error('Eroare la încărcarea bilanțului');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header.toLowerCase().replace(/\s+/g, '_')];
        return typeof value === 'number' ? value.toFixed(2) : `"${value || ''}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapoarte Financiare
          </CardTitle>
          <CardDescription>
            Generați și vizualizați rapoartele financiare conform standardelor românești
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="trial-balance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trial-balance">Balanța de Verificare</TabsTrigger>
          <TabsTrigger value="income-statement">Profit și Pierdere</TabsTrigger>
          <TabsTrigger value="balance-sheet">Bilanț</TabsTrigger>
        </TabsList>

        {/* Trial Balance */}
        <TabsContent value="trial-balance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Balanța de Verificare</CardTitle>
                  <CardDescription>
                    Situația soldurilor conturilor la o dată specificată
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {trialBalance.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(
                        trialBalance,
                        'balanta_verificare',
                        ['Cod Cont', 'Denumire Cont', 'Tip Cont', 'Sold Debit', 'Sold Credit', 'Sold Net']
                      )}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="trial-balance-date">Data raportului</Label>
                  <Input
                    id="trial-balance-date"
                    type="date"
                    value={reportDates.trialBalanceDate}
                    onChange={(e) => setReportDates(prev => ({ ...prev, trialBalanceDate: e.target.value }))}
                  />
                </div>
                <Button onClick={loadTrialBalance} disabled={loading}>
                  <Calculator className="h-4 w-4 mr-2" />
                  {loading ? 'Se încarcă...' : 'Generează raport'}
                </Button>
              </div>

              {trialBalance.length > 0 && (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cod Cont</TableHead>
                          <TableHead>Denumire Cont</TableHead>
                          <TableHead>Tip Cont</TableHead>
                          <TableHead className="text-right">Sold Debit</TableHead>
                          <TableHead className="text-right">Sold Credit</TableHead>
                          <TableHead className="text-right">Sold Net</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trialBalance.map((account) => (
                          <TableRow key={account.account_code}>
                            <TableCell className="font-mono font-medium">
                              {account.account_code}
                            </TableCell>
                            <TableCell>{account.account_name}</TableCell>
                            <TableCell>
                              <Badge className={getAccountTypeColor(account.account_type)}>
                                {account.account_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {account.debit_balance > 0 ? formatCurrency(account.debit_balance) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {account.credit_balance > 0 ? formatCurrency(account.credit_balance) : '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              <span className={account.net_balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(Math.abs(account.net_balance))}
                                {account.net_balance < 0 && ' (Cr)'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.debit_balance, 0))}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Debite</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.credit_balance, 0))}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Credite</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Statement */}
        <TabsContent value="income-statement">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contul de Profit și Pierdere</CardTitle>
                  <CardDescription>
                    Situația veniturilor și cheltuielilor pentru o perioadă specificată
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {incomeStatement && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const data = [
                          ...incomeStatement.revenue_accounts.map(acc => ({ ...acc, category: 'Venituri' })),
                          ...incomeStatement.expense_accounts.map(acc => ({ ...acc, category: 'Cheltuieli' }))
                        ];
                        exportToCSV(
                          data,
                          'profit_pierdere',
                          ['Categorie', 'Cod Cont', 'Denumire Cont', 'Sold Net']
                        );
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="income-start-date">Data început</Label>
                  <Input
                    id="income-start-date"
                    type="date"
                    value={reportDates.incomeStartDate}
                    onChange={(e) => setReportDates(prev => ({ ...prev, incomeStartDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="income-end-date">Data sfârșit</Label>
                  <Input
                    id="income-end-date"
                    type="date"
                    value={reportDates.incomeEndDate}
                    onChange={(e) => setReportDates(prev => ({ ...prev, incomeEndDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <Button onClick={loadIncomeStatement} disabled={loading}>
                <TrendingUp className="h-4 w-4 mr-2" />
                {loading ? 'Se încarcă...' : 'Generează raport'}
              </Button>

              {incomeStatement && (
                <div className="space-y-6">
                  {/* Revenue Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-600">Venituri</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cod Cont</TableHead>
                            <TableHead>Denumire Cont</TableHead>
                            <TableHead className="text-right">Sumă</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {incomeStatement.revenue_accounts.map((account) => (
                            <TableRow key={account.account_code}>
                              <TableCell className="font-mono">{account.account_code}</TableCell>
                              <TableCell>{account.account_name}</TableCell>
                              <TableCell className="text-right font-medium text-green-600">
                                {formatCurrency(account.net_balance)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2">
                            <TableCell colSpan={2} className="font-semibold">Total Venituri</TableCell>
                            <TableCell className="text-right font-bold text-green-600">
                              {formatCurrency(incomeStatement.total_revenue)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Expense Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-600">Cheltuieli</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cod Cont</TableHead>
                            <TableHead>Denumire Cont</TableHead>
                            <TableHead className="text-right">Sumă</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {incomeStatement.expense_accounts.map((account) => (
                            <TableRow key={account.account_code}>
                              <TableCell className="font-mono">{account.account_code}</TableCell>
                              <TableCell>{account.account_name}</TableCell>
                              <TableCell className="text-right font-medium text-red-600">
                                {formatCurrency(account.net_balance)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2">
                            <TableCell colSpan={2} className="font-semibold">Total Cheltuieli</TableCell>
                            <TableCell className="text-right font-bold text-red-600">
                              {formatCurrency(incomeStatement.total_expenses)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Net Income */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {incomeStatement.net_income >= 0 ? (
                            <TrendingUp className="h-6 w-6 text-green-600" />
                          ) : (
                            <TrendingDown className="h-6 w-6 text-red-600" />
                          )}
                          <span className="text-lg font-semibold">
                            {incomeStatement.net_income >= 0 ? 'Profit Net' : 'Pierdere Netă'}
                          </span>
                        </div>
                        <div className={`text-2xl font-bold ${
                          incomeStatement.net_income >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(incomeStatement.net_income))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Perioada: {new Date(incomeStatement.period_start).toLocaleDateString('ro-RO')} - {new Date(incomeStatement.period_end).toLocaleDateString('ro-RO')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bilanț</CardTitle>
                  <CardDescription>
                    Situația patrimonială la o dată specificată
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {balanceSheet && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const data = [
                          ...balanceSheet.assets.map(acc => ({ ...acc, category: 'Active' })),
                          ...balanceSheet.liabilities.map(acc => ({ ...acc, category: 'Pasive' })),
                          ...balanceSheet.equity.map(acc => ({ ...acc, category: 'Capitaluri' }))
                        ];
                        exportToCSV(
                          data,
                          'bilant',
                          ['Categorie', 'Cod Cont', 'Denumire Cont', 'Sold Net']
                        );
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="balance-sheet-date">Data bilanțului</Label>
                  <Input
                    id="balance-sheet-date"
                    type="date"
                    value={reportDates.balanceSheetDate}
                    onChange={(e) => setReportDates(prev => ({ ...prev, balanceSheetDate: e.target.value }))}
                  />
                </div>
                <Button onClick={loadBalanceSheet} disabled={loading}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  {loading ? 'Se încarcă...' : 'Generează raport'}
                </Button>
              </div>

              {balanceSheet && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Assets */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">ACTIVE</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cont</TableHead>
                            <TableHead className="text-right">Sumă</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {balanceSheet.assets.map((account) => (
                            <TableRow key={account.account_code}>
                              <TableCell>
                                <div className="font-mono text-sm">{account.account_code}</div>
                                <div className="text-sm">{account.account_name}</div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(account.net_balance)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2">
                            <TableCell className="font-semibold">Total Active</TableCell>
                            <TableCell className="text-right font-bold text-blue-600">
                              {formatCurrency(balanceSheet.total_assets)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Liabilities and Equity */}
                  <div className="space-y-6">
                    {/* Liabilities */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-red-600">PASIVE</h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cont</TableHead>
                              <TableHead className="text-right">Sumă</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {balanceSheet.liabilities.map((account) => (
                              <TableRow key={account.account_code}>
                                <TableCell>
                                  <div className="font-mono text-sm">{account.account_code}</div>
                                  <div className="text-sm">{account.account_name}</div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(account.net_balance)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="border-t-2">
                              <TableCell className="font-semibold">Total Pasive</TableCell>
                              <TableCell className="text-right font-bold text-red-600">
                                {formatCurrency(balanceSheet.total_liabilities)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Equity */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-purple-600">CAPITALURI</h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cont</TableHead>
                              <TableHead className="text-right">Sumă</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {balanceSheet.equity.map((account) => (
                              <TableRow key={account.account_code}>
                                <TableCell>
                                  <div className="font-mono text-sm">{account.account_code}</div>
                                  <div className="text-sm">{account.account_name}</div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(account.net_balance)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="border-t-2">
                              <TableCell className="font-semibold">Total Capitaluri</TableCell>
                              <TableCell className="text-right font-bold text-purple-600">
                                {formatCurrency(balanceSheet.total_equity)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Total Check */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">Verificare echilibru bilanț</div>
                          <div className={`text-lg font-bold ${
                            Math.abs(balanceSheet.total_assets - (balanceSheet.total_liabilities + balanceSheet.total_equity)) < 0.01
                              ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.abs(balanceSheet.total_assets - (balanceSheet.total_liabilities + balanceSheet.total_equity)) < 0.01
                              ? '✓ Bilanț echilibrat' : '✗ Bilanț neechilibrat'
                            }
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}