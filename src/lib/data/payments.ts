import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export interface PaymentItem {
  id: number;
  contract_id: number;
  contract_code: string;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id: string;
  paid_at: string;
  created_at: string;
  payer_name: string;
  payee_name: string;
}

export interface PaymentTotals {
  total_revenue: number;
  pending_amount: number;
  total_transactions: number;
  completed_count: number;
}

export async function getPaymentsList(): Promise<{ payments: PaymentItem[]; totals: PaymentTotals } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.role === "admin";

  let whereClause = "";
  const params: (string | number)[] = [];

  if (!isAdmin && user.role === "brand") {
    whereClause = "WHERE pay.payer_company_id IN (SELECT c.id FROM companies c JOIN users u ON u.company_id = c.id WHERE u.id = ?)";
    params.push(user.id);
  } else if (!isAdmin && user.role === "manufacturer") {
    whereClause = "WHERE pay.payee_company_id IN (SELECT c.id FROM companies c JOIN users u ON u.company_id = c.id WHERE u.id = ?)";
    params.push(user.id);
  }

  const [payments, totals] = await Promise.all([
    query<PaymentItem[]>(
      `SELECT pay.*,
       ct.code as contract_code,
       payer.name as payer_name,
       payee.name as payee_name
       FROM payments pay
       JOIN contracts ct ON pay.contract_id = ct.id
       JOIN companies payer ON pay.payer_company_id = payer.id
       JOIN companies payee ON pay.payee_company_id = payee.id
       ${whereClause}
       ORDER BY pay.created_at DESC`,
      params
    ),
    queryOne<PaymentTotals>(
      `SELECT
       COALESCE(SUM(CASE WHEN pay.status = 'completed' THEN pay.amount ELSE 0 END), 0) as total_revenue,
       COALESCE(SUM(CASE WHEN pay.status = 'pending' THEN pay.amount ELSE 0 END), 0) as pending_amount,
       COUNT(*) as total_transactions,
       SUM(CASE WHEN pay.status = 'completed' THEN 1 ELSE 0 END) as completed_count
       FROM payments pay ${whereClause}`,
      params
    ),
  ]);

  const defaultTotals: PaymentTotals = { total_revenue: 0, pending_amount: 0, total_transactions: 0, completed_count: 0 };

  return { payments, totals: totals ?? defaultTotals };
}
