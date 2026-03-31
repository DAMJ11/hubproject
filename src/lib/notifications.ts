import { query } from "@/lib/db";

export type NotificationType = "message" | "payment" | "review" | "system" | "rfq" | "proposal" | "contract";

export interface CreateNotificationInput {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  referenceType?: string;
  referenceId?: number;
}

/**
 * Create a notification for a user. Fire-and-forget safe.
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  await query(
    `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.userId, input.title, input.message, input.type, input.referenceType ?? null, input.referenceId ?? null]
  );
}

/**
 * Create the same notification for multiple users at once.
 */
export async function createNotificationBulk(
  userIds: number[],
  notification: Omit<CreateNotificationInput, "userId">
): Promise<void> {
  if (userIds.length === 0) return;
  const placeholders = userIds.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");
  const values = userIds.flatMap((uid) => [
    uid, notification.title, notification.message, notification.type,
    notification.referenceType ?? null, notification.referenceId ?? null,
  ]);
  await query(`INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id) VALUES ${placeholders}`, values);
}
