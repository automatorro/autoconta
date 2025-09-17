-- Creează tabelele pentru entitățile de business (SRL, PFA, șoferi în flotă)
CREATE TABLE business_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_type TEXT NOT NULL CHECK (business_type IN ('SRL_MANAGER_TRANSPORT', 'PFA', 'FLEET_DRIVER')),
    business_name TEXT NOT NULL,
    fiscal_code TEXT NOT NULL,
    registration_number TEXT,
    transport_license TEXT,
    manager_transport_license TEXT,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    bank_account TEXT,
    bank_name TEXT,
    vat_payer BOOLEAN DEFAULT FALSE,
    micro_enterprise BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pentru angajați (pentru SRL cu Manager Transport)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_entities(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    cnp TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('DRIVER', 'MANAGER_TRANSPORT', 'ADMIN')),
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    contract_type TEXT NOT NULL CHECK (contract_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pentru vehicule
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_entities(id) ON DELETE CASCADE,
    license_plate TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    vin TEXT NOT NULL,
    engine_capacity INTEGER NOT NULL,
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('DIESEL', 'GASOLINE', 'ELECTRIC', 'HYBRID')),
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('TRUCK', 'VAN', 'CAR', 'TRAILER')),
    max_weight DECIMAL(8,2) NOT NULL,
    insurance_policy TEXT NOT NULL,
    insurance_expiry DATE NOT NULL,
    itp_expiry DATE NOT NULL,
    rca_expiry DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pentru șoferi
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_entities(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    license_number TEXT NOT NULL,
    license_categories TEXT[] NOT NULL,
    license_expiry DATE NOT NULL,
    medical_certificate_expiry DATE NOT NULL,
    psycho_certificate_expiry DATE NOT NULL,
    atestat_expiry DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pentru curse/transporturi
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_entities(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    start_location TEXT NOT NULL,
    end_location TEXT NOT NULL,
    distance_km DECIMAL(8,2) NOT NULL,
    fuel_consumed DECIMAL(8,2),
    fuel_cost DECIMAL(10,2),
    toll_cost DECIMAL(10,2),
    other_expenses DECIMAL(10,2),
    revenue DECIMAL(10,2),
    client_name TEXT,
    invoice_number TEXT,
    notes TEXT,
    status TEXT NOT NULL CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) DEFAULT 'PLANNED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pentru cheltuieli
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_entities(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('FUEL', 'MAINTENANCE', 'INSURANCE', 'TOLL', 'PARKING', 'FINE', 'OTHER')),
    amount DECIMAL(10,2) NOT NULL,
    vat_amount DECIMAL(10,2),
    description TEXT NOT NULL,
    receipt_url TEXT,
    expense_date DATE NOT NULL,
    deductible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pentru venituri
CREATE TABLE revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_entities(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    invoice_number TEXT,
    amount DECIMAL(10,2) NOT NULL,
    vat_amount DECIMAL(10,2),
    description TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    payment_date DATE,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('PENDING', 'PAID', 'OVERDUE')) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pentru obligații fiscale
CREATE TABLE tax_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_entities(id) ON DELETE CASCADE,
    tax_type TEXT NOT NULL CHECK (tax_type IN ('INCOME_TAX', 'VAT', 'SOCIAL_CONTRIBUTIONS', 'HEALTH_CONTRIBUTIONS', 'UNEMPLOYMENT_CONTRIBUTIONS')),
    period TEXT NOT NULL, -- YYYY-MM format
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')) DEFAULT 'PENDING',
    declaration_file TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pentru plăți salarii (pentru SRL cu angajați)
CREATE TABLE salary_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_entities(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    period TEXT NOT NULL, -- YYYY-MM format
    gross_salary DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    income_tax DECIMAL(10,2) NOT NULL,
    social_contributions DECIMAL(10,2) NOT NULL,
    health_contributions DECIMAL(10,2) NOT NULL,
    unemployment_contributions DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID')) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexuri pentru performanță
CREATE INDEX idx_business_entities_user_id ON business_entities(user_id);
CREATE INDEX idx_employees_business_id ON employees(business_id);
CREATE INDEX idx_vehicles_business_id ON vehicles(business_id);
CREATE INDEX idx_drivers_business_id ON drivers(business_id);
CREATE INDEX idx_trips_business_id ON trips(business_id);
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX idx_expenses_business_id ON expenses(business_id);
CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX idx_revenues_business_id ON revenues(business_id);
CREATE INDEX idx_tax_obligations_business_id ON tax_obligations(business_id);
CREATE INDEX idx_salary_payments_business_id ON salary_payments(business_id);
CREATE INDEX idx_salary_payments_employee_id ON salary_payments(employee_id);

-- Triggere pentru updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_entities_updated_at BEFORE UPDATE ON business_entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenues_updated_at BEFORE UPDATE ON revenues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_obligations_updated_at BEFORE UPDATE ON tax_obligations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salary_payments_updated_at BEFORE UPDATE ON salary_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activează Row Level Security
ALTER TABLE business_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;

-- Politici RLS pentru business_entities
CREATE POLICY "Users can view their own business entities" ON business_entities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own business entities" ON business_entities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business entities" ON business_entities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own business entities" ON business_entities FOR DELETE USING (auth.uid() = user_id);

-- Politici RLS pentru celelalte tabele (bazate pe business_id)
CREATE POLICY "Users can view their business employees" ON employees FOR SELECT USING (
    EXISTS (SELECT 1 FROM business_entities WHERE id = employees.business_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert their business employees" ON employees FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM business_entities WHERE id = employees.business_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their business employees" ON employees FOR UPDATE USING (
    EXISTS (SELECT 1 FROM business_entities WHERE id = employees.business_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete their business employees" ON employees FOR DELETE USING (
    EXISTS (SELECT 1 FROM business_entities WHERE id = employees.business_id AND user_id = auth.uid())
);

-- Politici similare pentru celelalte tabele
CREATE POLICY "Users can manage their business vehicles" ON vehicles FOR ALL USING (
    EXISTS (SELECT 1 FROM business_entities WHERE id = vehicles.business_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage their business drivers" ON drivers FOR ALL USING (
    EXISTS (SELECT 1 FROM business_entities WHERE id = drivers.business_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage their business trips" ON trips FOR ALL USING (
    EXISTS (SELECT 1 FROM business_entities WHERE id = trips.business_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage their business expenses" ON expenses FOR ALL USING (
    EXISTS (SELECT 1 FROM business_entities WHERE id = expenses.business_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage their business revenues" ON revenues FOR ALL USING (
    EXISTS (SELECT 1 FROM business_entities WHERE id = revenues.business_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage their business tax obligations" ON tax_obligations FOR ALL USING (
    EXISTS (SELECT 1 FROM business_entities WHERE id = tax_obligations.business_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage their business salary payments" ON salary_payments FOR ALL USING (
    EXISTS (SELECT 1 FROM business_entities WHERE id = salary_payments.business_id AND user_id = auth.uid())
);

-- Funcții pentru calcularea profitului și obligațiilor fiscale
CREATE OR REPLACE FUNCTION calculate_monthly_profit(business_uuid UUID, target_month TEXT)
RETURNS DECIMAL AS $$
DECLARE
    total_revenue DECIMAL := 0;
    total_expenses DECIMAL := 0;
    profit DECIMAL := 0;
BEGIN
    -- Calculează veniturile totale pentru luna specificată
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue
    FROM revenues
    WHERE business_id = business_uuid
    AND TO_CHAR(invoice_date, 'YYYY-MM') = target_month;
    
    -- Calculează cheltuielile totale pentru luna specificată
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses
    FROM expenses
    WHERE business_id = business_uuid
    AND TO_CHAR(expense_date, 'YYYY-MM') = target_month;
    
    profit := total_revenue - total_expenses;
    
    RETURN profit;
END;
$$ LANGUAGE plpgsql;

-- Funcție pentru calcularea obligațiilor fiscale
CREATE OR REPLACE FUNCTION calculate_tax_obligations(business_uuid UUID, target_month TEXT)
RETURNS TABLE(
    income_tax DECIMAL,
    vat_to_pay DECIMAL,
    social_contributions DECIMAL,
    health_contributions DECIMAL
) AS $$
DECLARE
    business_type_val TEXT;
    vat_payer_val BOOLEAN;
    micro_enterprise_val BOOLEAN;
    monthly_profit DECIMAL;
    total_vat_collected DECIMAL := 0;
    total_vat_paid DECIMAL := 0;
BEGIN
    -- Obține tipul de business și statusul TVA
    SELECT be.business_type, be.vat_payer, be.micro_enterprise
    INTO business_type_val, vat_payer_val, micro_enterprise_val
    FROM business_entities be
    WHERE be.id = business_uuid;
    
    -- Calculează profitul lunar
    monthly_profit := calculate_monthly_profit(business_uuid, target_month);
    
    -- Calculează TVA de plătit (dacă este plătitor de TVA)
    IF vat_payer_val THEN
        SELECT COALESCE(SUM(vat_amount), 0) INTO total_vat_collected
        FROM revenues
        WHERE business_id = business_uuid
        AND TO_CHAR(invoice_date, 'YYYY-MM') = target_month;
        
        SELECT COALESCE(SUM(vat_amount), 0) INTO total_vat_paid
        FROM expenses
        WHERE business_id = business_uuid
        AND TO_CHAR(expense_date, 'YYYY-MM') = target_month;
        
        vat_to_pay := total_vat_collected - total_vat_paid;
    ELSE
        vat_to_pay := 0;
    END IF;
    
    -- Calculează impozitul pe venit
    IF business_type_val = 'PFA' THEN
        IF micro_enterprise_val THEN
            income_tax := monthly_profit * 0.01; -- 1% pentru microîntreprinderi
        ELSE
            income_tax := monthly_profit * 0.10; -- 10% pentru PFA normal
        END IF;
    ELSE
        income_tax := monthly_profit * 0.16; -- 16% pentru SRL
    END IF;
    
    -- Calculează contribuțiile sociale (doar pentru PFA)
    IF business_type_val = 'PFA' THEN
        social_contributions := GREATEST(monthly_profit * 0.25, 1386); -- 25% dar minim 1386 lei
        health_contributions := GREATEST(monthly_profit * 0.10, 712); -- 10% dar minim 712 lei
    ELSE
        social_contributions := 0;
        health_contributions := 0;
    END IF;
    
    RETURN QUERY SELECT income_tax, vat_to_pay, social_contributions, health_contributions;
END;
$$ LANGUAGE plpgsql;