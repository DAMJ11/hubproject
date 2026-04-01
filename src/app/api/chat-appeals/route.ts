import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, hasRole } from "@/lib/session";
import {
  createAppeal,
  getUserAppealStatus,
  isUserBlocked,
  listAppeals,
  resolveAppeal,
} from "@/lib/chat-violations";

// POST /api/chat-appeals — user submits an appeal
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const conversationId = Number(body.conversationId);
    const appealText = String(body.appealText ?? "").trim();

    if (!conversationId || !appealText || appealText.length < 10) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid conversation ID and a detailed appeal (min 10 chars)." },
        { status: 400 }
      );
    }

    if (appealText.length > 2000) {
      return NextResponse.json(
        { success: false, message: "Appeal text is too long (max 2000 chars)." },
        { status: 400 }
      );
    }

    // Only blocked users can appeal
    const blocked = await isUserBlocked(user.id, conversationId);
    if (!blocked) {
      return NextResponse.json(
        { success: false, message: "You are not blocked from this conversation." },
        { status: 400 }
      );
    }

    const result = await createAppeal(user.id, conversationId, appealText);
    if (!result) {
      return NextResponse.json(
        { success: false, message: "You already have a pending appeal for this conversation." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, appealId: result.id });
  } catch (error) {
    console.error("POST chat-appeals error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// GET /api/chat-appeals — admin lists appeals, or user checks own status
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    // If user passes conversationId, return their own appeal status + block status
    const conversationId = request.nextUrl.searchParams.get("conversationId");
    if (conversationId) {
      const blocked = await isUserBlocked(user.id, Number(conversationId));
      const appeal = await getUserAppealStatus(user.id, Number(conversationId));
      return NextResponse.json({ success: true, blocked, appeal });
    }

    // Otherwise, only admins can list all appeals
    if (!hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const statusFilter = request.nextUrl.searchParams.get("status") as
      | "pending"
      | "approved"
      | "rejected"
      | null;

    const appeals = await listAppeals(statusFilter ?? undefined);
    return NextResponse.json({ success: true, appeals });
  } catch (error) {
    console.error("GET chat-appeals error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PATCH /api/chat-appeals — admin resolves an appeal
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    if (!hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const appealId = Number(body.appealId);
    const decision = body.decision as "approved" | "rejected";

    if (!appealId || !["approved", "rejected"].includes(decision)) {
      return NextResponse.json(
        { success: false, message: "Invalid appealId or decision." },
        { status: 400 }
      );
    }

    const resolved = await resolveAppeal(appealId, user.id, decision);
    if (!resolved) {
      return NextResponse.json(
        { success: false, message: "Appeal not found or already resolved." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH chat-appeals error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
