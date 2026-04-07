import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type { AuthResponse } from "@/types/user";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Check if manufacturer has a payment method
    let hasPaymentMethod: boolean | undefined;
    if (user.role === "manufacturer") {
      const pm = await queryOne<{ cnt: number }>(
        "SELECT COUNT(*) as cnt FROM user_payment_methods WHERE user_id = ?",
        [user.id]
      );
      hasPaymentMethod = (pm?.cnt ?? 0) > 0;

      if (!hasPaymentMethod) {
        const stripeUser = await queryOne<{ stripe_customer_id: string | null }>(
          "SELECT stripe_customer_id FROM users WHERE id = ?",
          [user.id]
        );

        if (stripeUser?.stripe_customer_id) {
          try {
            const paymentMethods = await stripe.paymentMethods.list({
              customer: stripeUser.stripe_customer_id,
              type: "card",
              limit: 1,
            });
            if (paymentMethods.data.length > 0) {
              hasPaymentMethod = true;
            }
          } catch (stripeError) {
            console.error("Stripe payment method lookup failed:", stripeError);
          }
        }
      }
    }

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "User retrieved successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.companyId ?? null,
          ...(hasPaymentMethod !== undefined && { hasPaymentMethod }),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "An error occurred while retrieving user",
      },
      { status: 500 }
    );
  }
}
