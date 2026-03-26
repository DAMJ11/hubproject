export type StatusEntity = "contracts" | "projects" | "proposals" | "payments" | "users" | "certifications";

type StatusEntry = {
  bg: string;
  text: string;
  i18nKey: string;
};

export const statusConfig: Record<string, Record<string, StatusEntry>> = {
  contracts: {
    active:        { bg: "bg-blue-100",    text: "text-blue-700",    i18nKey: "Contracts.status.active" },
    in_production: { bg: "bg-amber-100",   text: "text-amber-700",   i18nKey: "Contracts.status.in_production" },
    completed:     { bg: "bg-emerald-100", text: "text-emerald-700", i18nKey: "Contracts.status.completed" },
    disputed:      { bg: "bg-red-100",     text: "text-red-700",     i18nKey: "Contracts.status.disputed" },
    cancelled:     { bg: "bg-gray-100",    text: "text-gray-600",    i18nKey: "Contracts.status.cancelled" },
  },
  projects: {
    draft:      { bg: "bg-gray-100",    text: "text-gray-600",    i18nKey: "Projects.status.draft" },
    open:       { bg: "bg-emerald-100", text: "text-emerald-700", i18nKey: "Projects.status.open" },
    evaluating: { bg: "bg-amber-100",   text: "text-amber-700",   i18nKey: "Projects.status.evaluating" },
    awarded:    { bg: "bg-brand-100",   text: "text-brand-700",   i18nKey: "Projects.status.awarded" },
    cancelled:  { bg: "bg-red-100",     text: "text-red-700",     i18nKey: "Projects.status.cancelled" },
    expired:    { bg: "bg-gray-100",    text: "text-gray-500",    i18nKey: "Projects.status.expired" },
  },
  proposals: {
    pending:     { bg: "bg-gray-100",    text: "text-gray-700",    i18nKey: "Proposals.status.pending" },
    submitted:   { bg: "bg-blue-100",    text: "text-blue-700",    i18nKey: "Proposals.status.submitted" },
    shortlisted: { bg: "bg-amber-100",   text: "text-amber-700",   i18nKey: "Proposals.status.shortlisted" },
    accepted:    { bg: "bg-emerald-100", text: "text-emerald-700", i18nKey: "Proposals.status.accepted" },
    rejected:    { bg: "bg-red-100",     text: "text-red-700",     i18nKey: "Proposals.status.rejected" },
  },
  payments: {
    completed: { bg: "bg-emerald-100", text: "text-emerald-700", i18nKey: "Payments.status.completed" },
    pending:   { bg: "bg-amber-100",   text: "text-amber-700",   i18nKey: "Payments.status.pending" },
    failed:    { bg: "bg-red-100",     text: "text-red-700",     i18nKey: "Payments.status.failed" },
    refunded:  { bg: "bg-blue-100",    text: "text-blue-700",    i18nKey: "Payments.status.refunded" },
  },
  users: {
    active:   { bg: "bg-green-100",  text: "text-green-700",  i18nKey: "Users.status.active" },
    inactive: { bg: "bg-red-100",    text: "text-red-700",    i18nKey: "Users.status.inactive" },
    pending:  { bg: "bg-yellow-100", text: "text-yellow-700", i18nKey: "Users.status.pending" },
  },
  certifications: {
    verified: { bg: "bg-green-100",  text: "text-green-700",  i18nKey: "Certifications.status.verified" },
    expired:  { bg: "bg-red-100",    text: "text-red-700",    i18nKey: "Certifications.status.expired" },
    pending:  { bg: "bg-yellow-100", text: "text-yellow-700", i18nKey: "Certifications.status.pending" },
  },
};

const fallback: StatusEntry = { bg: "bg-gray-100", text: "text-gray-600", i18nKey: "" };

export function getStatus(entity: string, status: string): StatusEntry {
  return statusConfig[entity]?.[status] ?? fallback;
}
