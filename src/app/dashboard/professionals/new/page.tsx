"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Briefcase, Star, FileText } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const serviceOptions = [
  "Limpieza General", "Limpieza Profunda", "Limpieza de Oficina", "Lavado de Tapicería",
  "Poda de Jardín", "Mantenimiento de Jardín", "Diseño de Jardín",
  "Reparación de Fugas", "Destape de Cañerías", "Instalación Sanitaria",
  "Revisión Eléctrica", "Instalación de Tomas", "Reparación Eléctrica",
  "Pintura Interior", "Pintura Exterior",
  "Apertura de Puertas", "Cambio de Cerradura",
  "Fumigación Residencial", "Control de Roedores",
  "Reparación de Muebles", "Muebles a Medida",
  "Mantenimiento A/C", "Instalación A/C",
  "Mudanza Local", "Mudanza Pequeña",
];

export default function NewProfessionalPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    bio: "",
    experienceYears: "",
    hourlyRate: "",
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

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST to /api/professionals
    router.push("/dashboard/professionals");
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registrar Profesional</h1>
            <p className="text-gray-500 mt-1">Agrega un nuevo profesional a la plataforma</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#0d7a5f]" />
              Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="pl-10" placeholder="Nombre" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="pl-10" placeholder="Apellido" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10" placeholder="profesional@email.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10" placeholder="+57 300 000 0000" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="pl-10" placeholder="Bogotá" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Años de Experiencia</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="number" value={formData.experienceYears} onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="pl-10" placeholder="5" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa por Hora (COP)</label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="number" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="pl-10" placeholder="25000" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full border rounded-md p-3 text-sm h-24 resize-none focus:ring-2 focus:ring-[#0d7a5f] focus:border-[#0d7a5f] outline-none"
                  placeholder="Describe la experiencia y habilidades del profesional..." />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0d7a5f]" />
              Servicios que Ofrece
            </h3>
            <p className="text-sm text-gray-500 mb-4">Selecciona los servicios que este profesional puede realizar</p>
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map((service) => (
                <button key={service} type="button" onClick={() => toggleService(service)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedServices.includes(service)
                      ? "bg-[#0d7a5f] text-white border-[#0d7a5f]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#0d7a5f]"
                  }`}>
                  {service}
                </button>
              ))}
            </div>
            {selectedServices.length > 0 && (
              <p className="text-sm text-[#0d7a5f] mt-3 font-medium">{selectedServices.length} servicios seleccionados</p>
            )}
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" className="bg-[#0d7a5f] hover:bg-[#0a6b52] gap-2">
              <Save className="w-4 h-4" />
              Registrar Profesional
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
