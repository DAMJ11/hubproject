"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, CalendarCheck, DollarSign, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const monthlyData = [
  { month: "Oct", bookings: 120, revenue: 8500000 },
  { month: "Nov", bookings: 145, revenue: 10200000 },
  { month: "Dic", bookings: 180, revenue: 13500000 },
  { month: "Ene", bookings: 160, revenue: 11800000 },
  { month: "Feb", bookings: 195, revenue: 14200000 },
  { month: "Mar", bookings: 210, revenue: 15600000 },
];

const topServices = [
  { name: "Limpieza General", bookings: 85, revenue: 6800000, growth: 12 },
  { name: "Limpieza Profunda", bookings: 42, revenue: 6300000, growth: 8 },
  { name: "Mantenimiento Jardín", bookings: 38, revenue: 3420000, growth: 15 },
  { name: "Revisión Eléctrica", bookings: 30, revenue: 1800000, growth: -3 },
  { name: "Reparación de Fugas", bookings: 25, revenue: 1750000, growth: 5 },
];

const topProfessionals = [
  { name: "Carlos Méndez", jobs: 48, rating: 4.9, revenue: 3840000 },
  { name: "Laura Díaz", jobs: 42, rating: 4.8, revenue: 3360000 },
  { name: "Miguel Torres", jobs: 35, rating: 4.7, revenue: 2800000 },
  { name: "Ana Ruiz", jobs: 30, rating: 4.9, revenue: 2400000 },
];

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        const data = await res.json();
        if (data.success && data.user?.role === "admin") {
          setUser(data.user);
        } else {
          router.push("/dashboard");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d7a5f]" />
      </div>
    );
  }
  if (!user) return null;

  const formatCOP = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
  const maxBookings = Math.max(...monthlyData.map((d) => d.bookings));

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 mt-1">Análisis y métricas de la plataforma</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Reservas del Mes", value: "210", change: "+7.7%", up: true, icon: CalendarCheck, color: "bg-blue-100 text-blue-600" },
            { label: "Ingresos del Mes", value: formatCOP(15600000), change: "+9.8%", up: true, icon: DollarSign, color: "bg-green-100 text-green-600" },
            { label: "Nuevos Usuarios", value: "34", change: "+12%", up: true, icon: Users, color: "bg-purple-100 text-purple-600" },
            { label: "Calificación Promedio", value: "4.8", change: "+0.1", up: true, icon: Star, color: "bg-yellow-100 text-yellow-600" },
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
              <div className={`flex items-center gap-1 mt-2 text-xs ${stat.up ? "text-green-600" : "text-red-600"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{stat.change} vs mes anterior</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0d7a5f]" />
            Reservas Mensuales
          </h3>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-700">{d.bookings}</span>
                <div
                  className="w-full bg-[#0d7a5f] rounded-t-md transition-all hover:bg-[#0a6b52]"
                  style={{ height: `${(d.bookings / maxBookings) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{d.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0d7a5f]" />
              Servicios Más Solicitados
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
                      <span>{s.bookings} reservas</span>
                      <span>{formatCOP(s.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div className="bg-[#0d7a5f] h-1.5 rounded-full" style={{ width: `${(s.bookings / topServices[0].bookings) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0d7a5f]" />
              Top Profesionales
            </h3>
            <div className="space-y-4">
              {topProfessionals.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0d7a5f] flex items-center justify-center text-white text-sm font-bold">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
