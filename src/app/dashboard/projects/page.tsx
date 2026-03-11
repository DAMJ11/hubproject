"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<RFQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/rfq?${params}`);
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Proyectos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Publica proyectos y recibe propuestas de fabricantes</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-2">
            <Plus className="w-4 h-4" /> Publicar Proyecto
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: "", label: "Todos" }, { value: "open", label: "Abiertos" }, { value: "evaluating", label: "Evaluando" }, { value: "awarded", label: "Adjudicados" }, { value: "draft", label: "Borradores" }].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              statusFilter === f.value
                ? "bg-[#2563eb] text-white border-[#2563eb]"
                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-[#2563eb]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No tienes proyectos todavía</p>
          <Link href="/dashboard/projects/new">
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-2">
              <Plus className="w-4 h-4" /> Publicar tu primer proyecto
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => {
            const st = statusLabels[p.status] || statusLabels.draft;
            const StIcon = st.icon;
            return (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">{p.code}</span>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                          <StIcon className="w-3 h-3" /> {st.label}
                        </span>
                        {p.sustainability_priority && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">🌿 Sostenible</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{p.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>📦 {p.quantity} uds</span>
                        <span>📂 {p.category_name}</span>
                        {p.deadline && <span>📅 Entrega: {new Date(p.deadline).toLocaleDateString("es-CO")}</span>}
                        {p.budget_max && <span>💰 {formatCOP(p.budget_min)} - {formatCOP(p.budget_max)}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-[#2563eb]">{p.proposals_count}</div>
                      <div className="text-xs text-gray-500">propuestas</div>
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

