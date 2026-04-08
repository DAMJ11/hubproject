import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, hasRole } from "@/lib/session";
import {
  ensureI18nTables,
  getTranslationKeys,
  getTranslationModules,
  syncI18nKeys,
} from "@/lib/i18n-editor";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user || !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 });
    }

    await ensureI18nTables();
    await syncI18nKeys();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const moduleFilter = searchParams.get("module")?.trim() ?? "all";

    const [keys, modules] = await Promise.all([
      getTranslationKeys({ search, module: moduleFilter }),
      getTranslationModules(),
    ]);

    return NextResponse.json({ success: true, keys, modules });
  } catch (error) {
    console.error("GET /api/admin/i18n/keys error:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
