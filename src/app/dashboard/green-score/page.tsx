"use client";

import { useState, useEffect, useCallback } from "react";
import { Leaf, Award, MapPin, Recycle, Star, Loader2, TrendingUp } from "lucide-react";

interface GreenData {
  certifications: { id: number; certification_name: string; issued_by: string; expires_at: string | null }[];
  capabilities: { id: number; capability_name: string; min_order_quantity: number; max_order_quantity: number }[];
  avgScore: number;
  totalProposals: number;
}

export default function GreenScorePage() {
  const [data, setData] = useState<GreenData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [certsRes, capsRes, proposalsRes] = await Promise.all([
        fetch("/api/manufacturers/certifications"),
        fetch("/api/manufacturers/capabilities"),
        fetch("/api/proposals/mine"),
      ]);
      const certs = await certsRes.json();
      const caps = await capsRes.json();
      const proposals = await proposalsRes.json();

      const proposalsList = proposals.data || [];
      const scores = proposalsList.map((p: { green_score: number }) => p.green_score).filter((s: number) => s > 0);
      const avgScore = scores.length > 0 && scores.every((s: number) => !isNaN(s))
        ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
        : 0;

      setData({
        certifications: certs.data || [],
        capabilities: caps.data || [],
        avgScore,
        totalProposals: proposalsList.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (!data) return null;

  const scoreColor = data.avgScore >= 70 ? "text-emerald-500" : data.avgScore >= 40 ? "text-yellow-500" : "text-red-400";
  const scoreBg = data.avgScore >= 70 ? "bg-emerald-500" : data.avgScore >= 40 ? "bg-yellow-500" : "bg-red-400";

  const tips = [
    { icon: <Award className="w-5 h-5" />, text: "Obtén certificaciones como GOTS u OEKO-TEX para ganar hasta +30 puntos", done: data.certifications.length > 0 },
    { icon: <Recycle className="w-5 h-5" />, text: "Usa materiales reciclados en tus propuestas para mejorar el score de materiales", done: false },
    { icon: <MapPin className="w-5 h-5" />, text: "La proximidad a la marca suma puntos automáticamente (hasta 30pts)", done: true },
    { icon: <Star className="w-5 h-5" />, text: "Mantén buenas calificaciones de clientes para sumar hasta 10pts", done: false },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Puntuación Verde</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tu Green Score refleja tu compromiso con la sostenibilidad</p>
      </div>

      {/* Score card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
        <div className={`w-28 h-28 mx-auto rounded-full ${scoreBg} flex items-center justify-center mb-4`}>
          <span className="text-4xl font-bold text-white">{data.avgScore}</span>
        </div>
        <p className={`text-lg font-semibold ${scoreColor}`}>
          {data.avgScore >= 70 ? "Excelente" : data.avgScore >= 40 ? "Bueno" : data.avgScore > 0 ? "Necesita mejorar" : "Sin datos"}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Promedio de {data.totalProposals} propuesta{data.totalProposals !== 1 ? "s" : ""} enviada{data.totalProposals !== 1 ? "s" : ""}
        </p>

        {/* Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <ScoreItem label="Proximidad" max={30} icon={<MapPin className="w-4 h-4" />} />
          <ScoreItem label="Materiales" max={35} icon={<Recycle className="w-4 h-4" />} />
          <ScoreItem label="Certificaciones" max={25} icon={<Award className="w-4 h-4" />} />
          <ScoreItem label="Historial" max={10} icon={<Star className="w-4 h-4" />} />
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#2563eb]" /> Certificaciones ({data.certifications.length})
        </h2>
        {data.certifications.length === 0 ? (
          <p className="text-sm text-gray-500">No tienes certificaciones registradas</p>
        ) : (
          <div className="space-y-2">
            {data.certifications.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{c.certification_name}</span>
                  <span className="text-gray-400 ml-2">— {c.issued_by}</span>
                </div>
                {c.expires_at && <span className="text-xs text-gray-400">Vence: {new Date(c.expires_at).toLocaleDateString("es-CO")}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#2563eb]" /> Cómo mejorar tu score
        </h2>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`mt-0.5 ${tip.done ? "text-emerald-500" : "text-gray-400"}`}>{tip.icon}</div>
              <p className={`text-sm ${tip.done ? "text-gray-500 line-through" : "text-gray-700 dark:text-gray-300"}`}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreItem({ label, max, icon }: { label: string; max: number; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="text-[#2563eb] flex justify-center mb-1">{icon}</div>
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <p className="text-[10px] text-gray-400">máx. {max} pts</p>
    </div>
  );
}

