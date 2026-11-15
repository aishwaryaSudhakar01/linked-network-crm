ALTER TABLE public.profiles ADD COLUMN reminder_dormant_days integer NOT NULL DEFAULT 14;
UPDATE public.profiles SET reminder_dormant_days = GREATEST(14, reminder_reply_days + 3);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_dormant_timing CHECK (reminder_dormant_days > 0 AND reminder_dormant_days >= reminder_reply_days + 3);