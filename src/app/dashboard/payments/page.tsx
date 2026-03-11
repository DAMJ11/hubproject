"use client";

import { useState, useEffect } from "react";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CreditCard, Search, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";

interface Payment {
  id: number;
  booking_id: number;
  booking_code: string;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id: string;
  paid_at: string;
  created_at: string;
  client_name: string;
  professional_name: string;
  service_name: string;
}

interface Totals {
  total_revenue: number;
  pending_amount: number;
  total_transactions: number;
  completed_count: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  completed: { label: "Completado", color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  failed: { label: "Fallido", color: "bg-red-100 text-red-700", icon: XCircle },
  refunded: { label: "Reembolsado", color: "bg-blue-100 text-blue-700", icon: ArrowDownRight },
};

export default function PaymentsPage() {
  const { user } = useDashboardUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totals, setTotals] = useState<Totals>({ total_revenue: 0, pending_amount: 0, total_transactions: 0, completed_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dashboard:payments:filters");
      if (!saved) return;

      const parsed = JSON.parse(saved) as { searchQuery?: string; filterStatus?: string };
      if (typeof parsed.searchQuery === "string") setSearchQuery(parsed.searchQuery);
      if (typeof parsed.filterStatus === "string") setFilterStatus(parsed.filterStatus);
    } catch {
      // Ignore malformed persisted state.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard:payments:filters", JSON.stringify({ searchQuery, filterStatus }));
  }, [searchQuery, filterStatus]);

  useEffect(() => {
    fetch("/api/dashboard/payments")
      .then((r) => r.json())
      .then((data) => {
        setPayments(data.payments ?? []);
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

  const successRate = totals.total_transactions > 0
    ? Math.round((totals.completed_count / totals.total_transactions) * 100)
    : 0;

  const filtered = payments.filter((p) => {
    const matchSearch = `${p.booking_code} ${p.client_name} ${p.service_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
        <p className="text-gray-500 mt-1">Gesti&oacute;n y seguimiento de pagos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCOP(totals.total_revenue)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCOP(totals.pending_amount)}</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{totals.total_transactions}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasa de &Eacute;xito</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{successRate}%</p>
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
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por c&oacute;digo, cliente o servicio..." className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "completed", "pending", "failed", "refunded"].map((s) => (
            <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(s)}
              className={filterStatus === s ? "bg-[#2563eb] hover:bg-[#1d4ed8]" : ""}>
              {s === "all" ? "Todos" : (statusConfig[s]?.label ?? s)}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 text-sm font-medium text-gray-600">C&oacute;digo</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Servicio</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Monto</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">M&eacute;todo</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {payments.length === 0 ? "Aun no hay pagos registrados." : "No se encontraron pagos con esos filtros."}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {payments.length === 0 ? "Cuando se registren transacciones apareceran aqui." : "Prueba limpiando la busqueda o cambiando el estado."}
                    </p>
                    {(searchQuery || filterStatus !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                          setSearchQuery("");
                          setFilterStatus("all");
                        }}
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const cfg = statusConfig[p.status] ?? statusConfig.pending;
                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-sm font-medium text-[#2563eb]">{p.booking_code}</td>
                    <td className="p-4 text-sm text-gray-700">{p.client_name}</td>
                    <td className="p-4 text-sm text-gray-700">{p.service_name}</td>
                    <td className="p-4 text-sm font-semibold text-gray-900">{formatCOP(p.amount)}</td>
                    <td className="p-4 text-sm text-gray-600">{p.payment_method}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{p.paid_at ? new Date(p.paid_at).toLocaleDateString("es-CO") : new Date(p.created_at).toLocaleDateString("es-CO")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

