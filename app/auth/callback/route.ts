import { NextRequest, NextResponse } from "next/server";
import { backendReady, database } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code && backendReady) {
    const { error } = await (await database()).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/?auth=ok", request.url));
  }
  return NextResponse.redirect(new URL("/?auth=error", request.url));
}
