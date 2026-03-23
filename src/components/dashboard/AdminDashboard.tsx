"use client";

import {
  User,
  Users,
  BarChart3,
  Package,
  MessageSquare,
  Settings,
  Bell,
  Shield,
  Activity,
  TrendingUp,
  Database,
  FileText,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface AdminDashboardProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const t = useTranslations("AdminDashboard");
  const stats = [
    { label: t("stats.totalUsers"), value: "1,234", icon: Users, color: "bg-blue-500", change: "+12%" },
    { label: t("stats.activeProjects"), value: "89", icon: Package, color: "bg-green-500", change: "+5%" },
    { label: t("stats.monthlyRevenue"), value: "$45,231", icon: TrendingUp, color: "bg-purple-500", change: "+18%" },
    { label: t("stats.openTickets"), value: "23", icon: MessageSquare, color: "bg-yellow-500", change: "-8%" },
  ];

  const recentUsers = [
    { name: "María García", email: "maria@ejemplo.com", date: "Hace 2 horas", status: "active" },
    { name: "Carlos López", email: "carlos@ejemplo.com", date: "Hace 5 horas", status: "active" },
    { name: "Ana Martínez", email: "ana@ejemplo.com", date: "Hace 1 día", status: "pending" },
    { name: "Pedro Sánchez", email: "pedro@ejemplo.com", date: "Hace 2 días", status: "active" },
  ];

  const systemStatus = [
    { name: "Servidor principal", status: "online", uptime: "99.9%" },
    { name: "Base de datos", status: "online", uptime: "99.8%" },
    { name: "API Gateway", status: "online", uptime: "99.7%" },
    { name: "CDN", status: "online", uptime: "100%" },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl font-bold text-white">
                {t("title")}
              </h1>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {t("welcome", { name: user.firstName })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-red-400">{t("role")}</p>
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
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change} {t("vsPrevMonth")}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{t("recentUsers")}</h2>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                {t("viewAll")}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                    <th className="pb-3 font-medium">{t("table.user")}</th>
                    <th className="pb-3 font-medium">{t("table.email")}</th>
                    <th className="pb-3 font-medium">{t("table.registered")}</th>
                    <th className="pb-3 font-medium">{t("table.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user, index) => (
                    <tr key={index} className="border-b border-gray-700 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-300" />
                          </div>
                          <span className="text-sm text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-400">{user.email}</td>
                      <td className="py-3 text-sm text-gray-400">{user.date}</td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            user.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {user.status === "active" ? t("statusActive") : t("statusPending")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Status & Admin Actions */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">{t("systemStatus")}</h2>
              </div>
              <div className="space-y-3">
                {systemStatus.map((system, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-300">{system.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">Uptime: {system.uptime}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Actions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">{t("adminActions")}</h2>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium">{t("actions.manageUsers")}</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                  <Database className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">{t("actions.database")}</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium">{t("actions.analytics")}</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                  <FileText className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-medium">{t("actions.systemLogs")}</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium">{t("actions.settings")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
