// lib/supabaseAdmin.ts

import { createClient } from '@supabase/supabase-js';

export function supabaseAdminA() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_A!,
    process.env.SUPABASE_SERVICE_ROLE_KEY_A!,
    { auth: { persistSession: false } }
  );
}

export function supabaseAdminB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
    process.env.SUPABASE_SERVICE_ROLE_KEY_B!,
    { auth: { persistSession: false } }
  );
}

export function supabaseAdminC() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_C!,
    process.env.SUPABASE_SERVICE_ROLE_KEY_C!,
    { auth: { persistSession: false } }
  );
}