import { createServerFn } from '@tanstack/react-start';

// Public by design: the sign-in page uses this to tell a brand-new visitor
// "no account exists for this email" instead of a generic error.
export const checkAccountExists = createServerFn({ method: 'POST' })
  .inputValidator((email: string) => {
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new Error('A valid email is required.');
    }
    return email.trim().toLowerCase();
  })
  .handler(async ({ data: email }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw new Error('Could not check the account right now.');
    return data.users.some((user) => user.email?.toLowerCase() === email);
  });
