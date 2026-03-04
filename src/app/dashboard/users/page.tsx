"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Users, Search, Mail, Phone, Shield, ShieldCheck, MoreVertical, UserX, UserCheck } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface UserRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  totalBookings: number;
}

const mockUsers: UserRecord[] = [
  { id: 1, firstName: "María", lastName: "González", email: "maria@email.com", phone: "+57 310 555 1234", role: "user", isActive: true, createdAt: "2025-11-15", totalBookings: 8 },
  { id: 2, firstName: "Carlos", lastName: "Rodríguez", email: "carlos@email.com", phone: "+57 300 555 5678", role: "user", isActive: true, createdAt: "2025-12-02", totalBookings: 12 },
  { id: 3, firstName: "Ana", lastName: "Martínez", email: "ana@email.com", phone: "+57 315 555 9012", role: "user", isActive: true, createdAt: "2026-01-10", totalBookings: 3 },
  { id: 4, firstName: "Luis", lastName: "Pérez", email: "luis@email.com", phone: "+57 320 555 3456", role: "admin", isActive: true, createdAt: "2025-10-01", totalBookings: 0 },
  { id: 5, firstName: "Sandra", lastName: "López", email: "sandra@email.com", phone: "+57 312 555 7890", role: "user", isActive: false, createdAt: "2025-11-20", totalBookings: 5 },
  { id: 6, firstName: "Diego", lastName: "Torres", email: "diego@email.com", phone: "+57 318 555 2345", role: "user", isActive: true, createdAt: "2026-02-01", totalBookings: 1 },
];

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

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

  const filteredUsers = mockUsers.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-500 mt-1">{mockUsers.length} usuarios registrados</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "user", "admin"].map((role) => (
              <Button
                key={role}
                variant={filterRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole(role)}
                className={filterRole === role ? "bg-[#0d7a5f] hover:bg-[#0a6b52]" : ""}
              >
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
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Reservas</th>
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
                        <div className="w-10 h-10 rounded-full bg-[#0d7a5f] flex items-center justify-center text-white text-sm font-bold">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-500">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {u.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {u.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {u.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        {u.role === "admin" ? "Admin" : "Cliente"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-700 font-medium">{u.totalBookings}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {u.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString("es-CO")}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#0d7a5f]">
                          {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#0d7a5f]">
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <MoreVertical className="w-4 h-4" />
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
    </DashboardLayout>
  );
}
