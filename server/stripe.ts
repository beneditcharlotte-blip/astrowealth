import Stripe from "stripe";
import { Router, raw } from "express";
import { getDb } from "./db";
import { purchases, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { PRODUCTS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // @ts-ignore - Stripe API version
  apiVersion: "2025-04-30.basil",
});

export function createStripeRouter() {
  const router = Router();

  // Webhook endpoint - MUST use raw body for signature verification
  router.post("/api/stripe/webhook", raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("[Stripe Webhook] Signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle test events
    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(session);
          break;
        }
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`[Stripe] PaymentIntent succeeded: ${paymentIntent.id}`);
          break;
        }
      }
    } catch (err) {
      console.error("[Stripe Webhook] Error processing event:", err);
    }

    res.json({ received: true });
  });

  return router;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const productType = session.metadata?.product_type;

  if (!userId || !productType) {
    console.error("[Stripe] Missing metadata in checkout session:", session.id);
    return;
  }

  const db = await getDb();
  if (!db) return;

  // Update purchase status to completed
  await db
    .update(purchases)
    .set({
      status: "completed",
      stripePaymentIntentId: session.payment_intent as string,
    })
    .where(eq(purchases.stripeSessionId, session.id));

  // Update user's stripe customer ID if not set
  if (session.customer) {
    await db
      .update(users)
      .set({ stripeCustomerId: session.customer as string })
      .where(eq(users.id, parseInt(userId)));
  }

  console.log(`[Stripe] Purchase completed for user ${userId}, product: ${productType}`);
}

/**
 * Create a Stripe checkout session for report unlock.
 */
export async function createCheckoutSession(opts: {
  userId: number;
  userEmail?: string | null;
  userName?: string | null;
  origin: string;
}) {
  const product = PRODUCTS.REPORT_UNLOCK;

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: product.currency,
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceAmount,
        },
        quantity: 1,
      },
    ],
    client_reference_id: opts.userId.toString(),
    customer_email: opts.userEmail || undefined,
    metadata: {
      user_id: opts.userId.toString(),
      product_type: product.productType,
      customer_name: opts.userName || "",
    },
    allow_promotion_codes: true,
    success_url: `${opts.origin}/result?payment=success`,
    cancel_url: `${opts.origin}/result?payment=cancelled`,
  });

  // Create pending purchase record
  const db = await getDb();
  if (db) {
    await db.insert(purchases).values({
      userId: opts.userId,
      productType: product.productType,
      stripeSessionId: session.id,
      status: "pending",
    });
  }

  return { url: session.url };
}

/**
 * Check if a user has an active (completed) report unlock purchase.
 */
export async function hasReportAccess(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.userId, userId),
        eq(purchases.productType, "report_unlock"),
        eq(purchases.status, "completed")
      )
    )
    .limit(1);

  return result.length > 0;
}
