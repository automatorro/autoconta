-- Create companies table (entitate separată pentru companie)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL CHECK (company_type IN ('PFA', 'SRL', 'SRL-D', 'SA', 'PFA-II')),
  cif TEXT NOT NULL UNIQUE,
  cnp TEXT,
  vat_payer BOOLEAN NOT NULL DEFAULT false,
  vat_intra_community TEXT,
  address_street TEXT,
  address_city TEXT,
  address_county TEXT,
  address_postal_code TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_company_access table (many-to-many între users și companies)
CREATE TABLE IF NOT EXISTS public.user_company_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'accountant', 'viewer')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Migrează datele existente din user_profiles în companies
INSERT INTO public.companies (
  company_name, company_type, cif, cnp, vat_payer, vat_intra_community,
  address_street, address_city, address_county, address_postal_code,
  contact_phone, contact_email, created_at, updated_at
)
SELECT 
  company_name, 
  COALESCE(company_type, 'PFA'), 
  cif, 
  cnp, 
  COALESCE(vat_payer, false),
  COALESCE(vat_intra_community, ''),
  address_street, 
  address_city, 
  address_county, 
  address_postal_code,
  contact_phone, 
  contact_email,
  created_at,
  updated_at
FROM public.user_profiles
WHERE company_name IS NOT NULL AND cif IS NOT NULL;

-- Creează user_company_access pentru datele migrate
INSERT INTO public.user_company_access (user_id, company_id, role, is_default)
SELECT 
  up.user_id,
  c.id,
  'owner',
  true
FROM public.user_profiles up
JOIN public.companies c ON up.cif = c.cif
WHERE up.company_name IS NOT NULL AND up.cif IS NOT NULL;

-- Adaugă company_id la documents
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Migrează documents la companii
UPDATE public.documents d
SET company_id = uca.company_id
FROM public.user_company_access uca
WHERE d.user_id = uca.user_id AND uca.is_default = true;

-- Adaugă company_id la vehicles
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Migrează vehicles la companii
UPDATE public.vehicles v
SET company_id = uca.company_id
FROM public.user_company_access uca
WHERE v.user_id = uca.user_id AND uca.is_default = true;

-- Adaugă company_id la drivers
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Migrează drivers la companii
UPDATE public.drivers dr
SET company_id = uca.company_id
FROM public.user_company_access uca
WHERE dr.user_id = uca.user_id AND uca.is_default = true;

-- Curăță user_profiles de datele companiei (păstrăm doar datele personale)
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS company_name,
DROP COLUMN IF EXISTS company_type,
DROP COLUMN IF EXISTS cif,
DROP COLUMN IF EXISTS cnp,
DROP COLUMN IF EXISTS vat_payer,
DROP COLUMN IF EXISTS vat_intra_community,
DROP COLUMN IF EXISTS address_street,
DROP COLUMN IF EXISTS address_city,
DROP COLUMN IF EXISTS address_county,
DROP COLUMN IF EXISTS address_postal_code,
DROP COLUMN IF EXISTS contact_phone;

-- Enable RLS pentru companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- RLS policies pentru companies (vizibile pentru useri care au acces)
CREATE POLICY "Users can view companies they have access to"
ON public.companies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = companies.id
  )
);

CREATE POLICY "Users can create companies"
ON public.companies FOR INSERT
WITH CHECK (true);

CREATE POLICY "Owners can update their companies"
ON public.companies FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() 
    AND company_id = companies.id 
    AND role = 'owner'
  )
);

CREATE POLICY "Owners can delete their companies"
ON public.companies FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() 
    AND company_id = companies.id 
    AND role = 'owner'
  )
);

-- Enable RLS pentru user_company_access
ALTER TABLE public.user_company_access ENABLE ROW LEVEL SECURITY;

-- RLS policies pentru user_company_access
CREATE POLICY "Users can view their own company access"
ON public.user_company_access FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company access"
ON public.user_company_access FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update company access"
ON public.user_company_access FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access uca
    WHERE uca.user_id = auth.uid() 
    AND uca.company_id = user_company_access.company_id 
    AND uca.role = 'owner'
  )
);

CREATE POLICY "Owners can delete company access"
ON public.user_company_access FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access uca
    WHERE uca.user_id = auth.uid() 
    AND uca.company_id = user_company_access.company_id 
    AND uca.role = 'owner'
  )
);

-- Update RLS policies pentru documents (acum bazat pe company_id)
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

CREATE POLICY "Users can view documents from their companies"
ON public.documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = documents.company_id
  )
);

CREATE POLICY "Users can create documents for their companies"
ON public.documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = documents.company_id
  )
);

CREATE POLICY "Users can update documents from their companies"
ON public.documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = documents.company_id
  )
);

CREATE POLICY "Users can delete documents from their companies"
ON public.documents FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = documents.company_id
  )
);

-- Update RLS policies pentru vehicles
DROP POLICY IF EXISTS "Users can view their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can create their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON public.vehicles;

CREATE POLICY "Users can view vehicles from their companies"
ON public.vehicles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = vehicles.company_id
  )
);

CREATE POLICY "Users can create vehicles for their companies"
ON public.vehicles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = vehicles.company_id
  )
);

CREATE POLICY "Users can update vehicles from their companies"
ON public.vehicles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = vehicles.company_id
  )
);

CREATE POLICY "Users can delete vehicles from their companies"
ON public.vehicles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = vehicles.company_id
  )
);

-- Update RLS policies pentru drivers
DROP POLICY IF EXISTS "Users can view their own drivers" ON public.drivers;
DROP POLICY IF EXISTS "Users can create their own drivers" ON public.drivers;
DROP POLICY IF EXISTS "Users can update their own drivers" ON public.drivers;
DROP POLICY IF EXISTS "Users can delete their own drivers" ON public.drivers;

CREATE POLICY "Users can view drivers from their companies"
ON public.drivers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = drivers.company_id
  )
);

CREATE POLICY "Users can create drivers for their companies"
ON public.drivers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = drivers.company_id
  )
);

CREATE POLICY "Users can update drivers from their companies"
ON public.drivers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = drivers.company_id
  )
);

CREATE POLICY "Users can delete drivers from their companies"
ON public.drivers FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access
    WHERE user_id = auth.uid() AND company_id = drivers.company_id
  )
);

-- Trigger pentru updated_at la companies
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Creează index-uri pentru performanță
CREATE INDEX IF NOT EXISTS idx_user_company_access_user_id ON public.user_company_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_access_company_id ON public.user_company_access(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON public.documents(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON public.vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_company_id ON public.drivers(company_id);