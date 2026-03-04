import { createClient } from "@supabase/supabase-js";

export function supabaseBWithToken(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_C!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_C!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: { persistSession: false },
    }
  );
}