"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Pencil, Trash2, Search, MoreVertical, FolderOpen, Image } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  servicesCount: number;
  isActive: boolean;
  sortOrder: number;
}

const mockCategories: Category[] = [
  { id: 1, name: "Aseo del Hogar", slug: "aseo-hogar", description: "Limpieza profunda y mantenimiento de tu hogar", icon: "Sparkles", servicesCount: 4, isActive: true, sortOrder: 1 },
  { id: 2, name: "Jardinería", slug: "jardineria", description: "Cuidado de jardines, podas y paisajismo", icon: "TreePine", servicesCount: 3, isActive: true, sortOrder: 2 },
  { id: 3, name: "Plomería", slug: "plomeria", description: "Reparación e instalación de tuberías y grifos", icon: "Wrench", servicesCount: 3, isActive: true, sortOrder: 3 },
  { id: 4, name: "Electricidad", slug: "electricidad", description: "Instalación y reparación eléctrica profesional", icon: "Zap", servicesCount: 3, isActive: true, sortOrder: 4 },
  { id: 5, name: "Pintura", slug: "pintura", description: "Pintura interior y exterior de alta calidad", icon: "Paintbrush", servicesCount: 2, isActive: true, sortOrder: 5 },
  { id: 6, name: "Cerrajería", slug: "cerrajeria", description: "Apertura, cambio de cerraduras y seguridad", icon: "KeyRound", servicesCount: 2, isActive: true, sortOrder: 6 },
  { id: 7, name: "Fumigación", slug: "fumigacion", description: "Control de plagas y fumigación profesional", icon: "Bug", servicesCount: 2, isActive: true, sortOrder: 7 },
  { id: 8, name: "Carpintería", slug: "carpinteria", description: "Reparación y fabricación de muebles", icon: "Hammer", servicesCount: 2, isActive: true, sortOrder: 8 },
  { id: 9, name: "Aires Acondicionados", slug: "aires-acondicionados", description: "Instalación, mantenimiento y reparación de A/C", icon: "Wind", servicesCount: 2, isActive: true, sortOrder: 9 },
  { id: 10, name: "Mudanzas", slug: "mudanzas", description: "Servicio de mudanzas y transporte de muebles", icon: "Truck", servicesCount: 2, isActive: true, sortOrder: 10 },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filtered = mockCategories.filter((c) =>
    `${c.name} ${c.description}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categorías de Servicio</h1>
            <p className="text-gray-500 mt-1">{mockCategories.length} categorías registradas</p>
          </div>
          <Button className="bg-[#0d7a5f] hover:bg-[#0a6b52] gap-2">
            <FolderOpen className="w-4 h-4" />
            Nueva Categoría
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar categoría..." className="pl-10" />
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Orden</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Categoría</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Slug</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Servicios</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <tr key={cat.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-500 font-mono">{cat.sortOrder}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0d7a5f]/10 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-[#0d7a5f]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{cat.name}</p>
                          <p className="text-xs text-gray-500 max-w-xs truncate">{cat.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{cat.slug}</code>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {cat.servicesCount} servicios
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {cat.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#0d7a5f]">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
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
    </DashboardLayout>
  );
}
