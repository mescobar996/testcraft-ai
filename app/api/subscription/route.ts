import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ isPro: false, plan: "free" });
    }

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error || !data) {
      return NextResponse.json({ isPro: false, plan: "free" });
    }

    return NextResponse.json({
      isPro: data.plan === "pro",
      plan: data.plan,
      status: data.status,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ isPro: false, plan: "free" });
  }
}
