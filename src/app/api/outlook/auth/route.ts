import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.OUTLOOK_CLIENT_ID;
  const redirectUri = process.env.OUTLOOK_REDIRECT_URI || "http://localhost:3000/api/outlook/callback";

  if (!clientId) {
    return NextResponse.json({ error: "OUTLOOK_CLIENT_ID not configured" }, { status: 500 });
  }

  const scopes = ["openid", "profile", "Mail.Read", "Mail.Read.Shared"];
  const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes.join(" "));
  authUrl.searchParams.set("response_mode", "query");

  return NextResponse.redirect(authUrl.toString());
}
