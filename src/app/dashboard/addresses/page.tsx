"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Plus, Home, Building, Pencil, Trash2, Star, Check } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Address {
  id: number;
  label: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  { id: 1, label: "Casa", addressLine1: "Calle 85 #15-30", addressLine2: "Apto 502, Torre B", city: "Bogotá", state: "Cundinamarca", postalCode: "110221", isDefault: true },
  { id: 2, label: "Oficina", addressLine1: "Carrera 7 #71-21", addressLine2: "Oficina 1205", city: "Bogotá", state: "Cundinamarca", postalCode: "110231", isDefault: false },
  { id: 3, label: "Casa Mamá", addressLine1: "Calle 45 #23-10", addressLine2: "", city: "Medellín", state: "Antioquia", postalCode: "050012", isDefault: false },
];

export default function AddressesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    label: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
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

  const getIcon = (label: string) => {
    if (label.toLowerCase().includes("oficina")) return Building;
    return Home;
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Direcciones</h1>
            <p className="text-gray-500 mt-1">Administra tus direcciones de servicio</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#0d7a5f] hover:bg-[#0a6b52] gap-2">
            <Plus className="w-4 h-4" />
            Agregar Dirección
          </Button>
        </div>

        {showForm && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Nueva Dirección</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta</label>
                <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="Ej: Casa, Oficina, Casa Mamá" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Principal</label>
                <Input value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} placeholder="Calle, Carrera, Avenida..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                <Input value={formData.addressLine2} onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} placeholder="Apto, Torre, Piso (opcional)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Bogotá" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="Cundinamarca" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                <Input value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} placeholder="110221" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button className="bg-[#0d7a5f] hover:bg-[#0a6b52]">Guardar Dirección</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAddresses.map((addr) => {
            const Icon = getIcon(addr.label);
            return (
              <Card key={addr.id} className={`p-5 relative ${addr.isDefault ? "ring-2 ring-[#0d7a5f]" : ""}`}>
                {addr.isDefault && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#0d7a5f] text-white text-xs px-2 py-1 rounded-full">
                    <Check className="w-3 h-3" />
                    Principal
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#0d7a5f]" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{addr.label}</h3>
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>
                      {addr.addressLine1}
                      {addr.addressLine2 && <>, {addr.addressLine2}</>}
                    </span>
                  </p>
                  <p className="pl-6">{addr.city}, {addr.state}</p>
                  {addr.postalCode && <p className="pl-6">CP: {addr.postalCode}</p>}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#0d7a5f] gap-1">
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </Button>
                  {!addr.isDefault && (
                    <>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#0d7a5f] gap-1">
                        <Star className="w-3.5 h-3.5" /> Predeterminar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600 gap-1 ml-auto">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
