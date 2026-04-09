import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export interface ContractItem {
  id: number;
  code: string;
  rfq_title: string;
  brand_name: string;
  manufacturer_name: string;
  counterpart_name?: string;
  total_amount: number;
  status: string;
  start_date: string | null;
  expected_end_date: string | null;
  milestones_count: number;
  milestones_completed: number;
  created_at: string;
}

export async function getContracts(): Promise<ContractItem[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.role === "admin" || user.role === "super_admin";

  if (!isAdmin && !user.companyId) return null;

  let sql: string;
  let params: (string | number)[] = [];

  if (isAdmin) {
    sql = `SELECT ct.id, ct.code, r.title as rfq_title,
                  bc.name as brand_name,
                  mc.name as manufacturer_name,
                  ct.total_amount, ct.status, ct.start_date, ct.expected_end_date,
                  (SELECT COUNT(*) FROM contract_milestones WHERE contract_id = ct.id) as milestones_count,
                  (SELECT COUNT(*) FROM contract_milestones WHERE contract_id = ct.id AND status = 'completed') as milestones_completed,
                  ct.created_at
           FROM contracts ct
           JOIN rfq_projects r ON ct.rfq_id = r.id
           JOIN companies bc ON ct.brand_company_id = bc.id
           JOIN companies mc ON ct.manufacturer_company_id = mc.id
           WHERE 1=1`;
  } else {
    sql = `SELECT ct.id, ct.code, r.title as rfq_title,
                  bc.name as brand_name,
                  mc.name as manufacturer_name,
                  CASE
                    WHEN ct.brand_company_id = ? THEN mc.name
                    ELSE bc.name
                  END as counterpart_name,
                  ct.total_amount, ct.status, ct.start_date, ct.expected_end_date,
                  (SELECT COUNT(*) FROM contract_milestones WHERE contract_id = ct.id) as milestones_count,
                  (SELECT COUNT(*) FROM contract_milestones WHERE contract_id = ct.id AND status = 'completed') as milestones_completed,
                  ct.created_at
           FROM contracts ct
           JOIN rfq_projects r ON ct.rfq_id = r.id
           JOIN companies bc ON ct.brand_company_id = bc.id
           JOIN companies mc ON ct.manufacturer_company_id = mc.id
           WHERE (ct.brand_company_id = ? OR ct.manufacturer_company_id = ?)`;
    params = [user.companyId!, user.companyId!, user.companyId!];
  }

  sql += ` ORDER BY ct.created_at DESC LIMIT 20`;

  return query<ContractItem[]>(sql, params);
}

// --- Contract Detail ---

export interface Milestone {
  id: number;
  title: string;
  description: string | null;
  percentage: number;
  amount: number;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  payment_status: string;
}

export interface ContractDetail {
  id: number;
  code: string;
  rfq_title: string;
  rfq_code: string;
  brand_name: string;
  manufacturer_name: string;
  total_amount: number;
  status: string;
  lead_time_days: number;
  start_date: string | null;
  expected_end_date: string | null;
  created_at: string;
  milestones: Milestone[];
}

export async function getContractDetail(contractId: number): Promise<{ contract: ContractDetail; userRole: string } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.role === "admin" || user.role === "super_admin";
  if (!isAdmin && !user.companyId) return null;

  const contract = await query<Record<string, unknown>[]>(
    `SELECT ct.*, r.title as rfq_title, r.code as rfq_code,
            bc.name as brand_name, mc.name as manufacturer_name
     FROM contracts ct
     JOIN rfq_projects r ON ct.rfq_id = r.id
     JOIN companies bc ON ct.brand_company_id = bc.id
     JOIN companies mc ON ct.manufacturer_company_id = mc.id
     WHERE ct.id = ?`,
    [contractId]
  );

  if (!contract || contract.length === 0) return null;

  const c = contract[0];

  // Access check
  if (!isAdmin && c.brand_company_id !== user.companyId && c.manufacturer_company_id !== user.companyId) {
    return null;
  }

  const milestones = await query<Milestone[]>(
    `SELECT * FROM contract_milestones WHERE contract_id = ? ORDER BY sort_order`,
    [contractId]
  );

  return {
    contract: { ...c, milestones: milestones || [] } as unknown as ContractDetail,
    userRole: user.role,
  };
}
