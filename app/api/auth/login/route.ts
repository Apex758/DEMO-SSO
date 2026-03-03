import { NextResponse } from "next/server";

export async function GET() {
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const audience = process.env.AUTH0_AUDIENCE;
  const baseUrl = process.env.AUTH0_BASE_URL || "http://localhost:3000";
  
  const loginUrl = new URL(`https://${domain}/authorize`);
  loginUrl.searchParams.set("response_type", "code");
  loginUrl.searchParams.set("client_id", clientId || "");
  loginUrl.searchParams.set("redirect_uri", `${baseUrl}/api/auth/callback`);
  loginUrl.searchParams.set("scope", "openid profile email");
  
  if (audience) {
    loginUrl.searchParams.set("audience", audience);
  }
  
  return NextResponse.redirect(loginUrl);
}