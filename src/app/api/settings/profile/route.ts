import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string | null;
  preferredCurrency?: string;
}

const MAX_BASE64_LENGTH = 8_000_000;
const ALLOWED_CURRENCIES = ["USD", "EUR"];

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateProfileBody;

    const firstName = (body.firstName ?? "").trim();
    const lastName = (body.lastName ?? "").trim();
    const email = (body.email ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const avatarUrl = body.avatarUrl ?? null;
    const preferredCurrency = ALLOWED_CURRENCIES.includes(body.preferredCurrency ?? "")
      ? body.preferredCurrency!
      : undefined;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    if (avatarUrl && !avatarUrl.startsWith("data:image/")) {
      return NextResponse.json({ success: false, message: "Invalid avatar format" }, { status: 400 });
    }

    if (avatarUrl && avatarUrl.length > MAX_BASE64_LENGTH) {
      return NextResponse.json({ success: false, message: "Avatar image too large" }, { status: 400 });
    }

    const emailRows = await query<Array<{ id: number }>>(
      "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
      [email, user.id]
    );

    if (emailRows.length > 0) {
      return NextResponse.json({ success: false, message: "Email already in use" }, { status: 409 });
    }

    await query(
      `UPDATE users
       SET first_name = ?, last_name = ?, email = ?, phone = ?, avatar_url = ?${preferredCurrency ? ", preferred_currency = ?" : ""}, updated_at = NOW()
       WHERE id = ?`,
      preferredCurrency
        ? [firstName, lastName, email, phone || null, avatarUrl, preferredCurrency, user.id]
        : [firstName, lastName, email, phone || null, avatarUrl, user.id]
    );

    return NextResponse.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error("PUT settings profile error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
