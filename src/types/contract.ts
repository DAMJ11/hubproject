// =============================================
// Contract & Milestone Types
// =============================================

export type ContractStatus = "active" | "in_production" | "completed" | "disputed" | "cancelled";
export type MilestoneStatus = "pending" | "in_progress" | "completed" | "skipped";
export type MilestonePaymentStatus = "pending" | "paid" | "na";

export interface Contract {
  id: number;
  code: string;
  rfq_id: number;
  proposal_id: number;
  brand_company_id: number;
  manufacturer_company_id: number;
  total_amount: number;
  currency: string;
  status: ContractStatus;
  terms: string | null;
  start_date: string | null;
  expected_end_date: string | null;
  actual_end_date: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ContractMilestone {
  id: number;
  contract_id: number;
  title: string;
  description: string | null;
  sort_order: number;
  status: MilestoneStatus;
  payment_amount: number;
  payment_status: MilestonePaymentStatus;
  due_date: string | null;
  completed_at: Date | null;
}

export interface ContractListItem {
  id: number;
  code: string;
  rfqTitle: string;
  counterpartName: string;
  totalAmount: number;
  status: ContractStatus;
  startDate: string | null;
  expectedEndDate: string | null;
  milestonesTotal: number;
  milestonesCompleted: number;
  createdAt: string;
}

export interface ContractDetail extends ContractListItem {
  rfqCode: string;
  terms: string | null;
  milestones: ContractMilestone[];
  brandName: string;
  manufacturerName: string;
}

export interface MilestoneUpdateInput {
  status: MilestoneStatus;
  paymentStatus?: MilestonePaymentStatus;
}
