import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { notifyConversationParticipants } from "@/lib/realtime/notifyConversation";
import { createConversationSchema } from "@/lib/validations/conversations";

// GET /api/conversations - Lista conversaciones del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status"); // pending | open | all

    const isAdmin = hasRole(user, "admin");

    let whereClause: string;
    const params: (string | number | boolean | null)[] = [];

    if (isAdmin) {
      // Admin ve todas las conversaciones
      whereClause = "1=1";
    } else if (!user.companyId) {
      return NextResponse.json({ success: true, conversations: [] });
    } else {
      // Brand/manufacturer: ver sus conversaciones B2B y chats directos con admin
      whereClause = "(c.brand_company_id = ? OR c.manufacturer_company_id = ? OR c.target_company_id = ?)";
      params.push(user.companyId, user.companyId, user.companyId);
    }

    if (statusFilter && statusFilter !== "all") {
      whereClause += " AND c.status = ?";
      params.push(statusFilter);
    }

    params.push(user.id); // para unread_count

    const conversations = await query<Array<{
      id: number;
      rfq_id: number | null;
      subject: string | null;
      status: string;
      last_message_at: string | null;
      created_at: string;
      accepted_at: string | null;
      brand_company_id: number | null;
      manufacturer_company_id: number | null;
      target_company_id: number | null;
      admin_user_id: number | null;
      initiated_by_user_id: number;
      brand_name: string | null;
      manufacturer_name: string | null;
      target_company_name: string | null;
      admin_user_name: string | null;
      brand_logo: string | null;
      manufacturer_logo: string | null;
      rfq_code: string | null;
      rfq_title: string | null;
      initiator_name: string;
      unread_count: number;
      last_message: string | null;
    }>>(
      `SELECT c.*,
        bc.name AS brand_name, bc.logo_url AS brand_logo,
        mc.name AS manufacturer_name, mc.logo_url AS manufacturer_logo,
        tc.name AS target_company_name,
        r.code AS rfq_code,
        r.title AS rfq_title,
        CONCAT(au.first_name, ' ', au.last_name) AS admin_user_name,
        CONCAT(iu.first_name, ' ', iu.last_name) AS initiator_name,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_user_id != ? AND m.message_type != 'system') AS unread_count,
        (SELECT m2.content FROM messages m2 WHERE m2.conversation_id = c.id ORDER BY m2.created_at DESC LIMIT 1) AS last_message
       FROM conversations c
       LEFT JOIN companies bc ON bc.id = c.brand_company_id
       LEFT JOIN companies mc ON mc.id = c.manufacturer_company_id
       LEFT JOIN companies tc ON tc.id = c.target_company_id
      LEFT JOIN rfq_projects r ON r.id = c.rfq_id
       LEFT JOIN users au ON au.id = c.admin_user_id
       JOIN users iu ON iu.id = c.initiated_by_user_id
       WHERE ${whereClause}
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
      params
    );

    return NextResponse.json({ success: true, conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}

// POST /api/conversations - Iniciar nueva conversación (status: pending)
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createConversationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    const { targetCompanyId, subject, initialMessage, rfqId } = parsed.data;

    const parsedRfqId = rfqId ?? null;

    // Validar que la empresa destino existe y es del tipo opuesto
    const targetCompany = await queryOne<{ id: number; type: string; name: string }>(
      `SELECT id, type, name FROM companies WHERE id = ? AND is_active = TRUE`,
      [targetCompanyId]
    );

    if (!targetCompany) {
      return NextResponse.json({ success: false, message: "Empresa no encontrada" }, { status: 404 });
    }

    const isAdmin = hasRole(user, "admin");

    let conversationId: number;

    if (isAdmin) {
      // Admin: chat directo con empresa (abre en estado open)
      const existingAdmin = await queryOne<{ id: number }>(
        `SELECT id FROM conversations
         WHERE admin_user_id = ? AND target_company_id = ? AND status IN ('open', 'pending')
         ORDER BY id DESC LIMIT 1`,
        [user.id, targetCompanyId]
      );

      if (existingAdmin) {
        return NextResponse.json({
          success: false,
          message: "Ya existe un chat activo con esta empresa",
          conversationId: existingAdmin.id,
        }, { status: 409 });
      }

      const adminInsert = await query<{ insertId: number }>(
        `INSERT INTO conversations (
          rfq_id, contract_id, brand_company_id, manufacturer_company_id, target_company_id,
          admin_user_id, initiated_by_user_id, subject, status, accepted_at
        )
        VALUES (NULL, NULL, NULL, NULL, ?, ?, ?, ?, 'open', NOW())`,
        [targetCompanyId, user.id, user.id, subject.trim()]
      );
      conversationId = (adminInsert as unknown as { insertId: number }).insertId;
    } else {
      if (!user.companyId) {
        return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
      }

      // Validar tipo cruzado: brand↔manufacturer
      const userCompany = await queryOne<{ type: string }>(
        `SELECT type FROM companies WHERE id = ?`,
        [user.companyId]
      );

      if (!userCompany) {
        return NextResponse.json({ success: false, message: "Empresa del usuario no encontrada" }, { status: 404 });
      }

      if (userCompany.type === targetCompany.type) {
        return NextResponse.json({ success: false, message: "Solo puedes contactar empresas del tipo opuesto (brand ↔ manufacturer)" }, { status: 400 });
      }

      // Determinar quién es brand y quién manufacturer
      const brandCompanyId = userCompany.type === "brand" ? user.companyId : targetCompanyId;
      const manufacturerCompanyId = userCompany.type === "manufacturer" ? user.companyId : targetCompanyId;

      let selectedRfqId: number | null = null;

      if (parsedRfqId) {
        // Si se pasa rfqId, debe pertenecer a la marca de la conversación.
        const rfq = await queryOne<{ id: number; status: string }>(
          `SELECT id, status
           FROM rfq_projects
           WHERE id = ? AND brand_company_id = ?`,
          [parsedRfqId, brandCompanyId]
        );

        if (!rfq) {
          return NextResponse.json({ success: false, message: "El proyecto seleccionado no pertenece a la marca" }, { status: 400 });
        }

        // Manufacturer solo puede iniciar por proyectos abiertos/en evaluación.
        if (userCompany.type === "manufacturer" && !["open", "evaluating"].includes(rfq.status)) {
          return NextResponse.json({ success: false, message: "Solo puedes contactar por proyectos abiertos o en evaluación" }, { status: 400 });
        }

        // Brand solo puede ofrecer proyectos no cerrados.
        if (userCompany.type === "brand" && !["draft", "open", "evaluating"].includes(rfq.status)) {
          return NextResponse.json({ success: false, message: "Solo puedes ofrecer proyectos activos" }, { status: 400 });
        }

        selectedRfqId = parsedRfqId;
      }

      // Si manufacturer inicia sin rfqId, validar al menos un proyecto activo en la marca.
      if (userCompany.type === "manufacturer" && !selectedRfqId) {
        const activeRfq = await queryOne<{ id: number }>(
          `SELECT id FROM rfq_projects
           WHERE brand_company_id = ? AND status IN ('open', 'evaluating')
           ORDER BY created_at DESC LIMIT 1`,
          [brandCompanyId]
        );

        if (!activeRfq) {
          return NextResponse.json({ success: false, message: "La marca no tiene proyectos activos para contactar" }, { status: 400 });
        }
      }

      // Verificar duplicados por par de empresas y contexto RFQ.
      const existing = await queryOne<{ id: number; status: string }>(
        selectedRfqId
          ? `SELECT id, status FROM conversations
             WHERE brand_company_id = ? AND manufacturer_company_id = ?
               AND rfq_id = ?
               AND status IN ('pending', 'open')
             ORDER BY id DESC LIMIT 1`
          : `SELECT id, status FROM conversations
             WHERE brand_company_id = ? AND manufacturer_company_id = ?
               AND rfq_id IS NULL
               AND status IN ('pending', 'open')
             ORDER BY id DESC LIMIT 1`,
        selectedRfqId
          ? [brandCompanyId, manufacturerCompanyId, selectedRfqId]
          : [brandCompanyId, manufacturerCompanyId]
      );

      if (existing) {
        return NextResponse.json({
          success: false,
          message: existing.status === "pending"
            ? "Ya existe una solicitud de chat pendiente con esta empresa"
            : "Ya tienes una conversación abierta con esta empresa",
          conversationId: existing.id,
        }, { status: 409 });
      }

      // Crear conversación con status pending
      const result = await query<{ insertId: number }>(
        `INSERT INTO conversations (rfq_id, contract_id, brand_company_id, manufacturer_company_id, target_company_id, admin_user_id, initiated_by_user_id, subject, status)
         VALUES (?, NULL, ?, ?, NULL, NULL, ?, ?, 'pending')`,
        [selectedRfqId, brandCompanyId, manufacturerCompanyId, user.id, subject.trim()]
      );
      conversationId = (result as unknown as { insertId: number }).insertId;
    }

    // Si hay mensaje inicial, guardarlo como system para contexto
    if (initialMessage?.trim()) {
      await query(
        `INSERT INTO messages (conversation_id, sender_user_id, content, message_type)
         VALUES (?, ?, ?, 'text')`,
        [conversationId, user.id, initialMessage.trim()]
      );
      await query(
        `UPDATE conversations SET last_message_at = NOW() WHERE id = ?`,
        [conversationId]
      );
    }

    await notifyConversationParticipants(conversationId, "chat.conversation.updated", {
      action: isAdmin ? "conversation_started" : "conversation_requested",
      actorUserId: user.id,
    });
    await notifyConversationParticipants(conversationId, "chat.unread.updated", {
      reason: "conversation_created",
      actorUserId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: isAdmin
        ? "Chat iniciado correctamente."
        : "Solicitud de chat enviada. Esperando aceptación.",
      conversationId,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
