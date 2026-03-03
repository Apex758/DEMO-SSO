import { createClient } from "@supabase/supabase-js";

export function supabaseAWithToken(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_A!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_A!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: { persistSession: false },
    }
  );
}