"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, Clock, DollarSign, Leaf, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RFQ {
  id: number;
  code: string;
  title: string;
  description: string;
  category_name: string;
  quantity: number;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  proposals_deadline: string | null;
  proposals_count: number;
  sustainability_priority: boolean;
  created_at: string;
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRfqs = useCallback(async () => {
    try {
      const res = await fetch("/api/rfq?status=open");
      const data = await res.json();
      if (data.success) setRfqs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRfqs(); }, [fetchRfqs]);

  const filtered = search
    ? rfqs.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()) || r.category_name.toLowerCase().includes(search.toLowerCase()))
    : rfqs;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Oportunidades</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Proyectos abiertos donde puedes enviar tu propuesta</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por título o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 border-gray-300 dark:border-slate-600 dark:bg-slate-800"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{search ? "Sin resultados" : "No hay oportunidades disponibles"}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((rfq) => {
            const daysLeft = rfq.proposals_deadline
              ? Math.ceil((new Date(rfq.proposals_deadline).getTime() - Date.now()) / 86400000)
              : null;

            return (
              <div key={rfq.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-gray-400">{rfq.code}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{rfq.category_name}</span>
                      {rfq.sustainability_priority && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <Leaf className="w-3 h-3" /> Sostenible
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{rfq.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{rfq.description}</p>
                  </div>

                  <Button
                    onClick={() => router.push(`/dashboard/opportunities/${rfq.id}`)}
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white shrink-0"
                  >
                    <Send className="w-4 h-4 mr-1" /> Proponer
                  </Button>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1"><Package className="w-4 h-4 text-gray-400" /> {rfq.quantity.toLocaleString()} uds</span>
                  {rfq.budget_min && rfq.budget_max && (
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-gray-400" /> {formatCOP(rfq.budget_min)} - {formatCOP(rfq.budget_max)}</span>
                  )}
                  {rfq.deadline && (
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> Entrega: {new Date(rfq.deadline).toLocaleDateString("es-CO")}</span>
                  )}
                  {daysLeft !== null && (
                    <span className={`flex items-center gap-1 ${daysLeft <= 3 ? "text-red-500" : ""}`}>
                      <Clock className="w-4 h-4" /> {daysLeft > 0 ? `${daysLeft} días para proponer` : "Fecha límite pasada"}
                    </span>
                  )}
                  <span className="text-gray-400">{rfq.proposals_count} propuestas</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

