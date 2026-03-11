"use client";

import { useState, useEffect } from "react";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Users, Search, Mail, Phone, Shield, ShieldCheck, Trash2, UserX, UserCheck, Loader2 } from "lucide-react";

interface UserRecord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  total_bookings: number;
}

export default function UsersPage() {
  const { user } = useDashboardUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/dashboard/users");
      const data = await response.json();
      setUsers(data.users ?? []);
    } catch (error) {
      console.error(error);
      setActionError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAction = async (
    targetUser: UserRecord,
    action: "activate" | "deactivate" | "grant_admin" | "delete"
  ) => {
    if (actionLoadingId !== null) return;

    if (action === "delete") {
      const confirmed = window.confirm(
        `¿Seguro que deseas eliminar a ${targetUser.first_name} ${targetUser.last_name}? Esta acción no se puede deshacer.`
      );
      if (!confirmed) return;
    }

    setActionMessage("");
    setActionError("");
    setActionLoadingId(targetUser.id);

    try {
      const response =
        action === "delete"
          ? await fetch(`/api/dashboard/users?userId=${targetUser.id}`, { method: "DELETE" })
          : await fetch("/api/dashboard/users", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: targetUser.id, action }),
            });

      const data = await response.json();

      if (!response.ok) {
        setActionError(data?.error || "No se pudo completar la acción.");
        return;
      }

      setActionMessage(data?.message || "Acción aplicada correctamente.");

      // Actualización local del usuario
      setUsers((prev) => {
        if (action === "delete") {
          return prev.filter((u) => u.id !== targetUser.id);
        }
        return prev.map((u) =>
          u.id === targetUser.id
            ? {
                ...u,
                is_active:
                  action === "activate"
                    ? true
                    : action === "deactivate"
                    ? false
                    : u.is_active,
                role:
                  action === "grant_admin"
                    ? "admin"
                    : u.role,
              }
            : u
        );
      });
    } catch (error) {
      console.error(error);
      setActionError("Ocurrió un error al ejecutar la acción.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      filterRole === "all" ||
      (filterRole === "admin" && u.role === "admin") ||
      (filterRole === "clients" && u.role !== "admin");
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gesti&oacute;n de Clientes</h1>
          <p className="text-gray-500 mt-1">{users.length} clientes registrados</p>
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}
      {actionMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {actionMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por nombre o correo..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          {["all", "clients", "admin"].map((role) => (
            <Button key={role} variant={filterRole === role ? "default" : "outline"} size="sm" onClick={() => setFilterRole(role)}
              className={filterRole === role ? "bg-[#2563eb] hover:bg-[#1d4ed8]" : ""}>
              {role === "all" ? "Todos" : role === "admin" ? "Admins" : "Clientes"}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Usuario</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Contacto</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Rol</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Pedidos</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Registro</th>
                <th className="text-right p-4 text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-sm font-bold">
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-gray-500">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" /> {u.email}
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" /> {u.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {u.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {u.role === "admin" ? "Admin" : "Cliente"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-700 font-medium">{u.total_bookings}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {u.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString("es-CO")}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-[#2563eb]"
                        disabled={actionLoadingId === u.id || u.id === user.id}
                        title={u.id === user.id ? "No puedes modificar tu propio usuario" : u.is_active ? "Desactivar usuario" : "Activar usuario"}
                        onClick={() => handleUserAction(u, u.is_active ? "deactivate" : "activate")}
                      >
                        {actionLoadingId === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : u.is_active ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-[#2563eb]"
                        disabled={actionLoadingId === u.id || u.role === "admin" || u.id === user.id}
                        title={u.role === "admin" ? "Ya es admin" : "Otorgar permisos de admin"}
                        onClick={() => handleUserAction(u, "grant_admin")}
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-600"
                        disabled={actionLoadingId === u.id || u.role === "admin" || u.id === user.id}
                        title={u.role === "admin" ? "No se puede eliminar un admin" : "Eliminar usuario"}
                        onClick={() => handleUserAction(u, "delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

