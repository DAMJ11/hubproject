"use client";

import { useState, useEffect } from "react";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Plus, Home, Building, Pencil, Trash2, Star, Check, Loader2 } from "lucide-react";

interface Address {
  id: number;
  label: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function AddressesPage() {
  const { user } = useDashboardUser();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    label: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "",
  });

  useEffect(() => {
    fetch("/api/dashboard/addresses")
      .then((r) => r.json())
      .then((data) => setAddresses(data.addresses ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  const getIcon = (label: string) => {
    if (label.toLowerCase().includes("oficina") || label.toLowerCase().includes("taller")) return Building;
    return Home;
  };

  const handleDeleteAddress = (addressId: number, label: string) => {
    const confirmed = window.confirm(`Vas a eliminar la direccion \"${label}\". Esta accion no se puede deshacer.\n\nDeseas continuar?`);
    if (!confirmed) return;

    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Direcciones</h1>
          <p className="text-gray-500 mt-1">Administra tus direcciones de env&iacute;o y entrega</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#2563eb] hover:bg-[#1d4ed8] gap-2">
          <Plus className="w-4 h-4" />
          Agregar Direcci&oacute;n
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Nueva Direcci&oacute;n</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta</label>
              <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="Ej: Taller, Oficina, Casa" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direcci&oacute;n Principal</label>
              <Input value={formData.address_line1} onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })} placeholder="Calle, Carrera, Avenida..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <Input value={formData.address_line2} onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })} placeholder="Apto, Torre, Piso (opcional)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Bogot&aacute;" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="Cundinamarca" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">C&oacute;digo Postal</label>
              <Input value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} placeholder="110221" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8]">Guardar Direcci&oacute;n</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map((addr) => {
          const Icon = getIcon(addr.label);
          return (
            <Card key={addr.id} className={`p-5 relative ${addr.is_default ? "ring-2 ring-[#2563eb]" : ""}`}>
              {addr.is_default && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#2563eb] text-white text-xs px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" /> Principal
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#2563eb]" />
                </div>
                <h3 className="font-semibold text-gray-900">{addr.label}</h3>
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span>
                    {addr.address_line1}
                    {addr.address_line2 && <>, {addr.address_line2}</>}
                  </span>
                </p>
                <p className="pl-6">{addr.city}, {addr.state}</p>
                {addr.postal_code && <p className="pl-6">CP: {addr.postal_code}</p>}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#2563eb] gap-1">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </Button>
                {!addr.is_default && (
                  <>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#2563eb] gap-1">
                      <Star className="w-3.5 h-3.5" /> Predeterminar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-red-600 gap-1 ml-auto"
                      aria-label={`Eliminar direccion ${addr.label}`}
                      onClick={() => handleDeleteAddress(addr.id, addr.label)}
                    >
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
  );
}

