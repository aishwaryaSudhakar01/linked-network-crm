CREATE OR REPLACE FUNCTION public.seed_account_templates(_user_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
BEGIN
INSERT INTO public.template_initializations(user_id) VALUES (_user_id) ON CONFLICT (user_id) DO NOTHING;
IF NOT FOUND THEN RETURN; END IF;
INSERT INTO public.templates(user_id,name,type,subject,body) VALUES
(_user_id,'LinkedIn connection request (under 300 characters)','LinkedIn connection request','',$body$Hi {{first_name}}, I'm {{my_first_name}}, a student at {{my_school}}. [One line on why them: something they posted, built, or a path you want to understand.] Would be glad to connect.$body$),
(_user_id,'Cold email','Email','{{my_school}} student, a question about {{company}}',$body$Hi {{first_name}},

I'm {{my_first_name}}, a student at {{my_school}}. I'm reaching out because [one specific reason: something they wrote, built, or how they got into their role].

Would you have 20 minutes in the next couple of weeks? Happy to work around your schedule.

Best,
{{my_full_name}}$body$),
(_user_id,'Coffee chat ask','Email','20 minutes in the next few weeks?',$body$Hi {{first_name}},

Great to connect after {{met_at}}. I'd love to hear more about your work at {{company}}, especially [one thing you want to understand].

Would you have 20 minutes in the next couple of weeks? You can pick a time that suits you here: {{calendly_link}}

Best,
{{my_full_name}}$body$),
(_user_id,'Follow-up after no reply','Email','Following up',$body$Hi {{first_name}},

Following up in case my last note got buried. I'd still value 20 minutes to hear how you think about [topic]. If now isn't a good time, no worries at all.

Best,
{{my_full_name}}$body$),
(_user_id,'Thank you after a chat (send within 24 hours)','Email','Thank you',$body$Hi {{first_name}},

Thanks again for your time today. Your point about [one thing they said] stuck with me, and I'm going to [one thing you'll do because of it]. I'll let you know how it goes.

Best,
{{my_full_name}}$body$),
(_user_id,'Referral ask (only after a real conversation)','Email','Applied for [role] at {{company}}',$body$Hi {{first_name}},

I just applied for [role] at {{company}}, and our conversation about [topic] is a big part of why. Would you be open to referring me or flagging my name with the team? I can send my resume and a short summary to make it easy.

Best,
{{my_full_name}}$body$);
END $function$;
REVOKE ALL ON FUNCTION public.seed_account_templates(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.seed_account_templates(uuid) TO service_role;