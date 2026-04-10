import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

const VALID_ENTITY_TYPES = ["rfq_project", "company", "user", "contract"];

async function ensureAdminNotesTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS admin_notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INT NOT NULL,
      admin_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_entity (entity_type, entity_id),
      INDEX idx_admin (admin_id),
      CONSTRAINT fk_admin_notes_user FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  );
}

// GET /api/admin/notes?entity_type=rfq_project&entity_id=123
export async function GET(request: Request) {
  try {
    await ensureAdminNotesTable();

    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entity_type");
    const entityId = Number(searchParams.get("entity_id"));

    if (!entityType || !VALID_ENTITY_TYPES.includes(entityType) || !entityId || Number.isNaN(entityId)) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    const notes = await query<Array<{
      id: number;
      content: string;
      admin_name: string;
      created_at: string;
    }>>(
      `SELECT n.id, n.content, CONCAT(u.first_name, ' ', u.last_name) as admin_name, n.created_at
       FROM admin_notes n
       JOIN users u ON n.admin_id = u.id
       WHERE n.entity_type = ? AND n.entity_id = ?
       ORDER BY n.created_at DESC`,
      [entityType, entityId]
    );

    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error("Error fetching admin notes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/admin/notes
export async function POST(request: Request) {
  try {
    await ensureAdminNotesTable();

    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { entity_type, entity_id, content } = body;

    if (!entity_type || !VALID_ENTITY_TYPES.includes(entity_type)) {
      return NextResponse.json({ error: "Tipo de entidad inválido" }, { status: 400 });
    }

    if (!entity_id || !Number.isFinite(Number(entity_id))) {
      return NextResponse.json({ error: "ID de entidad inválido" }, { status: 400 });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Contenido vacío" }, { status: 400 });
    }

    await query(
      `INSERT INTO admin_notes (entity_type, entity_id, admin_id, content) VALUES (?, ?, ?, ?)`,
      [entity_type, Number(entity_id), user.id, content.trim()]
    );

    return NextResponse.json({ success: true, message: "Nota creada" });
  } catch (error) {
    console.error("Error creating admin note:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE /api/admin/notes?id=123
export async function DELETE(request: Request) {
  try {
    await ensureAdminNotesTable();

    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const noteId = Number(searchParams.get("id"));

    if (!noteId || Number.isNaN(noteId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Only allow deleting own notes (or super_admin can delete any)
    if (user.role === "super_admin") {
      await query("DELETE FROM admin_notes WHERE id = ?", [noteId]);
    } else {
      await query("DELETE FROM admin_notes WHERE id = ? AND admin_id = ?", [noteId, user.id]);
    }

    return NextResponse.json({ success: true, message: "Nota eliminada" });
  } catch (error) {
    console.error("Error deleting admin note:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
