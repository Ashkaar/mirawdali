import { NextRequest, NextResponse } from "next/server";
import { backendReady, database } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (token_hash && (type === "email" || type === "recovery") && backendReady) {
    const { error } = await (await database()).auth.verifyOtp({ token_hash, type });
    if (!error) return NextResponse.redirect(new URL(type === "recovery" ? "/?auth=recovery" : "/?auth=ok", request.url));
  }
  return NextResponse.redirect(new URL("/?auth=error", request.url));
}
