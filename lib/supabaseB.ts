import { createClient } from "@supabase/supabase-js";

export function supabaseBWithToken(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_B!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: { persistSession: false },
    }
  );
}