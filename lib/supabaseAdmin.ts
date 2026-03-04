// lib/supabaseAdmin.ts

import { createClient } from '@supabase/supabase-js';


export function supabaseAdminA() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_A!,
    process.env.SUPABASE_SERVICE_ROLE_KEY_A!,
    {
      auth: { persistSession: false },
    }
  );
}