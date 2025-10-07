-- Create a SECURITY DEFINER function to create or link a company by CIF
-- Ensures the current user gets owner access for newly created companies.
-- If a company with the same CIF already exists:
--  - If the current user is already an owner, returns the company.
--  - If there is no owner, assigns current user as owner and returns the company.
--  - If another owner exists, raises an exception to prevent unauthorized linking.
-- This function bypasses RLS safely via controlled logic and returns a row
-- the caller can read thanks to policies that allow creators/owners to SELECT.

BEGIN;

CREATE OR REPLACE FUNCTION public.create_or_link_company(
  p_company_name text,
  p_company_type text,
  p_cif text,
  p_cnp text,
  p_vat_payer boolean,
  p_address_street text,
  p_address_city text,
  p_address_county text,
  p_address_postal_code text,
  p_contact_phone text,
  p_contact_email text
)
RETURNS public.companies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company public.companies;
  v_owner_uuid uuid;
BEGIN
  -- Try to find existing company by CIF (unique)
  SELECT c.* INTO v_company
  FROM public.companies c
  WHERE c.cif = p_cif
  LIMIT 1;

  IF v_company IS NULL THEN
    -- Create new company
    INSERT INTO public.companies (
      company_name,
      company_type,
      cif,
      cnp,
      vat_payer,
      address_street,
      address_city,
      address_county,
      address_postal_code,
      contact_phone,
      contact_email,
      created_by
    ) VALUES (
      p_company_name,
      p_company_type,
      p_cif,
      p_cnp,
      p_vat_payer,
      p_address_street,
      p_address_city,
      p_address_county,
      p_address_postal_code,
      p_contact_phone,
      p_contact_email,
      auth.uid()
    )
    RETURNING * INTO v_company;

    -- Grant owner access to current user and mark default
    INSERT INTO public.user_company_access (user_id, company_id, role, is_default)
    VALUES (auth.uid(), v_company.id, 'owner', true)
    ON CONFLICT (user_id, company_id) DO UPDATE SET role = EXCLUDED.role;

    RETURN v_company;
  END IF;

  -- Company exists: check if there is an owner
  SELECT uca.user_id INTO v_owner_uuid
  FROM public.user_company_access uca
  WHERE uca.company_id = v_company.id AND uca.role = 'owner'
  LIMIT 1;

  IF v_owner_uuid IS NULL THEN
    -- No owner recorded: assign current user as owner
    INSERT INTO public.user_company_access (user_id, company_id, role, is_default)
    VALUES (auth.uid(), v_company.id, 'owner', true)
    ON CONFLICT (user_id, company_id) DO UPDATE SET role = EXCLUDED.role;

    RETURN v_company;
  ELSIF v_owner_uuid = auth.uid() THEN
    -- Current user already owner: ensure access row exists
    INSERT INTO public.user_company_access (user_id, company_id, role, is_default)
    VALUES (auth.uid(), v_company.id, 'owner', true)
    ON CONFLICT (user_id, company_id) DO UPDATE SET role = EXCLUDED.role;

    RETURN v_company;
  ELSE
    -- Another owner exists: prevent unauthorized linking
    RAISE EXCEPTION 'Company with CIF % already exists and is owned by another user', p_cif
      USING ERRCODE = '42501';
  END IF;
END;
$$;

-- Allow authenticated users to execute the RPC
GRANT EXECUTE ON FUNCTION public.create_or_link_company(
  text, text, text, text, boolean, text, text, text, text, text, text
) TO authenticated;

COMMIT;