"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { User, Mail, Phone, Lock, Bell, Shield, Eye, EyeOff, Save, Camera } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("perfil");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailMessages: true,
    emailPromos: false,
    pushBookings: true,
    pushMessages: true,
    pushPromos: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setFormData((prev) => ({
            ...prev,
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
          }));
        } else {
          router.push("/login");
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

  const tabs = [
    { id: "perfil", label: "Mi Perfil", icon: User },
    { id: "seguridad", label: "Seguridad", icon: Shield },
    { id: "notificaciones", label: "Notificaciones", icon: Bell },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 mt-1">Administra tu cuenta y preferencias</p>
        </div>

        <div className="flex gap-2 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-[#0d7a5f] border-[#0d7a5f]"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "perfil" && (
          <Card className="p-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#0d7a5f] flex items-center justify-center text-white text-2xl font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border hover:bg-gray-50">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                <p className="text-sm text-gray-500">{user.role === "admin" ? "Administrador" : "Cliente"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="pl-10"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="pl-10"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    placeholder="+57 300 000 0000"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button className="bg-[#0d7a5f] hover:bg-[#0a6b52] gap-2">
                <Save className="w-4 h-4" />
                Guardar Cambios
              </Button>
            </div>
          </Card>
        )}

        {activeTab === "seguridad" && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-6">Cambiar Contraseña</h3>
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="pl-10"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>
              <Button className="bg-[#0d7a5f] hover:bg-[#0a6b52] gap-2 mt-2">
                <Shield className="w-4 h-4" />
                Actualizar Contraseña
              </Button>
            </div>
          </Card>
        )}

        {activeTab === "notificaciones" && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-6">Preferencias de Notificaciones</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Correo Electrónico</h4>
                <div className="space-y-3">
                  {[
                    { key: "emailBookings" as const, label: "Actualizaciones de reservas", desc: "Estado de tus reservas y confirmaciones" },
                    { key: "emailMessages" as const, label: "Nuevos mensajes", desc: "Cuando recibes un mensaje de un profesional" },
                    { key: "emailPromos" as const, label: "Promociones y ofertas", desc: "Descuentos y ofertas especiales" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        className="w-5 h-5 rounded text-[#0d7a5f] focus:ring-[#0d7a5f]"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Notificaciones Push</h4>
                <div className="space-y-3">
                  {[
                    { key: "pushBookings" as const, label: "Reservas en tiempo real", desc: "Alertas inmediatas sobre tus reservas" },
                    { key: "pushMessages" as const, label: "Mensajes instantáneos", desc: "Notificaciones de chat en tiempo real" },
                    { key: "pushPromos" as const, label: "Ofertas flash", desc: "Promociones por tiempo limitado" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        className="w-5 h-5 rounded text-[#0d7a5f] focus:ring-[#0d7a5f]"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-[#0d7a5f] hover:bg-[#0a6b52] gap-2">
                  <Save className="w-4 h-4" />
                  Guardar Preferencias
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
