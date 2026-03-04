"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Sparkles, DollarSign, Clock, FileText, Tag, Image } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const categories = [
  { id: 1, name: "Aseo del Hogar" },
  { id: 2, name: "Jardinería" },
  { id: 3, name: "Plomería" },
  { id: 4, name: "Electricidad" },
  { id: 5, name: "Pintura" },
  { id: 6, name: "Cerrajería" },
  { id: 7, name: "Fumigación" },
  { id: 8, name: "Carpintería" },
  { id: 9, name: "Aires Acondicionados" },
  { id: 10, name: "Mudanzas" },
];

export default function NewServicePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    shortDescription: "",
    basePrice: "",
    priceUnit: "session",
    estimatedDuration: "",
    isFeatured: false,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST to /api/services
    router.push("/dashboard/services");
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Servicio</h1>
            <p className="text-gray-500 mt-1">Agrega un nuevo servicio a la plataforma</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0d7a5f]" />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio *</label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10" placeholder="Ej: Limpieza General" required />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full border rounded-md h-10 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#0d7a5f] focus:border-[#0d7a5f] outline-none" required>
                    <option value="">Selecciona una categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Corta *</label>
                <Input value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Breve descripción para tarjetas (máx 100 caracteres)" maxLength={100} required />
                <p className="text-xs text-gray-400 mt-1">{formData.shortDescription.length}/100</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Completa</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-md p-3 text-sm h-24 resize-none focus:ring-2 focus:ring-[#0d7a5f] focus:border-[#0d7a5f] outline-none"
                  placeholder="Describe detalladamente el servicio..." />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#0d7a5f]" />
              Precio y Duración
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base (COP) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="number" value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="pl-10" placeholder="80000" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Precio *</label>
                <select value={formData.priceUnit} onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                  className="w-full border rounded-md h-10 px-3 text-sm focus:ring-2 focus:ring-[#0d7a5f] focus:border-[#0d7a5f] outline-none">
                  <option value="session">Por sesión</option>
                  <option value="hour">Por hora</option>
                  <option value="sqm">Por m²</option>
                  <option value="fixed">Precio fijo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración Estimada (min)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="number" value={formData.estimatedDuration} onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    className="pl-10" placeholder="120" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-[#0d7a5f]" />
              Imagen y Opciones
            </h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-[#0d7a5f] transition-colors cursor-pointer">
                <Image className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Arrastra una imagen o haz clic para seleccionar</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 2MB</p>
              </div>
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={formData.isFeatured} onChange={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                  className="w-5 h-5 rounded text-[#0d7a5f] focus:ring-[#0d7a5f]" />
                <div>
                  <p className="font-medium text-sm">Servicio Destacado</p>
                  <p className="text-xs text-gray-500">Aparecerá en la página principal con un badge especial</p>
                </div>
              </label>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" className="bg-[#0d7a5f] hover:bg-[#0a6b52] gap-2">
              <Save className="w-4 h-4" />
              Crear Servicio
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
