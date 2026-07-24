import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_short_link", { p_code: code }).maybeSingle();
  const target = data?.target_path ?? "/";
  return NextResponse.redirect(new URL(target, request.url));
}
