ALTER TABLE public.profiles ADD COLUMN reminder_initial_days integer NOT NULL DEFAULT 5 CHECK (reminder_initial_days > 0), ADD COLUMN reminder_reply_days integer NOT NULL DEFAULT 7 CHECK (reminder_reply_days > 0), ADD COLUMN reminder_talking_days integer NOT NULL DEFAULT 7 CHECK (reminder_talking_days > 0), ADD COLUMN reminder_keep_days integer NOT NULL DEFAULT 90 CHECK (reminder_keep_days > 0);
ALTER TABLE public.contacts ADD COLUMN stage_rules_version integer NOT NULL DEFAULT 2;
UPDATE public.contacts SET data = jsonb_set(data, '{stage}', to_jsonb(CASE data->>'stage' WHEN 'Replied' THEN 'Talking' WHEN 'Ongoing' THEN 'Keep in touch' END)), stage_rules_version = 2 WHERE data->>'stage' IN ('Replied','Ongoing');
CREATE TABLE public.template_initializations (user_id uuid PRIMARY KEY, initialized_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.template_initializations TO service_role;
ALTER TABLE public.template_initializations ENABLE ROW LEVEL SECURITY;
INSERT INTO public.template_initializations (user_id) SELECT user_id FROM public.profiles ON CONFLICT (user_id) DO NOTHING;
CREATE FUNCTION public.seed_account_templates(_user_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
BEGIN
INSERT INTO public.template_initializations(user_id) VALUES (_user_id) ON CONFLICT (user_id) DO NOTHING;
IF NOT FOUND THEN RETURN; END IF;
INSERT INTO public.templates(user_id,name,type,subject,body) VALUES
(_user_id,'LinkedIn connection request','LinkedIn connection request','','Hi {{first_name}}, I''m {{my_first_name}} at {{my_school}}. I''d love to connect and learn about your work at {{company}}.'),
(_user_id,'Cold email','Email','Learning about {{company}}','Hi {{first_name}},\nI''m a student at {{my_school}} interested in your work at {{company}}. Would you have time for a short chat?\n\nBest,\n{{my_full_name}}'),
(_user_id,'Coffee chat ask','Email','Coffee chat?','Hi {{first_name}},\nCould we find 20 minutes to talk about your experience at {{company}}? Here''s my calendar: {{calendly_link}}\n\nBest,\n{{my_full_name}}'),
(_user_id,'Thank you after a chat','Email','Thank you','Hi {{first_name}},\nThanks for taking the time to chat. I really appreciated your advice.\n\nBest,\n{{my_full_name}}'),
(_user_id,'Follow-up after no reply','Email','Following up','Hi {{first_name}},\nJust following up on my note. I''d still love to learn about your work if you have time.\n\nBest,\n{{my_full_name}}'),
(_user_id,'Referral ask','Email','A question about {{company}}','Hi {{first_name}},\nI found a role at {{company}} that interests me. Would you feel comfortable referring me? Happy to share my resume.\n\nBest,\n{{my_full_name}}');
END $function$;
REVOKE ALL ON FUNCTION public.seed_account_templates(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.seed_account_templates(uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.initialize_account() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
BEGIN
INSERT INTO public.profiles(user_id,first_name,last_name) VALUES(NEW.id,coalesce(NEW.raw_user_meta_data->>'first_name',''),coalesce(NEW.raw_user_meta_data->>'last_name','')) ON CONFLICT (user_id) DO NOTHING;
PERFORM public.seed_account_templates(NEW.id);
RETURN NEW;
END $function$;