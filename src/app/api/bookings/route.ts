import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET /api/bookings - Get bookings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Check if user is admin
    const user = await queryOne<{ role: string }>("SELECT role FROM users WHERE id = ?", [decoded.id]);

    let sql: string;
    const params: (string | number)[] = [];

    if (user?.role === "admin") {
      // Admin sees all bookings
      sql = `
        SELECT b.*,
          s.name as service_name, sc.name as category_name,
          u.first_name as client_first_name, u.last_name as client_last_name, u.email as client_email,
          pu.first_name as pro_first_name, pu.last_name as pro_last_name,
          a.address_line, a.city
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN service_categories sc ON s.category_id = sc.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN professionals p ON b.professional_id = p.id
        LEFT JOIN users pu ON p.user_id = pu.id
        LEFT JOIN addresses a ON b.address_id = a.id
      `;
    } else {
      // User sees only their bookings
      sql = `
        SELECT b.*,
          s.name as service_name, sc.name as category_name,
          pu.first_name as pro_first_name, pu.last_name as pro_last_name,
          a.address_line, a.city
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN service_categories sc ON s.category_id = sc.id
        LEFT JOIN professionals p ON b.professional_id = p.id
        LEFT JOIN users pu ON p.user_id = pu.id
        LEFT JOIN addresses a ON b.address_id = a.id
        WHERE b.user_id = ?
      `;
      params.push(decoded.id);
    }

    if (status) {
      sql += user?.role === "admin" ? " WHERE b.status = ?" : " AND b.status = ?";
      params.push(status);
    }

    sql += " ORDER BY b.scheduled_date DESC, b.scheduled_time DESC";

    const bookings = await query(sql, params);

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener reservas" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, professionalId, addressId, scheduledDate, scheduledTime, notes } = body;

    if (!serviceId || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { success: false, message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Get service price
    const service = await queryOne<{ base_price: number }>(
      "SELECT base_price FROM services WHERE id = ? AND is_active = TRUE",
      [serviceId]
    );

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    const result = await query(
      `INSERT INTO bookings (user_id, service_id, professional_id, address_id, scheduled_date, scheduled_time, total_price, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        decoded.id,
        serviceId,
        professionalId || null,
        addressId || null,
        scheduledDate,
        scheduledTime,
        service.base_price,
        notes || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Reserva creada exitosamente",
      bookingId: (result as { insertId: number }).insertId,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, message: "Error al crear la reserva" },
      { status: 500 }
    );
  }
}
