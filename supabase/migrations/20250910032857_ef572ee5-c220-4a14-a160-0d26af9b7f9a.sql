-- Add VAT intra-community field to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN vat_intra_community TEXT NOT NULL DEFAULT '';