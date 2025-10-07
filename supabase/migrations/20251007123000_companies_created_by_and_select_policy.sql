-- Add created_by to companies and adjust SELECT policy to prevent RLS on insert returning
DO $$
DECLARE
  v_nulls integer;
BEGIN
  -- 1) Add column created_by (nullable initially for safe backfill)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN created_by uuid;
  END IF;

  -- 2) Backfill created_by from existing owner access where available
  UPDATE public.companies c
  SET created_by = uca.user_id
  FROM public.user_company_access uca
  WHERE uca.company_id = c.id AND uca.role = 'owner' AND c.created_by IS NULL;

  -- 3) Set default for future inserts
  ALTER TABLE public.companies ALTER COLUMN created_by SET DEFAULT auth.uid();

  -- 3.1) Conditionally enforce NOT NULL only if no NULLs remain
  SELECT COUNT(*) INTO v_nulls FROM public.companies WHERE created_by IS NULL;
  IF v_nulls = 0 THEN
    ALTER TABLE public.companies ALTER COLUMN created_by SET NOT NULL;
  END IF;

  -- 4) Replace SELECT policy to allow creators to view their newly inserted rows
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Users can view companies they have access to'
  ) THEN
    DROP POLICY "Users can view companies they have access to" ON public.companies;
  END IF;

  CREATE POLICY "Users can view companies they have access to or created"
    ON public.companies FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.user_company_access uca
        WHERE uca.user_id = auth.uid() AND uca.company_id = public.companies.id
      )
      OR public.companies.created_by = auth.uid()
    );
END $$;

-- Note: INSERT policy remains unchanged and permissive; creators can now SELECT their own newly inserted companies