"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertCircle, Loader2, Search, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RFQItem {
  id: number;
  code: string;
  title: string;
  category_name: string;
  quantity: number;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  status: string;
  proposals_count: number;
  sustainability_priority: boolean;
  brand_name: string;
  brand_city: string;
  created_at: string;
}

const statusLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Borrador", color: "bg-gray-100 text-gray-700", icon: FileText },
  open: { label: "Abierto", color: "bg-blue-100 text-blue-700", icon: Clock },
  evaluating: { label: "Evaluando", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
  awarded: { label: "Adjudicado", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: AlertCircle },
  expired: { label: "Expirado", color: "bg-gray-100 text-gray-500", icon: Clock },
};

function formatCOP(n: number | null) {
  if (n === null) return "—";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

export default function AdminRFQPage() {
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchRFQs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/rfq?${params}`);
      const data = await res.json();
      if (data.success) setRfqs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRFQs();
  }, [fetchRFQs]);

  const filtered = rfqs.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.brand_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proyectos (RFQ)</h1>
        <p className="text-gray-500 mt-1">Todas las solicitudes de cotización de la plataforma</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por título, código o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700"
        >
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="open">Abierto</option>
          <option value="evaluating">Evaluando</option>
          <option value="awarded">Adjudicado</option>
          <option value="cancelled">Cancelado</option>
          <option value="expired">Expirado</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{rfqs.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">Abiertos</p>
          <p className="text-2xl font-bold text-blue-600">{rfqs.filter(r => r.status === "open").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">Evaluando</p>
          <p className="text-2xl font-bold text-yellow-600">{rfqs.filter(r => r.status === "evaluating").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700">
          <p className="text-sm text-gray-500">Adjudicados</p>
          <p className="text-2xl font-bold text-green-600">{rfqs.filter(r => r.status === "awarded").length}</p>
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No se encontraron proyectos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rfq) => {
            const badge = statusLabels[rfq.status] || statusLabels.draft;
            const StatusIcon = badge.icon;
            return (
              <Link
                key={rfq.id}
                href={`/dashboard/projects/${rfq.id}`}
                className="block bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{rfq.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${badge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                      {rfq.sustainability_priority && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 inline-flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          Eco
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{rfq.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {rfq.brand_name} · {rfq.category_name} · {rfq.quantity} uds
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Presupuesto</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {formatCOP(rfq.budget_min)} – {formatCOP(rfq.budget_max)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Propuestas</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">{rfq.proposals_count}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

