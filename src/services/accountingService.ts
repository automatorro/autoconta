import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Types for accounting system
export interface ChartOfAccounts {
  id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_account_id?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  reference_document?: string;
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  account_code: string;
  account_name: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  line_order: number;
  created_at: string;
}

export interface TrialBalance {
  account_code: string;
  account_name: string;
  account_type: string;
  debit_balance: number;
  credit_balance: number;
  net_balance: number;
}

export interface IncomeStatement {
  revenue_accounts: TrialBalance[];
  expense_accounts: TrialBalance[];
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  period_start: string;
  period_end: string;
}

export interface BalanceSheet {
  assets: TrialBalance[];
  liabilities: TrialBalance[];
  equity: TrialBalance[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  as_of_date: string;
}

class AccountingService {
  private static instance: AccountingService;

  public static getInstance(): AccountingService {
    if (!AccountingService.instance) {
      AccountingService.instance = new AccountingService();
    }
    return AccountingService.instance;
  }

  // Chart of Accounts Management
  async getChartOfAccounts(): Promise<ChartOfAccounts[]> {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('is_active', true)
      .order('account_code');

    if (error) {
      console.error('Error fetching chart of accounts:', error);
      throw new Error('Failed to fetch chart of accounts');
    }

    return data || [];
  }

  async createAccount(account: Omit<ChartOfAccounts, 'id' | 'created_at' | 'updated_at'>): Promise<ChartOfAccounts> {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .insert(account)
      .select()
      .single();

    if (error) {
      console.error('Error creating account:', error);
      throw new Error('Failed to create account');
    }

    return data;
  }

  async updateAccount(id: string, updates: Partial<ChartOfAccounts>): Promise<ChartOfAccounts> {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating account:', error);
      throw new Error('Failed to update account');
    }

    return data;
  }

