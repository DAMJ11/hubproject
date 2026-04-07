import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getCompanyById } from "@/lib/data/companies";

// GET /api/companies/me - Obtener la empresa del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !user.companyId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated or no company" },
        { status: 401 }
      );
    }

    const company = await getCompanyById(user.companyId);

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error("GET /api/companies/me error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
