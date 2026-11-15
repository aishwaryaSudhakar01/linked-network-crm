ALTER TABLE public.profiles ALTER COLUMN onboarding_step SET DEFAULT 2;
COMMENT ON COLUMN public.profiles.encryption_salt IS 'DEPRECATED: retained only for owner-device conversion of legacy encrypted contacts.';
COMMENT ON COLUMN public.profiles.encryption_verifier IS 'DEPRECATED: retained only until legacy contact conversion completes.';
CREATE OR REPLACE FUNCTION public.finish_notes_conversion() RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 IF EXISTS (SELECT 1 FROM public.contacts WHERE user_id = auth.uid() AND data->>'notes_storage' IS DISTINCT FROM 'plain-v1') THEN RAISE EXCEPTION 'Existing notes still need conversion'; END IF;
 UPDATE public.profiles SET encryption_salt = NULL, encryption_verifier = NULL, onboarding_step = GREATEST(onboarding_step, 2) WHERE user_id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.finish_notes_conversion() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finish_notes_conversion() TO authenticated;