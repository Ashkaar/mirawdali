import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;
  const client = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (changes) => {
        for (const { name, value } of changes) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of changes) response.cookies.set(name, value, options);
      },
    },
  });
  if (request.cookies.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"))) {
    await client.auth.getClaims();
  }
  return response;
}

export const config = { matcher: ["/media/:path*", "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:webp|ico|svg|png|jpg|css)$).*)"] };
