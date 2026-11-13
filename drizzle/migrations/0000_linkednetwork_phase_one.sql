CREATE TABLE public.profiles (user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, first_name text NOT NULL DEFAULT '', last_name text NOT NULL DEFAULT '', school text NOT NULL DEFAULT '', linkedin_url text NOT NULL DEFAULT '', calendly_link text NOT NULL DEFAULT '', weekly_goal integer NOT NULL DEFAULT 5 CHECK(weekly_goal > 0), onboarding_step integer NOT NULL DEFAULT 1, encryption_salt text, encryption_verifier text, theme text NOT NULL DEFAULT 'light');
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_own ON public.profiles FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE TABLE public.contacts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), linkedin_key text, email_key text, data jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,linkedin_key), UNIQUE(user_id,email_key));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contacts_own ON public.contacts FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE TABLE public.templates (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), name text NOT NULL, type text NOT NULL, subject text NOT NULL DEFAULT '', body text NOT NULL, CHECK (type <> 'LinkedIn connection request' OR char_length(body)<=300));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT ALL ON public.templates TO service_role;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY templates_own ON public.templates FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE TYPE public.app_role AS ENUM('admin','user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_own_read ON public.user_roles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated;
CREATE TABLE public.feedback (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), type text NOT NULL, message text NOT NULL, page text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), status text NOT NULL DEFAULT 'New' CHECK(status IN ('New','Planned','Shipped','Won''t do')));
GRANT SELECT, INSERT, UPDATE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY feedback_read ON public.feedback FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY feedback_insert ON public.feedback FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND status='New');
CREATE POLICY feedback_admin_update ON public.feedback FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.total_user_count() RETURNS bigint LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF; RETURN (SELECT count(*) FROM auth.users); END $$;
REVOKE ALL ON FUNCTION public.total_user_count() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.total_user_count() TO authenticated;
CREATE FUNCTION public.initialize_account() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
INSERT INTO public.profiles(user_id,first_name,last_name) VALUES(NEW.id,coalesce(NEW.raw_user_meta_data->>'first_name',''),coalesce(NEW.raw_user_meta_data->>'last_name',''));
INSERT INTO public.templates(user_id,name,type,subject,body) VALUES
(NEW.id,'LinkedIn connection request','LinkedIn connection request','','Hi {{first_name}}, I''m {{my_first_name}} at {{my_school}}. I''d love to connect and learn about your work at {{company}}.'),
(NEW.id,'Cold email','Email','Learning about {{company}}','Hi {{first_name}},\nI''m a student at {{my_school}} interested in your work at {{company}}. Would you have time for a short chat?\n\nBest,\n{{my_full_name}}'),
(NEW.id,'Coffee chat ask','Email','Coffee chat?','Hi {{first_name}},\nCould we find 20 minutes to talk about your experience at {{company}}? Here''s my calendar: {{calendly_link}}\n\nBest,\n{{my_full_name}}'),
(NEW.id,'Thank you after a chat','Email','Thank you','Hi {{first_name}},\nThanks for taking the time to chat. I really appreciated your advice.\n\nBest,\n{{my_full_name}}'),
(NEW.id,'Follow-up after no reply','Email','Following up','Hi {{first_name}},\nJust following up on my note. I''d still love to learn about your work if you have time.\n\nBest,\n{{my_full_name}}'),
(NEW.id,'Referral ask','Email','A question about {{company}}','Hi {{first_name}},\nI found a role at {{company}} that interests me. Would you feel comfortable referring me? Happy to share my resume.\n\nBest,\n{{my_full_name}}');
RETURN NEW; END $$;
CREATE TRIGGER initialize_linkednetwork_account AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.initialize_account();