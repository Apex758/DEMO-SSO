import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { supabaseBWithToken } from "@/lib/supabaseB";
import { validateTokenVersion } from "@/lib/session-validation";

export async function GET(req: Request) {
  try {
    // First validate the token version to check if session is still valid
    const validation = await validateTokenVersion();
    
    if (!validation.valid) {
      return NextResponse.json({ error: "Session invalidated. Please log in again." }, { status: 401 });
    }
    
    const { token: accessToken } = await auth0.getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabaseB = supabaseBWithToken(accessToken);
    const { data, error } = await supabaseB
      .from("progress")
      .select("id, user_sub, member_state_id, lesson_id, status, updated_at")
      .order("updated_at", { ascending: false });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ progress: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}