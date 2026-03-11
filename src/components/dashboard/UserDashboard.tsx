"use client";

import { User, BarChart3, Package, MessageSquare, Settings, Bell, Calendar } from "lucide-react";

interface UserDashboardProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const stats = [
    { label: "Proyectos activos", value: "3", icon: Package, color: "bg-blue-500" },
    { label: "Mensajes nuevos", value: "12", icon: MessageSquare, color: "bg-green-500" },
    { label: "Tareas pendientes", value: "8", icon: Calendar, color: "bg-yellow-500" },
    { label: "Notificaciones", value: "5", icon: Bell, color: "bg-purple-500" },
  ];

  const recentActivity = [
    { action: "Proyecto 'Website Redesign' actualizado", time: "Hace 2 horas" },
    { action: "Nuevo mensaje de soporte", time: "Hace 5 horas" },
    { action: "Tarea 'Revisar diseño' completada", time: "Hace 1 día" },
    { action: "Nuevo proyecto creado", time: "Hace 2 días" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido, {user.firstName}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Panel de usuario - Aquí puedes gestionar tus proyectos y actividades
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2563eb] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad reciente</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#2563eb] rounded-full"></div>
                    <p className="text-sm text-gray-700">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Package className="w-5 h-5 text-[#2563eb]" />
                <span className="text-sm font-medium">Crear nuevo proyecto</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5 text-[#2563eb]" />
                <span className="text-sm font-medium">Enviar mensaje</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5 text-[#2563eb]" />
                <span className="text-sm font-medium">Ver reportes</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-[#2563eb]" />
                <span className="text-sm font-medium">Configuración</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

