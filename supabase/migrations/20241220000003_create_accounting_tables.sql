-- Create chart of accounts table
CREATE TABLE chart_of_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_code VARCHAR(20) NOT NULL UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal entries table
CREATE TABLE journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_number VARCHAR(50) NOT NULL UNIQUE,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_document VARCHAR(100),
    total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
    is_balanced BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal entry lines table
CREATE TABLE journal_entry_lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    description TEXT,
    debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    line_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_chart_of_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX idx_chart_of_accounts_active ON chart_of_accounts(is_active);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_number ON journal_entries(entry_number);
CREATE INDEX idx_journal_entry_lines_account ON journal_entry_lines(account_id);
CREATE INDEX idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);

-- Insert Romanian chart of accounts (basic structure)
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
-- ACTIVE (CLASA 1-3)
('101', 'Imobilizări necorporale', 'asset', 'Brevete, licențe, mărci comerciale, etc.'),
('102', 'Imobilizări corporale', 'asset', 'Terenuri, clădiri, echipamente, etc.'),
('103', 'Imobilizări financiare', 'asset', 'Participații, creanțe imobilizate'),
('161', 'Amortizări imobilizări necorporale', 'asset', 'Amortizări cumulate pentru imobilizări necorporale'),
('162', 'Amortizări imobilizări corporale', 'asset', 'Amortizări cumulate pentru imobilizări corporale'),
('211', 'Materii prime', 'asset', 'Stocuri de materii prime'),
('212', 'Materiale consumabile', 'asset', 'Stocuri de materiale consumabile'),
('301', 'Produse finite', 'asset', 'Stocuri de produse finite'),
('371', 'Mărfuri', 'asset', 'Stocuri de mărfuri'),
('381', 'Ajustări pentru deprecierea stocurilor', 'asset', 'Ajustări pentru deprecierea stocurilor'),
('411', 'Clienți', 'asset', 'Creanțe față de clienți'),
('413', 'Clienți - efecte de primit', 'asset', 'Efecte comerciale de primit de la clienți'),
('418', 'Clienți incerți sau în litigiu', 'asset', 'Creanțe incerte sau în litigiu'),
('4282', 'Alte creanțe în legătură cu personalul', 'asset', 'Avansuri acordate personalului'),
('431', 'Debitori diverși', 'asset', 'Alte creanțe'),
('4426', 'TVA deductibilă', 'asset', 'TVA deductibilă din achiziții'),
('4428', 'TVA neexigibilă', 'asset', 'TVA neexigibilă'),
('461', 'Debitori diverși', 'asset', 'Alți debitori'),
('5112', 'Conturi la bănci în lei', 'asset', 'Disponibilități în conturi bancare'),
('5311', 'Casa în lei', 'asset', 'Numerar în casă'),

-- PASIVE (CLASA 4-5)
('401', 'Furnizori', 'liability', 'Datorii către furnizori'),
('403', 'Furnizori - efecte de plătit', 'liability', 'Efecte comerciale de plătit către furnizori'),
('404', 'Furnizori de imobilizări', 'liability', 'Datorii către furnizorii de imobilizări'),
('421', 'Personal - salarii datorate', 'liability', 'Salarii datorate personalului'),
('431', 'Creditori diverși', 'liability', 'Alte datorii'),
('4427', 'TVA colectată', 'liability', 'TVA colectată din vânzări'),
('4428', 'TVA neexigibilă', 'liability', 'TVA neexigibilă'),
('444', 'Stat - impozite și taxe', 'liability', 'Datorii către stat'),
('462', 'Creditori diverși', 'liability', 'Alți creditori'),
('512', 'Împrumuturi pe termen scurt', 'liability', 'Împrumuturi bancare pe termen scurt'),

-- CAPITALURI (CLASA 1)
('1012', 'Capital subscris vărsat', 'equity', 'Capital social vărsat'),
('1068', 'Alte rezerve', 'equity', 'Alte rezerve'),
('117', 'Rezultatul reportat', 'equity', 'Rezultatul reportat din anii anteriori'),
('121', 'Profit sau pierdere', 'equity', 'Rezultatul exercițiului curent'),

