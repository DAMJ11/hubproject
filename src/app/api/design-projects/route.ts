import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { createNotificationBulk } from "@/lib/notifications";

const VALID_CATEGORIES = [
  "collections", "tech_packs", "patterns", "illustration", "branding", "consulting",
];

const VALID_STATUSES = ["draft", "open", "in_progress", "review", "completed", "cancelled"];

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "DP-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/design-projects — list design projects
// Brands: see their own projects. Designers: see open projects. Admin: see all.
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

    let whereSql = `FROM design_projects dp
      JOIN companies c ON dp.brand_company_id = c.id
      JOIN users u ON dp.created_by_user_id = u.id
      WHERE 1=1`;
    const params: (string | number)[] = [];

    if (hasRole(user, "brand")) {
      if (!user.companyId) {
        return NextResponse.json({ success: false, message: "Brand without company" }, { status: 403 });
      }
      whereSql += ` AND dp.brand_company_id = ?`;
      params.push(user.companyId);
    } else if (hasRole(user, "designer")) {
      // Designers see open projects + projects assigned to them
      whereSql += ` AND (dp.status = 'open' OR dp.designer_profile_id = (SELECT id FROM designer_profiles WHERE user_id = ?))`;
      params.push(user.id);
    }
    // Admin sees all

    if (status && VALID_STATUSES.includes(status)) {
      whereSql += ` AND dp.status = ?`;
      params.push(status);
    }

    if (category && VALID_CATEGORIES.includes(category)) {
      whereSql += ` AND dp.category = ?`;
      params.push(category);
    }

    if (search && search.trim().length >= 2) {
      const s = `%${search.trim()}%`;
      whereSql += ` AND (dp.title LIKE ? OR dp.description LIKE ?)`;
      params.push(s, s);
    }

    // Count
    const countResult = await query<Array<{ total: number }>>(
      `SELECT COUNT(*) as total ${whereSql}`,
      params
    );
    const total = Number(countResult?.[0]?.total ?? 0);

    // Rows
    const rows = await query(
      `SELECT dp.id, dp.code, dp.title, dp.category, dp.status, dp.season,
              dp.budget_min, dp.budget_max, dp.currency, dp.deadline,
              dp.proposals_deadline, dp.proposals_count,
              dp.created_at, dp.updated_at,
              c.name as brand_name, c.logo_url as brand_logo,
              (SELECT dpr.display_name FROM designer_profiles dpr WHERE dpr.id = dp.designer_profile_id) as assigned_designer_name
       ${whereSql}
       ORDER BY dp.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET design-projects error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST /api/design-projects — brand creates a design project
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "brand") || !user.companyId) {
      return NextResponse.json({ success: false, message: "Only brands can create design projects" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title, description, category, season, budgetMin, budgetMax, currency,
      deadline, proposalsDeadline, referenceImages, status: reqStatus,
    } = body;

    // Validate required fields
    if (!title || title.trim().length < 3) {
      return NextResponse.json({ success: false, message: "Title is required (min 3 chars)" }, { status: 400 });
    }
    if (!description || description.trim().length < 10) {
      return NextResponse.json({ success: false, message: "Description is required (min 10 chars)" }, { status: 400 });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ success: false, message: "Invalid category" }, { status: 400 });
    }

    // Validate budget
    if (budgetMin !== undefined && budgetMin !== null && Number(budgetMin) < 0) {
      return NextResponse.json({ success: false, message: "Budget cannot be negative" }, { status: 400 });
    }

    // Generate unique code
    let code = generateCode();
    let codeExists = await queryOne(`SELECT id FROM design_projects WHERE code = ?`, [code]);
    let attempts = 0;
    while (codeExists && attempts < 10) {
      code = generateCode();
      codeExists = await queryOne(`SELECT id FROM design_projects WHERE code = ?`, [code]);
      attempts++;
    }

    const projectStatus = reqStatus === "open" ? "open" : "draft";

    // Serialize reference images
    const refImagesStr = Array.isArray(referenceImages) ? JSON.stringify(referenceImages) : referenceImages || null;

    const result = await query<{ insertId: number }>(
      `INSERT INTO design_projects (code, brand_company_id, created_by_user_id, category, title, description,
        reference_images, season, budget_min, budget_max, currency, deadline, proposals_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, user.companyId, user.id, category, title.trim(), description.trim(),
        refImagesStr,
        season || null,
        budgetMin ?? null, budgetMax ?? null,
        currency || "USD",
        deadline || null,
        proposalsDeadline || null,
        projectStatus,
      ]
    );

    const insertId = (result as unknown as { insertId: number }).insertId;

    // If published (open), notify all designers
    if (projectStatus === "open") {
      const designers = await query<Array<{ user_id: number }>>(
        `SELECT user_id FROM designer_profiles WHERE availability_status != 'unavailable'`
      );
      if (Array.isArray(designers) && designers.length > 0) {
        const designerUserIds = designers.map((d) => d.user_id);
        createNotificationBulk(designerUserIds, {
          title: "New Design Project",
          message: `A new design project "${title.trim()}" is looking for designers.`,
          type: "design_project",
          referenceType: "design_project",
          referenceId: insertId,
        }).catch(console.error);
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: insertId, code },
      message: projectStatus === "open" ? "Project published" : "Project saved as draft",
    }, { status: 201 });
  } catch (error) {
    console.error("POST design-projects error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
