"use client";

import { useState, useEffect } from "react";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, CalendarCheck, DollarSign, Star, ArrowUpRight, Loader2 } from "lucide-react";

interface MonthlyData { month: string; bookings: number; revenue: number; }
interface TopService { name: string; bookings: number; revenue: number; growth: number; }
interface TopProfessional { name: string; jobs: number; rating: number; revenue: number; }
interface Totals { total_bookings: number; total_revenue: number; new_users: number; avg_rating: number; }

export default function ReportsPage() {
  const { user } = useDashboardUser();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [topProfessionals, setTopProfessionals] = useState<TopProfessional[]>([]);
  const [totals, setTotals] = useState<Totals>({ total_bookings: 0, total_revenue: 0, new_users: 0, avg_rating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/reports")
      .then((r) => r.json())
      .then((data) => {
        setMonthlyData(data.monthlyData ?? []);
        setTopServices(data.topServices ?? []);
        setTopProfessionals(data.topProfessionals ?? []);
        if (data.totals) setTotals(data.totals);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const formatCOP = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  const maxBookings = Math.max(...monthlyData.map((d) => d.bookings), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-500 mt-1">An&aacute;lisis y m&eacute;tricas de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pedidos del Mes", value: String(totals.total_bookings), icon: CalendarCheck, color: "bg-blue-100 text-blue-600" },
          { label: "Ingresos del Mes", value: formatCOP(totals.total_revenue), icon: DollarSign, color: "bg-green-100 text-green-600" },
          { label: "Nuevos Clientes", value: String(totals.new_users), icon: Users, color: "bg-purple-100 text-purple-600" },
          { label: "Calificaci&oacute;n Promedio", value: String(totals.avg_rating), icon: Star, color: "bg-yellow-100 text-yellow-600" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {monthlyData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2563eb]" />
            Pedidos Mensuales
          </h3>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-700">{d.bookings}</span>
                <div
                  className="w-full bg-[#2563eb] rounded-t-md transition-all hover:bg-[#1d4ed8]"
                  style={{ height: `${(d.bookings / maxBookings) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{d.month}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topServices.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#2563eb]" />
              Servicios M&aacute;s Solicitados
            </h3>
            <div className="space-y-4">
              {topServices.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">{s.name}</p>
                      <span className={`text-xs font-medium ${s.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {s.growth >= 0 ? "+" : ""}{s.growth}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{s.bookings} pedidos</span>
                      <span>{formatCOP(s.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div className="bg-[#2563eb] h-1.5 rounded-full" style={{ width: `${(s.bookings / topServices[0].bookings) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {topProfessionals.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2563eb]" />
              Top Especialistas
            </h3>
            <div className="space-y-4">
              {topProfessionals.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-sm font-bold">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{p.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{p.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{p.jobs} trabajos</span>
                      <span>{formatCOP(p.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

