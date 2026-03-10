import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    const desc = request.nextUrl.searchParams.get("error_description") || error;
    return NextResponse.redirect(new URL(`/outlook?error=${encodeURIComponent(desc)}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/outlook?error=No+authorization+code+received", request.url));
  }

  const clientId = process.env.OUTLOOK_CLIENT_ID!;
  const clientSecret = process.env.OUTLOOK_CLIENT_SECRET!;
  const redirectUri = process.env.OUTLOOK_REDIRECT_URI || "http://localhost:3000/api/outlook/callback";

  const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    const msg = tokenData.error_description || tokenData.error || "Token exchange failed";
    return NextResponse.redirect(new URL(`/outlook?error=${encodeURIComponent(msg)}`, request.url));
  }

  // Redirect to the outlook page with the access token as a fragment (client-side only)
  const redirectUrl = new URL("/outlook", request.url);
  redirectUrl.searchParams.set("token", tokenData.access_token);
  return NextResponse.redirect(redirectUrl.toString());
}
