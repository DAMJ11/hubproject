"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Clock, Package, DollarSign, Leaf, MapPin, Shield, Loader2, Check, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RFQDetail {
  id: number;
  code: string;
  title: string;
  description: string;
  status: string;
  category_name: string;
  quantity: number;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  proposals_deadline: string | null;
  proposals_count: number;
  requires_sample: boolean;
  sustainability_priority: boolean;
  preferred_materials: string | null;
  brand_name: string;
  brand_city: string | null;
  materials: { id: number; material_type: string; composition: string; recycled_percentage: number }[];
  attachments: { id: number; file_name: string; file_url: string }[];
  created_at: string;
}

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

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "bg-gray-100 text-gray-700" },
  open: { label: "Abierto", color: "bg-blue-100 text-blue-700" },
  evaluating: { label: "Evaluando", color: "bg-yellow-100 text-yellow-700" },
  awarded: { label: "Adjudicado", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

const proposalStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-gray-100 text-gray-700" },
  shortlisted: { label: "Preseleccionada", color: "bg-blue-100 text-blue-700" },
  accepted: { label: "Aceptada", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-700" },
};

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [rfq, setRfq] = useState<RFQDetail | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [rfqRes, proposalsRes] = await Promise.all([
        fetch(`/api/rfq/${id}`),
        fetch(`/api/rfq/${id}/proposals`),
      ]);
      const rfqData = await rfqRes.json();
      const proposalsData = await proposalsRes.json();
      if (rfqData.success) setRfq(rfqData.data);
      if (proposalsData.success) setProposals(proposalsData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (proposalId: number, action: "accept" | "reject" | "shortlist") => {
    setActionLoading(proposalId);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/respond`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0d7a5f]" />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Proyecto no encontrado</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/projects")} className="mt-4">Volver</Button>
      </div>
    );
  }

  const st = statusLabels[rfq.status] || statusLabels.draft;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.push("/dashboard/projects")} className="p-2 mt-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-gray-400">{rfq.code}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
            {rfq.sustainability_priority && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">🌿 Sostenible</span>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{rfq.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{rfq.category_name}</p>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={<Package className="w-5 h-5" />} label="Cantidad" value={`${rfq.quantity.toLocaleString()} uds`} />
        <InfoCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Presupuesto"
          value={rfq.budget_min && rfq.budget_max ? `${formatCOP(rfq.budget_min)} - ${formatCOP(rfq.budget_max)}` : "No especificado"}
        />
        <InfoCard icon={<Clock className="w-5 h-5" />} label="Fecha límite" value={rfq.deadline ? new Date(rfq.deadline).toLocaleDateString("es-CO") : "Sin límite"} />
        <InfoCard icon={<Package className="w-5 h-5" />} label="Propuestas" value={`${rfq.proposals_count} recibidas`} />
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Descripción</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{rfq.description}</p>
        {rfq.preferred_materials && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            <strong>Materiales preferidos:</strong> {rfq.preferred_materials}
          </p>
        )}
        {rfq.requires_sample && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">⚠️ Requiere muestra previa aprobada</p>}
      </div>

      {/* Materials */}
      {rfq.materials.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Materiales especificados</h2>
          <div className="space-y-2">
            {rfq.materials.map((m) => (
              <div key={m.id} className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{m.material_type}</span>
                {m.composition && <span className="text-gray-500">· {m.composition}</span>}
                {m.recycled_percentage > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{m.recycled_percentage}% reciclado</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proposals */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Propuestas ({proposals.length})
        </h2>

        {proposals.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Aún no hay propuestas para este proyecto</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => {
              const ps = proposalStatusLabels[p.status] || proposalStatusLabels.pending;
              const isAwarded = rfq.status === "awarded";
              return (
                <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-white">{p.manufacturer_name}</span>
                        {p.manufacturer_is_verified && <Shield className="w-4 h-4 text-blue-500" />}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ps.color}`}>{ps.label}</span>
                      </div>
                      {p.manufacturer_city && (
                        <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" /> {p.manufacturer_city}
                          {p.distance_km > 0 && <span>· {Math.round(p.distance_km)} km</span>}
                        </p>
                      )}
                    </div>

                    {/* Green Score */}
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${p.green_score >= 70 ? "bg-emerald-500" : p.green_score >= 40 ? "bg-yellow-500" : "bg-red-400"}`}>
                        {p.green_score}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-0.5"><Leaf className="w-3 h-3" /> Green</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Precio unitario</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCOP(p.unit_price)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Precio total</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCOP(p.total_price)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Plazo entrega</span>
                      <p className="font-medium text-gray-900 dark:text-white">{p.lead_time_days} días</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Certificaciones</span>
                      <p className="font-medium text-gray-900 dark:text-white">{p.certifications_count}</p>
                    </div>
                  </div>

                  {p.proposed_materials && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      <strong>Materiales:</strong> {p.proposed_materials}
                      {p.recycled_percentage > 0 && <span className="text-emerald-600"> ({p.recycled_percentage}% reciclado)</span>}
                    </p>
                  )}
                  {p.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><strong>Notas:</strong> {p.notes}</p>}

                  {/* Actions */}
                  {!isAwarded && p.status === "pending" && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                      <Button size="sm" variant="outline" onClick={() => handleAction(p.id, "shortlist")} disabled={actionLoading === p.id}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Star className="w-3.5 h-3.5 mr-1" /> Preseleccionar
                      </Button>
                      <Button size="sm" onClick={() => handleAction(p.id, "accept")} disabled={actionLoading === p.id}
                        className="bg-[#0d7a5f] hover:bg-[#0a6b52] text-white">
                        <Check className="w-3.5 h-3.5 mr-1" /> Aceptar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(p.id, "reject")} disabled={actionLoading === p.id}
                        className="text-red-600 border-red-200 hover:bg-red-50">
                        <X className="w-3.5 h-3.5 mr-1" /> Rechazar
                      </Button>
                    </div>
                  )}
                  {p.status === "shortlisted" && !isAwarded && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                      <Button size="sm" onClick={() => handleAction(p.id, "accept")} disabled={actionLoading === p.id}
                        className="bg-[#0d7a5f] hover:bg-[#0a6b52] text-white">
                        <Check className="w-3.5 h-3.5 mr-1" /> Adjudicar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(p.id, "reject")} disabled={actionLoading === p.id}
                        className="text-red-600 border-red-200 hover:bg-red-50">
                        <X className="w-3.5 h-3.5 mr-1" /> Rechazar
                      </Button>
                    </div>
                  )}
                  {actionLoading === p.id && <Loader2 className="w-4 h-4 animate-spin text-[#0d7a5f] mt-2" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex items-center gap-3">
      <div className="text-[#0d7a5f]">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
