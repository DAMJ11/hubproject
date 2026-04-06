import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
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