  async deactivateAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('chart_of_accounts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deactivating account:', error);
      throw new Error('Failed to deactivate account');
    }
  }

  // Journal Entry Management
  async createJournalEntry(
    description: string,
    entryDate: string,
    lines: Omit<JournalEntryLine, 'id' | 'journal_entry_id' | 'created_at'>[],
    referenceDocument?: string
  ): Promise<JournalEntry> {
    // Validate that debits equal credits
    const totalDebits = lines.reduce((sum, line) => sum + line.debit_amount, 0);
    const totalCredits = lines.reduce((sum, line) => sum + line.credit_amount, 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error('Journal entry is not balanced: debits must equal credits');
    }

    // Generate entry number
    const entryNumber = await this.generateEntryNumber(entryDate);

    // Create journal entry
    const { data: journalEntry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        entry_number: entryNumber,
        entry_date: entryDate,
        description,
        reference_document: referenceDocument,
        total_debit: totalDebits,
        total_credit: totalCredits,
        is_balanced: true
      })
      .select()
      .single();

    if (entryError) {
      console.error('Error creating journal entry:', entryError);
      throw new Error('Failed to create journal entry');
    }

    // Create journal entry lines
    const linesWithEntryId = lines.map((line, index) => ({
      ...line,
      journal_entry_id: journalEntry.id,
      line_order: index + 1
    }));

    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .insert(linesWithEntryId);

    if (linesError) {
      console.error('Error creating journal entry lines:', linesError);
      // Rollback journal entry
      await supabase.from('journal_entries').delete().eq('id', journalEntry.id);
      throw new Error('Failed to create journal entry lines');
    }

    return journalEntry;
  }

  async getJournalEntries(startDate?: string, endDate?: string): Promise<JournalEntry[]> {
    let query = supabase
      .from('journal_entries')
      .select('*')
      .order('entry_date', { ascending: false })
      .order('entry_number', { ascending: false });

    if (startDate) {
      query = query.gte('entry_date', startDate);
    }
    if (endDate) {
      query = query.lte('entry_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching journal entries:', error);
      throw new Error('Failed to fetch journal entries');
    }

    return data || [];
  }

  async getJournalEntryLines(journalEntryId: string): Promise<JournalEntryLine[]> {
    const { data, error } = await supabase
      .from('journal_entry_lines')
      .select(`
        *,
        chart_of_accounts!inner(
          account_code,
          account_name
        )
      `)
      .eq('journal_entry_id', journalEntryId)
      .order('line_order');

    if (error) {
      console.error('Error fetching journal entry lines:', error);
      throw new Error('Failed to fetch journal entry lines');
    }

    return data?.map(line => ({
      ...line,
      account_code: line.chart_of_accounts.account_code,
      account_name: line.chart_of_accounts.account_name
    })) || [];
  }

  // Trial Balance and Financial Statements
  async getTrialBalance(asOfDate: string): Promise<TrialBalance[]> {
    const { data, error } = await supabase
      .rpc('get_trial_balance', { as_of_date: asOfDate });

    if (error) {
      console.error('Error fetching trial balance:', error);
      throw new Error('Failed to fetch trial balance');
    }

    return data || [];
  }

  async getIncomeStatement(startDate: string, endDate: string): Promise<IncomeStatement> {
    const { data, error } = await supabase
      .rpc('get_income_statement', { 
        start_date: startDate, 
        end_date: endDate 
      });

    if (error) {
      console.error('Error fetching income statement:', error);
      throw new Error('Failed to fetch income statement');
    }

    const result = data?.[0] || {};
    
    return {
      revenue_accounts: result.revenue_accounts || [],
      expense_accounts: result.expense_accounts || [],
      total_revenue: result.total_revenue || 0,
      total_expenses: result.total_expenses || 0,
      net_income: (result.total_revenue || 0) - (result.total_expenses || 0),
      period_start: startDate,
      period_end: endDate
    };
  }

  async getBalanceSheet(asOfDate: string): Promise<BalanceSheet> {
    const { data, error } = await supabase
      .rpc('get_balance_sheet', { as_of_date: asOfDate });

    if (error) {
      console.error('Error fetching balance sheet:', error);
      throw new Error('Failed to fetch balance sheet');
    }

    const result = data?.[0] || {};
    
    return {
      assets: result.assets || [],
      liabilities: result.liabilities || [],
      equity: result.equity || [],
      total_assets: result.total_assets || 0,
      total_liabilities: result.total_liabilities || 0,
      total_equity: result.total_equity || 0,
      as_of_date: asOfDate
    };
  }

  // Utility Methods
  private async generateEntryNumber(entryDate: string): Promise<string> {
    const year = new Date(entryDate).getFullYear();
    const { data, error } = await supabase
      .from('journal_entries')
      .select('entry_number')
      .like('entry_number', `JE-${year}-%`)
      .order('entry_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error generating entry number:', error);
      return `JE-${year}-0001`;
    }

    if (!data || data.length === 0) {
      return `JE-${year}-0001`;
    }

    const lastNumber = data[0].entry_number;
    const lastSequence = parseInt(lastNumber.split('-')[2]) || 0;
    const nextSequence = (lastSequence + 1).toString().padStart(4, '0');
    
    return `JE-${year}-${nextSequence}`;
  }

  // Romanian Accounting Specific Methods
  async createExpenseEntry(
    supplierName: string,
    documentNumber: string,
    documentDate: string,
    netAmount: number,
    vatAmount: number,
    totalAmount: number,
    expenseAccountCode: string,
    description: string
  ): Promise<JournalEntry> {
    const lines: Omit<JournalEntryLine, 'id' | 'journal_entry_id' | 'created_at'>[] = [
      {
        account_code: expenseAccountCode,
        account_name: '', // Will be populated by the database
        description: `${description} - ${supplierName}`,
        debit_amount: netAmount,
        credit_amount: 0,
        line_order: 1
      },
      {
        account_code: '4426', // TVA deductibilă
        account_name: 'TVA deductibilă',
        description: `TVA deductibilă - ${supplierName}`,
        debit_amount: vatAmount,
        credit_amount: 0,
        line_order: 2
      },
      {
        account_code: '401', // Furnizori
        account_name: 'Furnizori',
        description: `Factură ${documentNumber} - ${supplierName}`,
        debit_amount: 0,
        credit_amount: totalAmount,
        line_order: 3
      }
    ];

    return this.createJournalEntry(
      `Factură ${documentNumber} - ${supplierName}`,
      documentDate,
      lines,
      documentNumber
    );
  }

  async createIncomeEntry(
    customerName: string,
    documentNumber: string,
    documentDate: string,
    netAmount: number,
    vatAmount: number,
    totalAmount: number,
    revenueAccountCode: string,
    description: string
  ): Promise<JournalEntry> {
    const lines: Omit<JournalEntryLine, 'id' | 'journal_entry_id' | 'created_at'>[] = [
      {
        account_code: '411', // Clienți
        account_name: 'Clienți',
        description: `Factură ${documentNumber} - ${customerName}`,
        debit_amount: totalAmount,
        credit_amount: 0,
        line_order: 1
      },
      {
        account_code: revenueAccountCode,
        account_name: '', // Will be populated by the database
        description: `${description} - ${customerName}`,
        debit_amount: 0,
        credit_amount: netAmount,
        line_order: 2
      },
      {
        account_code: '4427', // TVA colectată
        account_name: 'TVA colectată',
        description: `TVA colectată - ${customerName}`,
        debit_amount: 0,
        credit_amount: vatAmount,
        line_order: 3
      }
    ];

    return this.createJournalEntry(
      `Factură ${documentNumber} - ${customerName}`,
      documentDate,
      lines,
      documentNumber
    );
  }
}

export const accountingService = AccountingService.getInstance();