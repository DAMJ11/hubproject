/**
 * Tracks policy violations per user per conversation.
 *
 * Tables are created lazily with IF NOT EXISTS — no migration script required.
 *
 * Thresholds:
 *   VIOLATION_THRESHOLD = 3  → block the user from the conversation after 3 violations
 */

import { query, queryOne } from "@/lib/db";

export const VIOLATION_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// Lazy table creation (runs once per Node.js process)
// ---------------------------------------------------------------------------

let tablesReady = false;

async function ensureTables(): Promise<void> {
  if (tablesReady) return;

  await query(`
    CREATE TABLE IF NOT EXISTS chat_violations (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      user_id         INT NOT NULL,
      conversation_id INT NOT NULL,
      violation_type  VARCHAR(20) NOT NULL DEFAULT 'contact_info',
      blocked_content TEXT NULL,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_conv (user_id, conversation_id)
    )
  `, []);

  await query(`
    CREATE TABLE IF NOT EXISTS chat_blocks (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      user_id         INT NOT NULL,
      conversation_id INT NOT NULL,
      blocked_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_user_conv (user_id, conversation_id)
    )
  `, []);

  await query(`
    CREATE TABLE IF NOT EXISTS chat_appeals (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      user_id         INT NOT NULL,
      conversation_id INT NOT NULL,
      appeal_text     TEXT NOT NULL,
      status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      admin_user_id   INT NULL,
      resolved_at     TIMESTAMP NULL,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_user_conv (user_id, conversation_id)
    )
  `, []);

  tablesReady = true;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns true if this user has been blocked from sending messages
 * in the given conversation.
 */
export async function isUserBlocked(
  userId: number,
  conversationId: number
): Promise<boolean> {
  await ensureTables();

  const row = await queryOne<{ id: number }>(
    `SELECT id FROM chat_blocks WHERE user_id = ? AND conversation_id = ?`,
    [userId, conversationId]
  );

  return !!row;
}

/**
 * Records a moderation violation.
 * If the user reaches VIOLATION_THRESHOLD violations, they are blocked.
 *
 * Returns the current violation count and whether the user was just blocked.
 */
export async function recordViolation(
  userId: number,
  conversationId: number,
  violationType = "contact_info",
  blockedContent?: string
): Promise<{ violations: number; nowBlocked: boolean }> {
  await ensureTables();

  // Insert violation record (store the blocked message for admin review)
  await query(
    `INSERT INTO chat_violations (user_id, conversation_id, violation_type, blocked_content) VALUES (?, ?, ?, ?)`,
    [userId, conversationId, violationType, blockedContent ?? null]
  );

  // Count total violations for this user in this conversation
  const countRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM chat_violations WHERE user_id = ? AND conversation_id = ?`,
    [userId, conversationId]
  );

  const violations = countRow?.count ?? 1;

  if (violations >= VIOLATION_THRESHOLD) {
    // Block — INSERT IGNORE prevents duplicate key errors on concurrent requests
    await query(
      `INSERT IGNORE INTO chat_blocks (user_id, conversation_id) VALUES (?, ?)`,
      [userId, conversationId]
    );
    return { violations, nowBlocked: true };
  }

  return { violations, nowBlocked: false };
}

/**
 * Returns the number of violations a user has in a conversation.
 */
export async function getViolationCount(
  userId: number,
  conversationId: number
): Promise<number> {
  await ensureTables();

  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM chat_violations WHERE user_id = ? AND conversation_id = ?`,
    [userId, conversationId]
  );

  return row?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Appeals
// ---------------------------------------------------------------------------

export interface AppealRow {
  id: number;
  user_id: number;
  conversation_id: number;
  appeal_text: string;
  status: "pending" | "approved" | "rejected";
  admin_user_id: number | null;
  resolved_at: string | null;
  created_at: string;
}

/**
 * Creates a new appeal for a blocked user.
 * Returns null if the user already has a pending appeal for this conversation.
 */
export async function createAppeal(
  userId: number,
  conversationId: number,
  appealText: string
): Promise<{ id: number } | null> {
  await ensureTables();

  // Prevent duplicate pending appeals
  const existing = await queryOne<{ id: number }>(
    `SELECT id FROM chat_appeals WHERE user_id = ? AND conversation_id = ? AND status = 'pending'`,
    [userId, conversationId]
  );
  if (existing) return null;

  const result = await query<{ insertId: number }>(
    `INSERT INTO chat_appeals (user_id, conversation_id, appeal_text) VALUES (?, ?, ?)`,
    [userId, conversationId, appealText]
  );

  return { id: (result as unknown as { insertId: number }).insertId };
}

/**
 * Returns the user's current appeal status for a conversation.
 */
export async function getUserAppealStatus(
  userId: number,
  conversationId: number
): Promise<AppealRow | null> {
  await ensureTables();

  return queryOne<AppealRow>(
    `SELECT * FROM chat_appeals WHERE user_id = ? AND conversation_id = ? ORDER BY created_at DESC LIMIT 1`,
    [userId, conversationId]
  );
}

/**
 * Lists all appeals (for admin panel). Optionally filter by status.
 */
export async function listAppeals(
  status?: "pending" | "approved" | "rejected"
): Promise<Array<AppealRow & {
  user_name: string;
  user_email: string;
  conversation_subject: string | null;
  violation_count: number;
  flagged_messages: string[];
}>> {
  await ensureTables();

  const where = status ? "WHERE a.status = ?" : "";
  const params: (string | number | boolean | null)[] = status ? [status] : [];

  const rows = await query<Array<AppealRow & {
    user_name: string;
    user_email: string;
    conversation_subject: string | null;
    violation_count: number;
  }>>(
    `SELECT a.*,
       CONCAT(u.first_name, ' ', u.last_name) AS user_name,
       u.email AS user_email,
       c.subject AS conversation_subject,
       (SELECT COUNT(*) FROM chat_violations v WHERE v.user_id = a.user_id AND v.conversation_id = a.conversation_id) AS violation_count
     FROM chat_appeals a
     JOIN users u ON u.id = a.user_id
     JOIN conversations c ON c.id = a.conversation_id
     ${where}
     ORDER BY a.created_at DESC`,
    params
  );

  // Fetch flagged messages for each appeal
  const result = [];
  for (const row of rows) {
    const violations = await query<Array<{ blocked_content: string | null }>>(
      `SELECT blocked_content FROM chat_violations WHERE user_id = ? AND conversation_id = ? ORDER BY created_at ASC`,
      [row.user_id, row.conversation_id]
    );
    result.push({
      ...row,
      flagged_messages: violations.filter((v) => v.blocked_content).map((v) => v.blocked_content!),
    });
  }

  return result;
}

/**
 * Admin resolves an appeal: approve (unblock) or reject (keep blocked).
 */
export async function resolveAppeal(
  appealId: number,
  adminUserId: number,
  decision: "approved" | "rejected"
): Promise<boolean> {
  await ensureTables();

  const appeal = await queryOne<AppealRow>(
    `SELECT * FROM chat_appeals WHERE id = ? AND status = 'pending'`,
    [appealId]
  );
  if (!appeal) return false;

  await query(
    `UPDATE chat_appeals SET status = ?, admin_user_id = ?, resolved_at = NOW() WHERE id = ?`,
    [decision, adminUserId, appealId]
  );

  if (decision === "approved") {
    // Remove the block
    await query(
      `DELETE FROM chat_blocks WHERE user_id = ? AND conversation_id = ?`,
      [appeal.user_id, appeal.conversation_id]
    );
    // Clear violation history so the user starts fresh
    await query(
      `DELETE FROM chat_violations WHERE user_id = ? AND conversation_id = ?`,
      [appeal.user_id, appeal.conversation_id]
    );
  }

  return true;
}
