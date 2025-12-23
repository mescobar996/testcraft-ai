import { NextRequest, NextResponse } from "next/server";
import { getStripe } from '@/lib/stripe';

const stripe = getStripe();

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

    if (!stripe) {
      console.error('Stripe is not configured');
      return NextResponse.json({ error: 'Payment provider not configured' }, { status: 500 });
    }

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      console.error('Stripe price ID not configured');
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Error al crear sesión de pago" },
      { status: 500 }
    );
  }
}
