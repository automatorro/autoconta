-- Add setup_skipped column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN setup_skipped BOOLEAN DEFAULT false;

-- Add vat_intra_community column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN vat_intra_community TEXT;

-- Add comments to explain the columns
COMMENT ON COLUMN public.user_profiles.setup_skipped IS 'Indicates if the user skipped the initial setup process';
COMMENT ON COLUMN public.user_profiles.vat_intra_community IS 'VAT intra-community status (yes/no)';