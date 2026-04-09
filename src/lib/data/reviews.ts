import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  is_public: boolean;
  created_at: string;
  client_name: string;
  professional_name: string;
  service_name: string;
}

export async function getReviewsList(): Promise<{ reviews: ReviewItem[]; isAdmin: boolean } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.role === "admin" || user.role === "super_admin";

  const reviews = await query<ReviewItem[]>(
    `SELECT r.*,
     CONCAT(u.first_name, ' ', u.last_name) as client_name
     FROM reviews r
     JOIN users u ON r.reviewer_user_id = u.id
     ${isAdmin ? "" : "WHERE r.reviewer_user_id = ?"}
     ORDER BY r.created_at DESC`,
    isAdmin ? [] : [user.id]
  );

  return { reviews, isAdmin };
}
