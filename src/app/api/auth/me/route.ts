import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
