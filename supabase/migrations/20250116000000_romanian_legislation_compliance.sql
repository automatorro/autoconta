-- Migration pentru conformitatea cu legislația română din august 2025
-- Adaugă tabele pentru autorizații transport alternativ, copii conforme și ecusoane

-- Tabel pentru autorizații de transport alternativ
CREATE TABLE IF NOT EXISTS transport_authorizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  series VARCHAR(50) NOT NULL,
  number VARCHAR(100) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issued_to_company VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel pentru copii conforme
CREATE TABLE IF NOT EXISTS certified_copies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  number VARCHAR(100) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  issuing_authority VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel pentru ecusoane
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  number VARCHAR(100) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  platform VARCHAR(100) NOT NULL,
  badge_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'lost', 'damaged')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel pentru configurări TVA (pentru gestionarea ratelor variabile)
CREATE TABLE IF NOT EXISTS vat_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_percentage DECIMAL(5,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_default BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserează ratele TVA actuale și viitoare
INSERT INTO vat_rates (rate_percentage, effective_from, effective_to, is_default, description) VALUES
(19.00, '2017-01-01', '2025-07-31', TRUE, 'Rata TVA standard până în iulie 2025'),
(20.00, '2025-08-01', NULL, FALSE, 'Rata TVA standard din august 2025');

-- Adaugă politici RLS pentru toate tabelele
ALTER TABLE transport_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE certified_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE vat_rates ENABLE ROW LEVEL SECURITY;

-- Politici pentru transport_authorizations
CREATE POLICY "Users can view their own transport authorizations" ON transport_authorizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transport authorizations" ON transport_authorizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transport authorizations" ON transport_authorizations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transport authorizations" ON transport_authorizations
  FOR DELETE USING (auth.uid() = user_id);

-- Politici pentru certified_copies
CREATE POLICY "Users can view their own certified copies" ON certified_copies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certified copies" ON certified_copies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certified copies" ON certified_copies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certified copies" ON certified_copies
  FOR DELETE USING (auth.uid() = user_id);

-- Politici pentru badges
CREATE POLICY "Users can view their own badges" ON badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badges" ON badges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own badges" ON badges
  FOR DELETE USING (auth.uid() = user_id);

-- Politici pentru vat_rates (doar citire pentru toți utilizatorii autentificați)
CREATE POLICY "Authenticated users can view VAT rates" ON vat_rates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Triggere pentru actualizarea automată a timestamp-urilor
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transport_authorizations_updated_at
  BEFORE UPDATE ON transport_authorizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certified_copies_updated_at
  BEFORE UPDATE ON certified_copies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badges_updated_at
  BEFORE UPDATE ON badges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexuri pentru performanță
CREATE INDEX idx_transport_authorizations_user_id ON transport_authorizations(user_id);
CREATE INDEX idx_transport_authorizations_company_id ON transport_authorizations(company_id);
CREATE INDEX idx_transport_authorizations_expiry_date ON transport_authorizations(expiry_date);
CREATE INDEX idx_transport_authorizations_status ON transport_authorizations(status);

CREATE INDEX idx_certified_copies_user_id ON certified_copies(user_id);
CREATE INDEX idx_certified_copies_company_id ON certified_copies(company_id);
CREATE INDEX idx_certified_copies_expiry_date ON certified_copies(expiry_date);
CREATE INDEX idx_certified_copies_status ON certified_copies(status);

CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_badges_company_id ON badges(company_id);
CREATE INDEX idx_badges_expiry_date ON badges(expiry_date);
CREATE INDEX idx_badges_platform ON badges(platform);
CREATE INDEX idx_badges_status ON badges(status);

CREATE INDEX idx_vat_rates_effective_from ON vat_rates(effective_from);
CREATE INDEX idx_vat_rates_effective_to ON vat_rates(effective_to);
CREATE INDEX idx_vat_rates_is_default ON vat_rates(is_default);

-- Funcție pentru obținerea ratei TVA active la o dată specificată
CREATE OR REPLACE FUNCTION get_active_vat_rate(target_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  vat_rate DECIMAL(5,2);
BEGIN
  SELECT rate_percentage INTO vat_rate
  FROM vat_rates
  WHERE effective_from <= target_date
    AND (effective_to IS NULL OR effective_to >= target_date)
  ORDER BY effective_from DESC
  LIMIT 1;
  
  -- Dacă nu se găsește o rată activă, returnează rata implicită
  IF vat_rate IS NULL THEN
    SELECT rate_percentage INTO vat_rate
    FROM vat_rates
    WHERE is_default = TRUE
    ORDER BY effective_from DESC
    LIMIT 1;
  END IF;
  
  RETURN COALESCE(vat_rate, 19.00);
END;
$$ LANGUAGE plpgsql;

-- Comentarii pentru documentație
COMMENT ON TABLE transport_authorizations IS 'Autorizații de transport alternativ conform legislației române';
COMMENT ON TABLE certified_copies IS 'Copii conforme ale documentelor oficiale';
COMMENT ON TABLE badges IS 'Ecusoane pentru platformele de transport';
COMMENT ON TABLE vat_rates IS 'Ratele TVA active în diferite perioade';
COMMENT ON FUNCTION get_active_vat_rate IS 'Returnează rata TVA activă pentru o dată specificată';