import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<{ response: NextResponse; user: User | null }> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror cookies on the request (for downstream SSR reads)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Mirror cookies on the response (sent to the browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getUser() — validates JWT against Supabase Auth.
  // Do NOT use getSession() — it only reads the local JWT without validation.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
