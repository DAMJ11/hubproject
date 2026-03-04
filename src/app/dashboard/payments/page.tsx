"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CreditCard, Search, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Payment {
  id: number;
  bookingCode: string;
  client: string;
  professional: string;
  service: string;
  amount: number;
  method: string;
  status: "completed" | "pending" | "failed" | "refunded";
  date: string;
}

const mockPayments: Payment[] = [
  { id: 1, bookingCode: "TH-2026-001", client: "María González", professional: "Carlos Méndez", service: "Limpieza General", amount: 80000, method: "Nequi", status: "completed", date: "2026-03-02" },
  { id: 2, bookingCode: "TH-2026-002", client: "Ana Martínez", professional: "Laura Díaz", service: "Poda de Jardín", amount: 60000, method: "Tarjeta", status: "completed", date: "2026-03-01" },
  { id: 3, bookingCode: "TH-2026-003", client: "Luis Pérez", professional: "Miguel Torres", service: "Revisión Eléctrica", amount: 60000, method: "Daviplata", status: "pending", date: "2026-03-03" },
  { id: 4, bookingCode: "TH-2026-004", client: "Sandra López", professional: "Carlos Méndez", service: "Limpieza Profunda", amount: 150000, method: "Transferencia", status: "completed", date: "2026-02-28" },
  { id: 5, bookingCode: "TH-2026-005", client: "Diego Torres", professional: "Ana Ruiz", service: "Mantenimiento Jardín", amount: 90000, method: "Efectivo", status: "failed", date: "2026-02-27" },
  { id: 6, bookingCode: "TH-2026-006", client: "María González", professional: "Pedro Vargas", service: "Reparación de Fugas", amount: 70000, method: "Nequi", status: "refunded", date: "2026-02-25" },
];

const statusConfig = {
  completed: { label: "Completado", color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  failed: { label: "Fallido", color: "bg-red-100 text-red-700", icon: XCircle },
  refunded: { label: "Reembolsado", color: "bg-blue-100 text-blue-700", icon: ArrowDownRight },
};

export default function PaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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

  const totalRevenue = mockPayments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = mockPayments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  const filtered = mockPayments.filter((p) => {
    const matchSearch = `${p.bookingCode} ${p.client} ${p.service}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatCOP = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-500 mt-1">Gestión y seguimiento de pagos</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCOP(totalRevenue)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>+12% vs mes anterior</span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCOP(pendingAmount)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Transacciones</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{mockPayments.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">83%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por código, cliente o servicio..." className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "completed", "pending", "failed", "refunded"].map((s) => (
              <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(s)}
                className={filterStatus === s ? "bg-[#0d7a5f] hover:bg-[#0a6b52]" : ""}>
                {s === "all" ? "Todos" : statusConfig[s as keyof typeof statusConfig].label}
              </Button>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Código</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Cliente</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Servicio</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Monto</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Método</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const cfg = statusConfig[p.status];
                  return (
                    <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-sm font-medium text-[#0d7a5f]">{p.bookingCode}</td>
                      <td className="p-4 text-sm text-gray-700">{p.client}</td>
                      <td className="p-4 text-sm text-gray-700">{p.service}</td>
                      <td className="p-4 text-sm font-semibold text-gray-900">{formatCOP(p.amount)}</td>
                      <td className="p-4 text-sm text-gray-600">{p.method}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                          <cfg.icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{new Date(p.date).toLocaleDateString("es-CO")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
