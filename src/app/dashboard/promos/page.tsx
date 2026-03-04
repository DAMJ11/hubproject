"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Ticket, Plus, Search, Copy, CheckCircle, XCircle, Percent, DollarSign, Calendar } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface PromoCode {
  id: number;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const mockPromos: PromoCode[] = [
  { id: 1, code: "BIENVENIDO20", description: "20% descuento para nuevos usuarios", discountType: "percentage", discountValue: 20, minOrderAmount: 50000, maxUses: 100, currentUses: 45, validFrom: "2026-01-01", validUntil: "2026-06-30", isActive: true },
  { id: 2, code: "LIMPIEZA10K", description: "$10.000 off en servicios de limpieza", discountType: "fixed", discountValue: 10000, minOrderAmount: 80000, maxUses: 50, currentUses: 32, validFrom: "2026-02-01", validUntil: "2026-04-30", isActive: true },
  { id: 3, code: "VERANO2026", description: "15% descuento en todos los servicios", discountType: "percentage", discountValue: 15, minOrderAmount: 0, maxUses: 200, currentUses: 89, validFrom: "2026-03-01", validUntil: "2026-03-31", isActive: true },
  { id: 4, code: "JARDIN5K", description: "$5.000 off en jardinería", discountType: "fixed", discountValue: 5000, minOrderAmount: 60000, maxUses: 30, currentUses: 30, validFrom: "2025-12-01", validUntil: "2026-02-28", isActive: false },
];

export default function PromosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

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

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatCOP = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

  const filtered = mockPromos.filter((p) =>
    `${p.code} ${p.description}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promociones</h1>
            <p className="text-gray-500 mt-1">Gestión de códigos de descuento</p>
          </div>
          <Button className="bg-[#0d7a5f] hover:bg-[#0a6b52] gap-2">
            <Plus className="w-4 h-4" />
            Crear Código
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar código o descripción..." className="pl-10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((promo) => (
            <Card key={promo.id} className={`p-5 ${!promo.isActive ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${promo.discountType === "percentage" ? "bg-purple-100" : "bg-green-100"}`}>
                    {promo.discountType === "percentage" ? <Percent className="w-5 h-5 text-purple-600" /> : <DollarSign className="w-5 h-5 text-green-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-[#0d7a5f]">{promo.code}</code>
                      <button onClick={() => handleCopy(promo.id, promo.code)} className="text-gray-400 hover:text-gray-600">
                        {copiedId === promo.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">{promo.description}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${promo.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {promo.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {promo.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Descuento:</span>
                  <span className="font-semibold">{promo.discountType === "percentage" ? `${promo.discountValue}%` : formatCOP(promo.discountValue)}</span>
                </div>
                {promo.minOrderAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mínimo de compra:</span>
                    <span>{formatCOP(promo.minOrderAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Usos:</span>
                  <span>{promo.currentUses} / {promo.maxUses ?? "∞"}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#0d7a5f] h-2 rounded-full" style={{ width: `${promo.maxUses ? (promo.currentUses / promo.maxUses) * 100 : 50}%` }} />
                </div>
                <div className="flex items-center gap-1 text-gray-500 pt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(promo.validFrom).toLocaleDateString("es-CO")} - {new Date(promo.validUntil).toLocaleDateString("es-CO")}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
