"use client";

import {
  CalendarCheck,
  MessageSquare,
  UserCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  TrendingUp,
  Search,
  Plus,
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

/* ---------- ADMIN stats ---------- */
const adminStats = [
  { title: "Reservas Activas", value: "24", change: "+5", changeType: "positive", icon: CalendarCheck },
  { title: "Profesionales", value: "18", change: "+3", changeType: "positive", icon: UserCheck },
  { title: "Servicios", value: "42", change: "+6", changeType: "positive", icon: Sparkles },
  { title: "Ingresos del Mes", value: "$4.250.000", change: "+22%", changeType: "positive", icon: TrendingUp },
];

const adminRecentBookings = [
  { id: 1, service: "Limpieza Profunda", client: "María García", professional: "Carlos Méndez", status: "En Progreso", statusColor: "bg-blue-100 text-blue-700", date: "Hoy, 10:00 AM", price: "$120.000" },
  { id: 2, service: "Jardinería General", client: "Pedro López", professional: "Ana Ruiz", status: "Confirmada", statusColor: "bg-green-100 text-green-700", date: "Hoy, 2:00 PM", price: "$85.000" },
  { id: 3, service: "Reparación Eléctrica", client: "Laura Sánchez", professional: "Miguel Torres", status: "Pendiente", statusColor: "bg-yellow-100 text-yellow-700", date: "Mañana, 9:00 AM", price: "$150.000" },
  { id: 4, service: "Plomería", client: "Juan Rodríguez", professional: "Diego Vargas", status: "Completada", statusColor: "bg-gray-100 text-gray-700", date: "Ayer, 3:00 PM", price: "$95.000" },
];

const adminActivity = [
  { id: 1, text: "Nueva reserva de limpieza creada por María García", time: "Hace 10 min", icon: CalendarCheck },
  { id: 2, text: "Carlos Méndez completó servicio de pintura", time: "Hace 30 min", icon: CheckCircle2 },
  { id: 3, text: "Nuevo profesional registrado: Ana Ruiz", time: "Hace 1 hora", icon: UserCheck },
  { id: 4, text: "Reseña de 5 estrellas recibida para jardinería", time: "Hace 2 horas", icon: Star },
];

/* ---------- USER stats ---------- */
const userStats = [
  { title: "Mis Reservas", value: "3", change: "+1", changeType: "positive", icon: CalendarCheck },
  { title: "Mensajes", value: "5", change: "+2", changeType: "positive", icon: MessageSquare },
  { title: "Servicios Favoritos", value: "8", change: "", changeType: "neutral", icon: Star },
  { title: "Próximo Servicio", value: "Hoy", change: "2:00 PM", changeType: "neutral", icon: Clock },
];

const userUpcomingBookings = [
  { id: 1, service: "Limpieza del Hogar", professional: "Carlos Méndez", status: "Confirmada", statusColor: "bg-green-100 text-green-700", date: "Hoy, 2:00 PM", price: "$85.000", rating: 4.9 },
  { id: 2, service: "Jardinería", professional: "Ana Ruiz", status: "Pendiente", statusColor: "bg-yellow-100 text-yellow-700", date: "Mar 20, 10:00 AM", price: "$120.000", rating: 4.7 },
  { id: 3, service: "Reparación A/C", professional: "Miguel Torres", status: "Programada", statusColor: "bg-blue-100 text-blue-700", date: "Mar 22, 9:00 AM", price: "$200.000", rating: 4.8 },
];

const userActivity = [
  { id: 1, text: "Tu reserva de limpieza fue confirmada", time: "Hace 5 min", icon: CheckCircle2 },
  { id: 2, text: "Carlos Méndez aceptó tu solicitud", time: "Hace 30 min", icon: UserCheck },
  { id: 3, text: "Nuevo servicio disponible: Fumigación", time: "Hace 1 hora", icon: Sparkles },
  { id: 4, text: "Califica tu servicio de plomería reciente", time: "Hace 3 horas", icon: Star },
];

const featuredServices = [
  { name: "Limpieza del Hogar", price: "Desde $60.000", icon: "🧹", color: "bg-blue-50" },
  { name: "Jardinería", price: "Desde $70.000", icon: "🌿", color: "bg-green-50" },
  { name: "Plomería", price: "Desde $80.000", icon: "🔧", color: "bg-orange-50" },
  { name: "Electricidad", price: "Desde $90.000", icon: "⚡", color: "bg-yellow-50" },
];

export default function DashboardHome({ user }: DashboardHomeProps) {
  const isAdmin = user.role === "admin";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const stats = isAdmin ? adminStats : userStats;
  const activity = isAdmin ? adminActivity : userActivity;

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
              ? "Aquí tienes un resumen de la actividad de TidyHubb."
              : "¿Qué servicio necesitas hoy?"}
          </p>
        </div>
        <Link href={isAdmin ? "/dashboard/services/new" : "/dashboard/services"}>
          <Button className="bg-[#0d7a5f] hover:bg-[#0a6b52] text-white">
            {isAdmin ? (
              <><Plus className="w-4 h-4 mr-2" /> Crear Servicio</>
            ) : (
              <><Search className="w-4 h-4 mr-2" /> Buscar Servicios</>
            )}
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-[#0d7a5f]/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#0d7a5f]" />
                  </div>
                  {stat.change && stat.changeType !== "neutral" && (
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                    }`}>
                      {stat.changeType === "positive" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  )}
                  {stat.changeType === "neutral" && stat.change && (
                    <span className="text-sm text-gray-500">{stat.change}</span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings / Reservas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {isAdmin ? "Reservas Recientes" : "Próximas Reservas"}
              </CardTitle>
              <Link href="/dashboard/bookings">
                <Button variant="ghost" size="sm" className="text-[#0d7a5f]">Ver todas</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isAdmin
                  ? adminRecentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{booking.service}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.statusColor}`}>{booking.status}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>👤 {booking.client}</span>
                            <span>🔧 {booking.professional}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.date}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">{booking.price}</span>
                      </div>
                    ))
                  : userUpcomingBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{booking.service}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.statusColor}`}>{booking.status}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {booking.professional}</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {booking.rating}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.date}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">{booking.price}</span>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{item.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions (admin) / Featured Services (user) */}
          {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/services/new">
                  <Button variant="outline" className="w-full justify-start">
                    <Sparkles className="w-4 h-4 mr-2" /> Crear Servicio
                  </Button>
                </Link>
                <Link href="/dashboard/professionals/new">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCheck className="w-4 h-4 mr-2" /> Registrar Profesional
                  </Button>
                </Link>
                <Link href="/dashboard/bookings">
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarCheck className="w-4 h-4 mr-2" /> Gestionar Reservas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Servicios Destacados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {featuredServices.map((service) => (
                    <Link href="/dashboard/services" key={service.name}>
                      <div className={`${service.color} rounded-xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer`}>
                        <span className="text-2xl">{service.icon}</span>
                        <p className="text-sm font-medium text-gray-900 mt-2">{service.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{service.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
