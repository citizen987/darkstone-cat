import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const baseUrl = new URL("/", request.url).origin;

  if (!token_hash || !type) {
    return NextResponse.redirect(`${baseUrl}/login?confirmed=error`);
  }

  // Temporary response — Supabase needs somewhere to write cookies during
  // verification, but we intentionally discard them so no session is created.
  // The email gets confirmed server-side; the user will log in manually.
  const tempResponse = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            tempResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?confirmed=error`);
  }

  // Clean redirect — no session cookies, just the confirmation message
  return NextResponse.redirect(`${baseUrl}/login?confirmed=success`);
}
