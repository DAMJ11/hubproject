import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, hasRole } from "@/lib/session";
import {
  I18N_LOCALES,
  type I18nLocale,
  ensureI18nTables,
  getKeyRowByPath,
  getNextVersion,
  getValuesByKeyId,
  insertAuditLog,
  loadBaseLocaleMaps,
  syncI18nKeys,
} from "@/lib/i18n-editor";
import { query, queryOne } from "@/lib/db";

function isValidLocale(locale: string): locale is I18nLocale {
  return I18N_LOCALES.includes(locale as I18nLocale);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user || !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 });
    }

    await ensureI18nTables();
    await syncI18nKeys();

    const { searchParams } = new URL(request.url);
    const keyPath = searchParams.get("keyPath")?.trim();

    if (!keyPath) {
      return NextResponse.json({ success: false, message: "keyPath es requerido" }, { status: 400 });
    }

    const keyRow = await getKeyRowByPath(keyPath);

    if (!keyRow) {
      return NextResponse.json({ success: false, message: "Clave no encontrada" }, { status: 404 });
    }

    const [baseMaps, rows] = await Promise.all([
      loadBaseLocaleMaps(),
      getValuesByKeyId(keyRow.id),
    ]);

    const locales = Object.fromEntries(
      I18N_LOCALES.map((locale) => {
        const localeRows = rows.filter((row) => row.locale === locale);
        const latestDraft = localeRows.find((row) => row.status === "draft") ?? null;
        const latestPublished = localeRows.find((row) => row.status === "published") ?? null;
        const baseValue = baseMaps[locale][keyPath] ?? "";

        return [
          locale,
          {
            baseValue,
            draftValue: latestDraft?.value_text ?? null,
            publishedValue: latestPublished?.value_text ?? null,
            effectiveValue: latestDraft?.value_text ?? latestPublished?.value_text ?? baseValue,
            draftUpdatedAt: latestDraft?.updated_at ?? null,
            publishedAt: latestPublished?.published_at ?? null,
          },
        ];
      }),
    );

    return NextResponse.json({
      success: true,
      key: { keyPath: keyRow.key_path, module: keyRow.module },
      locales,
    });
  } catch (error) {
    console.error("GET /api/admin/i18n/values error:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}

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
    const locale = typeof body.locale === "string" ? body.locale.trim() : "";
    const valueText = typeof body.valueText === "string" ? body.valueText : "";

    if (!keyPath || !isValidLocale(locale)) {
      return NextResponse.json({ success: false, message: "Datos invalidos" }, { status: 400 });
    }

    const keyRow = await getKeyRowByPath(keyPath);

    if (!keyRow) {
      return NextResponse.json({ success: false, message: "Clave no encontrada" }, { status: 404 });
    }

    const [latestVersion, latestDraft] = await Promise.all([
      getNextVersion(keyRow.id, locale),
      queryOne<{ value_text: string }>(
        `SELECT value_text
         FROM i18n_values
         WHERE key_id = ? AND locale = ? AND status = 'draft'
         ORDER BY version DESC
         LIMIT 1`,
        [keyRow.id, locale],
      ),
    ]);

    await query(
      `INSERT INTO i18n_values (key_id, locale, value_text, status, version, created_by_user_id)
       VALUES (?, ?, ?, 'draft', ?, ?)`,
      [keyRow.id, locale, valueText, latestVersion, user.id],
    );

    await insertAuditLog({
      keyPath,
      locale,
      oldValue: latestDraft?.value_text ?? null,
      newValue: valueText,
      action: latestDraft ? "update" : "create",
      changedByUserId: user.id,
    });

    return NextResponse.json({ success: true, message: "Borrador guardado" });
  } catch (error) {
    console.error("POST /api/admin/i18n/values error:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
