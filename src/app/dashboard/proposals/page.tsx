"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Leaf, Clock, DollarSign, Package, Settings, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MyProposal {
  id: number;
  rfq_id: number;
  rfq_code: string;
  rfq_title: string;
  rfq_status: string;
  category_name: string;
  unit_price: number;
  total_price: number;
  lead_time_days: number;
  status: string;
  green_score: number;
  submitted_at: string;
}

interface CapabilityOffer {
  id: number;
  category_name: string;
  min_order_qty: number;
  max_monthly_capacity: number | null;
  lead_time_days: number | null;
  unit_price_from: number | null;
  wholesale_price_from: number | null;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  shortlisted: { label: "Preseleccionada", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  accepted: { label: "Aceptada", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
}

export default function MyProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<MyProposal[]>([]);
  const [offers, setOffers] = useState<CapabilityOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchProposals = useCallback(async () => {
    try {
      const res = await fetch("/api/proposals/mine");
      const data = await res.json();
      if (data.success) setProposals(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOffers = useCallback(async () => {
    setOffersLoading(true);
    try {
      const res = await fetch("/api/manufacturers/capabilities", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setOffers(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOffersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
    fetchOffers();
  }, [fetchProposals, fetchOffers]);

  const filtered = filter === "all" ? proposals : proposals.filter((p) => p.status === filter);
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);
  const tabs = [
    { key: "all", label: "Todas" },
    { key: "pending", label: "Pendientes" },
    { key: "shortlisted", label: "Preseleccionadas" },
    { key: "accepted", label: "Aceptadas" },
    { key: "rejected", label: "Rechazadas" },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Propuestas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Seguimiento de tus propuestas enviadas</p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <Factory className="w-4 h-4" /> Oferta base para marcas (flujo bidireccional)
            </h2>
            <p className="text-xs text-blue-800 mt-1">
              Publica tus capacidades, tiempos y precios base para que las marcas te encuentren y te seleccionen.
            </p>
          </div>
          <Link href="/dashboard/company/capabilities">
            <Button size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
              <Settings className="w-4 h-4 mr-2" /> Gestionar mi oferta
            </Button>
          </Link>
        </div>

        <div className="mt-3">
          {offersLoading ? (
            <div className="text-xs text-blue-700 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando capacidades...
            </div>
          ) : offers.length === 0 ? (
            <p className="text-xs text-blue-700">
              Aun no tienes capacidades registradas. Completa tu oferta para aparecer mejor en el directorio de fabricantes.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {offers.slice(0, 4).map((offer) => (
                <span key={offer.id} className="text-xs rounded-full bg-white/80 text-blue-900 border border-blue-200 px-2 py-1">
                  {offer.category_name}
                  {offer.unit_price_from !== null ? ` · desde ${formatCurrency(offer.unit_price_from)}` : ""}
                  {offer.lead_time_days ? ` · ${offer.lead_time_days}d` : ""}
                </span>
              ))}
              {offers.length > 4 && (
                <span className="text-xs rounded-full bg-white/80 text-blue-900 border border-blue-200 px-2 py-1">
                  +{offers.length - 4} capacidades
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === t.key ? "bg-[#2563eb] text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No tienes propuestas {filter !== "all" ? "con este estado" : "aún"}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => {
            const st = statusLabels[p.status] || statusLabels.pending;
            return (
              <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/opportunities/${p.rfq_id}`)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-gray-400">{p.rfq_code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{p.rfq_title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400"> {p.category_name}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${p.green_score >= 70 ? "bg-emerald-500" : p.green_score >= 40 ? "bg-yellow-500" : "bg-red-400"}`}>
                      {p.green_score}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-0.5"><Leaf className="w-3 h-3" /> Green</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-gray-400" /> {formatCOP(p.total_price)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> {p.lead_time_days} días</span>
                  <span className="text-xs text-gray-400">Enviada: {new Date(p.submitted_at).toLocaleDateString("es-CO")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

