"use client";

import { useTranslations, useLocale } from "next-intl";
import { Leaf, Shield, MapPin, ArrowUpDown } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Proposal {
  id: number;
  manufacturer_company_id: number;
  manufacturer_name: string;
  manufacturer_city: string | null;
  manufacturer_is_verified: boolean;
  unit_price: number;
  total_price: number;
  lead_time_days: number;
  proposed_materials: string | null;
  recycled_percentage: number;
  notes: string | null;
  status: string;
  green_score: number;
  distance_km: number;
  certifications_count: number;
  submitted_at: string;
}

type SortKey = "total_price" | "lead_time_days" | "green_score" | "distance_km";

export default function ProposalsCompare({
  proposals,
  sortKey,
  onSortChange,
}: {
  proposals: Proposal[];
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
}) {
  const t = useTranslations("ProjectDetail");
  const locale = useLocale();

  const fmt = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  const sorted = [...proposals].sort((a, b) => {
    if (sortKey === "green_score") return b.green_score - a.green_score;
    return (a[sortKey] ?? 0) - (b[sortKey] ?? 0);
  });

  const best: Record<SortKey, number | undefined> = {
    total_price: sorted.length ? sorted.reduce((min, p) => Math.min(min, p.total_price), Infinity) : undefined,
    lead_time_days: sorted.length ? sorted.reduce((min, p) => Math.min(min, p.lead_time_days), Infinity) : undefined,
    green_score: sorted.length ? sorted.reduce((max, p) => Math.max(max, p.green_score), 0) : undefined,
    distance_km: sorted.length ? sorted.reduce((min, p) => Math.min(min, p.distance_km), Infinity) : undefined,
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: "total_price", label: t("totalPrice") },
    { key: "lead_time_days", label: t("leadTime") },
    { key: "green_score", label: "Green Score" },
    { key: "distance_km", label: t("compare.distance") },
  ];

  return (
    <div className="overflow-x-auto -mx-2">
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-slate-700">
            <TableHead className="text-left">
              {t("compare.manufacturer")}
            </TableHead>
            {columns.map((col) => (
              <TableHead key={col.key} className="text-right">
                <button
                  onClick={() => onSortChange(col.key)}
                  className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                    sortKey === col.key
                      ? "text-brand-600"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {col.label}
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
            ))}
            <TableHead className="text-center text-xs">
              {t("compare.status")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((p) => {
            const isBestPrice = p.total_price === best.total_price;
            const isBestLead = p.lead_time_days === best.lead_time_days;
            const isBestGreen = p.green_score === best.green_score;
            const isBestDist = p.distance_km === best.distance_km;

            return (
              <TableRow
                key={p.id}
                className="border-b border-gray-100 dark:border-slate-700/50"
              >
                {/* Manufacturer */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        p.green_score >= 70
                          ? "bg-emerald-500"
                          : p.green_score >= 40
                            ? "bg-yellow-500"
                            : "bg-red-400"
                      }`}
                    >
                      {p.green_score}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate flex items-center gap-1">
                        {p.manufacturer_name}
                        {p.manufacturer_is_verified && (
                          <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        )}
                      </p>
                      {p.manufacturer_city && (
                        <p className="text-xs text-gray-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {p.manufacturer_city}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Price */}
                <TableCell className="text-right">
                  <span
                    className={`font-medium ${
                      isBestPrice
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {fmt(p.total_price)}
                  </span>
                  <p className="text-xs text-gray-400">{fmt(p.unit_price)}/ud</p>
                </TableCell>

                {/* Lead time */}
                <TableCell className="text-right">
                  <span
                    className={`font-medium ${
                      isBestLead
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {t("days", { days: p.lead_time_days })}
                  </span>
                </TableCell>

                {/* Green Score */}
                <TableCell className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      isBestGreen
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    <Leaf className="w-3 h-3" /> {p.green_score}
                  </span>
                  {p.recycled_percentage > 0 && (
                    <p className="text-xs text-gray-400">
                      {p.recycled_percentage}% rec.
                    </p>
                  )}
                </TableCell>

                {/* Distance */}
                <TableCell className="text-right">
                  <span
                    className={`font-medium ${
                      isBestDist
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {p.distance_km > 0 ? `${Math.round(p.distance_km)} km` : "—"}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="text-center">
                  <StatusBadge entity="proposals" status={p.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
