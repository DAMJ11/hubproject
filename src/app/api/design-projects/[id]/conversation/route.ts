import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { createNotification } from "@/lib/notifications";

// POST /api/design-projects/[id]/conversation — create a conversation for a design project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const projectId = Number(id);
    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ success: false, message: "Invalid project ID" }, { status: 400 });
    }

    const body = await request.json();
    const { subject, initialMessage } = body;

    if (!subject || typeof subject !== "string" || subject.length > 300) {
      return NextResponse.json({ success: false, message: "Subject is required (max 300 chars)" }, { status: 400 });
    }

    // Get the design project with its accepted proposal
    const project = await queryOne<{
      id: number;
      brand_company_id: number;
      title: string;
      status: string;
    }>(
      `SELECT id, brand_company_id, title, status FROM design_projects WHERE id = ?`,
      [projectId]
    );

    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    // Get accepted proposal to find the designer
    const acceptedProposal = await queryOne<{
      designer_profile_id: number;
    }>(
      `SELECT designer_profile_id FROM design_proposals 
       WHERE design_project_id = ? AND status = 'accepted' LIMIT 1`,
      [projectId]
    );

    // Determine if user is the brand owner or the designer
    const isBrand = user.companyId === project.brand_company_id;

    let designerProfileId: number | null = null;
    if (acceptedProposal) {
      designerProfileId = acceptedProposal.designer_profile_id;
    }

    // If designer is initiating, verify they are the accepted designer
    if (!isBrand && hasRole(user, "designer")) {
      const myProfile = await queryOne<{ id: number }>(
        `SELECT id FROM designer_profiles WHERE user_id = ?`,
        [user.id]
      );
      if (!myProfile || (designerProfileId && myProfile.id !== designerProfileId)) {
        return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
      }
      designerProfileId = myProfile.id;
    }

    if (!isBrand && !designerProfileId) {
      return NextResponse.json({ success: false, message: "Not authorized for this project" }, { status: 403 });
    }

    // Check for existing conversation on this project
    const existing = await queryOne<{ id: number }>(
      `SELECT id FROM conversations 
       WHERE design_project_id = ? AND brand_company_id = ? 
       AND (designer_profile_id = ? OR designer_profile_id IS NULL)
       LIMIT 1`,
      [projectId, project.brand_company_id, designerProfileId || null]
    );

    if (existing) {
      return NextResponse.json({
        success: true,
        data: { conversationId: existing.id },
        message: "Conversation already exists",
      });
    }

    // Create conversation
    const result = await query<{ insertId: number }>(
      `INSERT INTO conversations 
        (design_project_id, brand_company_id, designer_profile_id, initiated_by_user_id, subject, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'open', NOW(), NOW())`,
      [projectId, project.brand_company_id, designerProfileId, user.id, subject]
    );

    const conversationId = (result as unknown as { insertId: number }).insertId;

    // Add initial message if provided
    if (initialMessage && typeof initialMessage === "string" && initialMessage.trim()) {
      await query(
        `INSERT INTO messages (conversation_id, sender_id, content, created_at)
         VALUES (?, ?, ?, NOW())`,
        [conversationId, user.id, initialMessage.trim().substring(0, 2000)]
      );
      await query(
        `UPDATE conversations SET last_message_at = NOW() WHERE id = ?`,
        [conversationId]
      );
    }

    // Notify the other party
    if (isBrand && designerProfileId) {
      const designer = await queryOne<{ user_id: number }>(
        `SELECT user_id FROM designer_profiles WHERE id = ?`,
        [designerProfileId]
      );
      if (designer) {
        createNotification({
          userId: designer.user_id,
          title: "New conversation",
          message: `Brand started a conversation about: ${project.title}`,
          type: "design_project",
          referenceType: "conversation",
          referenceId: conversationId,
        }).catch(() => {});
      }
    } else {
      // Notify brand users
      const brandUsers = await query<Array<{ id: number }>>(
        `SELECT id FROM users WHERE company_id = ?`,
        [project.brand_company_id]
      );
      if (Array.isArray(brandUsers)) {
        for (const bu of brandUsers) {
          createNotification({
            userId: bu.id,
            title: "New conversation",
            message: `Designer started a conversation about: ${project.title}`,
            type: "design_project",
            referenceType: "conversation",
            referenceId: conversationId,
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { conversationId },
    }, { status: 201 });
  } catch (error) {
    console.error("POST design-project conversation error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
