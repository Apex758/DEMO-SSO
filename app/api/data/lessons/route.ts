import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { supabaseAWithToken } from "@/lib/supabaseA";

export async function GET(req: Request) {
  try {
    const { token: accessToken } = await auth0.getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabaseA = supabaseAWithToken(accessToken);
    const { data, error } = await supabaseA
      .from("lessons")
      .select("id, member_state_id, grade_level, title")
      .order("id", { ascending: true });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ lessons: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}