-- VENITURI (CLASA 7)
('701', 'Venituri din vânzarea produselor finite', 'revenue', 'Venituri din vânzarea produselor finite'),
('702', 'Venituri din prestări de servicii', 'revenue', 'Venituri din prestări de servicii'),
('707', 'Venituri din vânzarea mărfurilor', 'revenue', 'Venituri din comerț'),
('758', 'Venituri din diferențe de curs valutar', 'revenue', 'Câștiguri din diferențe de curs'),
('7588', 'Alte venituri din exploatare', 'revenue', 'Alte venituri din exploatare'),

-- CHELTUIELI (CLASA 6)
('601', 'Cheltuieli cu materiile prime', 'expense', 'Cheltuieli cu materiile prime'),
('602', 'Cheltuieli cu materialele consumabile', 'expense', 'Cheltuieli cu materialele consumabile'),
('611', 'Cheltuieli cu întreținerea și reparațiile', 'expense', 'Cheltuieli cu întreținerea și reparațiile'),
('621', 'Cheltuieli cu colaboratorii', 'expense', 'Cheltuieli cu colaboratorii'),
('622', 'Cheltuieli cu comisioanele și onorariile', 'expense', 'Cheltuieli cu comisioanele și onorariile'),
('623', 'Cheltuieli de protocol și reclamă', 'expense', 'Cheltuieli de protocol și reclamă'),
('624', 'Cheltuieli cu transportul de bunuri și personal', 'expense', 'Cheltuieli cu transportul'),
('625', 'Cheltuieli cu deplasări, detașări și transferări', 'expense', 'Cheltuieli cu deplasările'),
('626', 'Cheltuieli poștale și taxe de telecomunicații', 'expense', 'Cheltuieli poștale și telecomunicații'),
('627', 'Cheltuieli cu serviciile bancare', 'expense', 'Cheltuieli bancare și financiare'),
('628', 'Alte cheltuieli cu serviciile executate de terți', 'expense', 'Alte cheltuieli cu serviciile'),
('641', 'Cheltuieli cu salariile', 'expense', 'Cheltuieli cu salariile personalului'),
('645', 'Cheltuieli cu asigurările sociale', 'expense', 'Contribuții sociale'),
('658', 'Cheltuieli din diferențe de curs valutar', 'expense', 'Pierderi din diferențe de curs'),
('681', 'Cheltuieli de exploatare', 'expense', 'Alte cheltuieli de exploatare'),
('691', 'Cheltuieli cu impozitul pe profit', 'expense', 'Impozitul pe profit');

-- Create function for trial balance
CREATE OR REPLACE FUNCTION get_trial_balance(as_of_date DATE)
RETURNS TABLE (
    account_code VARCHAR(20),
    account_name VARCHAR(255),
    account_type VARCHAR(20),
    debit_balance DECIMAL(15,2),
    credit_balance DECIMAL(15,2),
    net_balance DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        coa.account_code,
        coa.account_name,
        coa.account_type,
        COALESCE(SUM(jel.debit_amount), 0) as debit_balance,
        COALESCE(SUM(jel.credit_amount), 0) as credit_balance,
        COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0) as net_balance
    FROM chart_of_accounts coa
    LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
    WHERE coa.is_active = true
        AND (je.entry_date IS NULL OR je.entry_date <= as_of_date)
    GROUP BY coa.account_code, coa.account_name, coa.account_type
    HAVING COALESCE(SUM(jel.debit_amount), 0) != 0 OR COALESCE(SUM(jel.credit_amount), 0) != 0
    ORDER BY coa.account_code;
END;
$$ LANGUAGE plpgsql;

-- Create function for income statement
CREATE OR REPLACE FUNCTION get_income_statement(start_date DATE, end_date DATE)
RETURNS TABLE (
    revenue_accounts JSONB,
    expense_accounts JSONB,
    total_revenue DECIMAL(15,2),
    total_expenses DECIMAL(15,2)
) AS $$
DECLARE
    revenue_data JSONB;
    expense_data JSONB;
    total_rev DECIMAL(15,2);
    total_exp DECIMAL(15,2);
