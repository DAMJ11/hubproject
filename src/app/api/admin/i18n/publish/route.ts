import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, hasRole } from "@/lib/session";
import { type I18nLocale, ensureI18nTables, getKeyRowByPath, getNextVersion, insertAuditLog, syncI18nKeys } from "@/lib/i18n-editor";
import { query, queryOne } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user || !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 });
    }

    await ensureI18nTables();
    await syncI18nKeys();

    const body = await request.json();
    const keyPath = typeof body.keyPath === "string" ? body.keyPath.trim() : "";
    const locale = typeof body.locale === "string" ? (body.locale.trim() as I18nLocale) : "";

    if (!keyPath || !locale) {
      return NextResponse.json({ success: false, message: "Datos invalidos" }, { status: 400 });
    }

    const keyRow = await getKeyRowByPath(keyPath);

    if (!keyRow) {
      return NextResponse.json({ success: false, message: "Clave no encontrada" }, { status: 404 });
    }

    const [latestDraft, currentPublished, nextVersion] = await Promise.all([
      queryOne<{ value_text: string }>(
        `SELECT value_text
         FROM i18n_values
         WHERE key_id = ? AND locale = ? AND status = 'draft'
         ORDER BY version DESC
         LIMIT 1`,
        [keyRow.id, locale],
      ),
      queryOne<{ value_text: string }>(
        `SELECT value_text
         FROM i18n_values
         WHERE key_id = ? AND locale = ? AND status = 'published'
         ORDER BY version DESC
         LIMIT 1`,
        [keyRow.id, locale],
      ),
      getNextVersion(keyRow.id, locale),
    ]);

    if (!latestDraft) {
      return NextResponse.json({ success: false, message: "No hay borrador para publicar" }, { status: 400 });
    }

    await query(
      "UPDATE i18n_values SET status = 'archived' WHERE key_id = ? AND locale = ? AND status IN ('draft', 'published')",
      [keyRow.id, locale],
    );

    await query(
      `INSERT INTO i18n_values (
        key_id,
        locale,
        value_text,
        status,
        version,
        created_by_user_id,
        published_by_user_id,
        published_at
      ) VALUES (?, ?, ?, 'published', ?, ?, ?, NOW())`,
      [keyRow.id, locale, latestDraft.value_text, nextVersion, user.id, user.id],
    );

    await insertAuditLog({
      keyPath,
      locale,
      oldValue: currentPublished?.value_text ?? null,
      newValue: latestDraft.value_text,
      action: "publish",
      changedByUserId: user.id,
    });

    return NextResponse.json({ success: true, message: "Publicado correctamente" });
  } catch (error) {
    console.error("POST /api/admin/i18n/publish error:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
