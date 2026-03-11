"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  MessageSquare,
  Factory,
  Briefcase,
  Clock,
  Leaf,
  Search,
  Plus,
  Loader2,
  Send,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardHomeProps {
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
}

interface ProjectItem {
  id: number;
  code: string;
  title: string;
  status: string;
  quantity: number;
  budget_max: number;
  proposals_count: number;
  created_at: string;
  brand_name: string;
  category_name: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "bg-gray-100 text-gray-700" },
  open: { label: "Abierto", color: "bg-green-100 text-green-700" },
  evaluating: { label: "Evaluando", color: "bg-blue-100 text-blue-700" },
  awarded: { label: "Adjudicado", color: "bg-purple-100 text-purple-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  expired: { label: "Expirado", color: "bg-yellow-100 text-yellow-700" },
};

const iconMap: Record<string, React.ElementType> = {
  FileText,
  MessageSquare,
  Factory,
  Briefcase,
  Leaf,
  Send,
  CreditCard,
};

export default function DashboardHome({ user }: DashboardHomeProps) {
  const isBrand = user.role === "brand";
  const isManufacturer = user.role === "manufacturer";
  const isAdmin = user.role === "admin";
  const [stats, setStats] = useState<StatItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/rfq"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats ?? []);
        }
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects((data.projects ?? []).slice(0, 4));
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatCOP = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user.firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin
              ? "Aquí tienes un resumen de la actividad de FASHIONS DEN."
              : isBrand
                ? "¿Qué proyecto de moda necesitas producir hoy?"
                : "Revisa las oportunidades disponibles."}
          </p>
        </div>
        {isBrand && (
          <Link href="/dashboard/projects/new">
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
              <Plus className="w-4 h-4 mr-2" /> Crear Proyecto
            </Button>
          </Link>
        )}
        {isManufacturer && (
          <Link href="/dashboard/opportunities">
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
              <Search className="w-4 h-4 mr-2" /> Ver Oportunidades
            </Button>
          </Link>
        )}
        {isAdmin && (
          <Link href="/dashboard/rfq">
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
              <FileText className="w-4 h-4 mr-2" /> Ver Proyectos
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon] ?? FileText;
          return (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-[#2563eb]/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#2563eb]" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {isAdmin ? "Proyectos Recientes" : isBrand ? "Mis Proyectos" : "Oportunidades Recientes"}
              </CardTitle>
              <Link href={isAdmin ? "/dashboard/rfq" : isBrand ? "/dashboard/projects" : "/dashboard/opportunities"}>
                <Button variant="ghost" size="sm" className="text-[#2563eb]">Ver todos</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No hay proyectos aún.</p>
              ) : (
                <div className="space-y-4">
                  {projects.map((p) => {
                    const st = statusConfig[p.status] ?? statusConfig.draft;
                    return (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{p.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="text-xs text-gray-400">{p.code}</span>
                            <span>📦 {p.quantity} uds</span>
                            <span className="flex items-center gap-1"><Send className="w-3 h-3" /> {p.proposals_count} propuestas</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(p.created_at).toLocaleDateString("es-CO")}</span>
                          </div>
                        </div>
                        {p.budget_max > 0 && (
                          <span className="font-semibold text-gray-900">{formatCOP(p.budget_max)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel - Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isAdmin && (
                <>
                  <Link href="/dashboard/companies">
                    <Button variant="outline" className="w-full justify-start">
                      <Factory className="w-4 h-4 mr-2" /> Ver Empresas
                    </Button>
                  </Link>
                  <Link href="/dashboard/rfq">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" /> Gestionar Proyectos
                    </Button>
                  </Link>
                  <Link href="/dashboard/contracts">
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="w-4 h-4 mr-2" /> Ver Contratos
                    </Button>
                  </Link>
                </>
              )}
              {isBrand && (
                <>
                  <Link href="/dashboard/projects/new">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" /> Nuevo Proyecto
                    </Button>
                  </Link>
                  <Link href="/dashboard/manufacturers">
                    <Button variant="outline" className="w-full justify-start">
                      <Factory className="w-4 h-4 mr-2" /> Explorar Fabricantes
                    </Button>
                  </Link>
                  <Link href="/dashboard/contracts">
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="w-4 h-4 mr-2" /> Mis Contratos
                    </Button>
                  </Link>
                </>
              )}
              {isManufacturer && (
                <>
                  <Link href="/dashboard/opportunities">
                    <Button variant="outline" className="w-full justify-start">
                      <Leaf className="w-4 h-4 mr-2" /> Ver Oportunidades
                    </Button>
                  </Link>
                  <Link href="/dashboard/proposals">
                    <Button variant="outline" className="w-full justify-start">
                      <Send className="w-4 h-4 mr-2" /> Mis Propuestas
                    </Button>
                  </Link>
                  <Link href="/dashboard/company">
                    <Button variant="outline" className="w-full justify-start">
                      <Factory className="w-4 h-4 mr-2" /> Mi Perfil
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


