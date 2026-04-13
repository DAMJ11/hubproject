import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { stripe } from "@/lib/stripe";

// POST /api/designer/stripe-connect — initiate Stripe Connect onboarding
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    const profile = await queryOne<{
      id: number;
      stripe_connect_id: string | null;
      stripe_onboarded: boolean;
    }>(
      `SELECT id, stripe_connect_id, stripe_onboarded FROM designer_profiles WHERE user_id = ?`,
      [user.id]
    );

    if (!profile) {
      return NextResponse.json({ success: false, message: "Designer profile not found" }, { status: 404 });
    }

    let accountId = profile.stripe_connect_id;

    // Create Stripe Connect account if not exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          designer_profile_id: String(profile.id),
          user_id: String(user.id),
        },
      });
      accountId = account.id;
      await query(
        `UPDATE designer_profiles SET stripe_connect_id = ? WHERE id = ?`,
        [accountId, profile.id]
      );
    }

    // Create account link for onboarding
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/es/dashboard/payout-settings?refresh=true`,
      return_url: `${appUrl}/es/dashboard/payout-settings?onboarded=true`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      success: true,
      data: { url: accountLink.url },
    });
  } catch (error) {
    console.error("POST designer/stripe-connect error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// GET /api/designer/stripe-connect — get Stripe Connect status
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    const profile = await queryOne<{
      id: number;
      stripe_connect_id: string | null;
      stripe_onboarded: boolean;
    }>(
      `SELECT id, stripe_connect_id, stripe_onboarded FROM designer_profiles WHERE user_id = ?`,
      [user.id]
    );

    if (!profile) {
      return NextResponse.json({ success: false, message: "Designer profile not found" }, { status: 404 });
    }

    let isOnboarded = profile.stripe_onboarded;

    // If they have a connect account but not marked as onboarded, check with Stripe
    if (profile.stripe_connect_id && !isOnboarded) {
      try {
        const account = await stripe.accounts.retrieve(profile.stripe_connect_id);
        if (account.charges_enabled && account.payouts_enabled) {
          isOnboarded = true;
          await query(
            `UPDATE designer_profiles SET stripe_onboarded = TRUE WHERE id = ?`,
            [profile.id]
          );
        }
      } catch {
        // Stripe account may have been deleted
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        hasAccount: !!profile.stripe_connect_id,
        isOnboarded,
      },
    });
  } catch (error) {
    console.error("GET designer/stripe-connect error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
