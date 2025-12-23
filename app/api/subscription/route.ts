import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    const supabaseAdmin = getSupabaseAdminClient();
    const stripe = getStripe();

    if (!userId) {
      return NextResponse.json({ isPro: false, plan: "free" });
    }

    if (!supabaseAdmin) {
      console.warn('Supabase admin not configured. Returning free plan.');
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