BEGIN
    -- Get revenue accounts
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb), COALESCE(SUM(net_balance), 0)
    INTO revenue_data, total_rev
    FROM (
        SELECT 
            coa.account_code,
            coa.account_name,
            coa.account_type,
            COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0) as net_balance
        FROM chart_of_accounts coa
        LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE coa.account_type = 'revenue'
            AND coa.is_active = true
            AND je.entry_date BETWEEN start_date AND end_date
        GROUP BY coa.account_code, coa.account_name, coa.account_type
        HAVING COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0) != 0
        ORDER BY coa.account_code
    ) t;

    -- Get expense accounts
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb), COALESCE(SUM(net_balance), 0)
    INTO expense_data, total_exp
    FROM (
        SELECT 
            coa.account_code,
            coa.account_name,
            coa.account_type,
            COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0) as net_balance
        FROM chart_of_accounts coa
        LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE coa.account_type = 'expense'
            AND coa.is_active = true
            AND je.entry_date BETWEEN start_date AND end_date
        GROUP BY coa.account_code, coa.account_name, coa.account_type
        HAVING COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0) != 0
        ORDER BY coa.account_code
    ) t;

    RETURN QUERY SELECT revenue_data, expense_data, total_rev, total_exp;
END;
$$ LANGUAGE plpgsql;

-- Create function for balance sheet
CREATE OR REPLACE FUNCTION get_balance_sheet(as_of_date DATE)
RETURNS TABLE (
    assets JSONB,
    liabilities JSONB,
    equity JSONB,
    total_assets DECIMAL(15,2),
    total_liabilities DECIMAL(15,2),
    total_equity DECIMAL(15,2)
) AS $$
DECLARE
    assets_data JSONB;
    liabilities_data JSONB;
    equity_data JSONB;
    total_ast DECIMAL(15,2);
    total_liab DECIMAL(15,2);
    total_eq DECIMAL(15,2);
BEGIN
    -- Get assets
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb), COALESCE(SUM(net_balance), 0)
    INTO assets_data, total_ast
    FROM (
        SELECT 
            coa.account_code,
            coa.account_name,
            coa.account_type,
            COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0) as net_balance
        FROM chart_of_accounts coa
        LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE coa.account_type = 'asset'
            AND coa.is_active = true
            AND (je.entry_date IS NULL OR je.entry_date <= as_of_date)
        GROUP BY coa.account_code, coa.account_name, coa.account_type
        HAVING COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0) != 0
        ORDER BY coa.account_code
    ) t;

    -- Get liabilities
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb), COALESCE(SUM(net_balance), 0)
    INTO liabilities_data, total_liab
    FROM (
        SELECT 
            coa.account_code,
            coa.account_name,
            coa.account_type,
            COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0) as net_balance
        FROM chart_of_accounts coa
        LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE coa.account_type = 'liability'
            AND coa.is_active = true
            AND (je.entry_date IS NULL OR je.entry_date <= as_of_date)
        GROUP BY coa.account_code, coa.account_name, coa.account_type
        HAVING COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0) != 0
        ORDER BY coa.account_code
    ) t;

    -- Get equity
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb), COALESCE(SUM(net_balance), 0)
    INTO equity_data, total_eq
    FROM (
        SELECT 
            coa.account_code,
            coa.account_name,
            coa.account_type,
            COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0) as net_balance
        FROM chart_of_accounts coa
        LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE coa.account_type = 'equity'
            AND coa.is_active = true
            AND (je.entry_date IS NULL OR je.entry_date <= as_of_date)
        GROUP BY coa.account_code, coa.account_name, coa.account_type
        HAVING COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0) != 0
        ORDER BY coa.account_code
    ) t;

    RETURN QUERY SELECT assets_data, liabilities_data, equity_data, total_ast, total_liab, total_eq;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view chart of accounts" ON chart_of_accounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage chart of accounts" ON chart_of_accounts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view journal entries" ON journal_entries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage journal entries" ON journal_entries FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view journal entry lines" ON journal_entry_lines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage journal entry lines" ON journal_entry_lines FOR ALL USING (auth.role() = 'authenticated');

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();