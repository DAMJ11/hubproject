"use client";

import { useState } from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Star,
  MapPin,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Booking {
  id: number;
  service: string;
  category: string;
  professional: string;
  professionalRating: number;
  client?: string;
  status: "pendiente" | "confirmada" | "en_progreso" | "completada" | "cancelada";
  date: string;
  time: string;
  address: string;
  price: string;
  notes?: string;
}

const mockBookings: Booking[] = [
  { id: 1, service: "Limpieza Profunda", category: "Aseo del Hogar", professional: "Carlos Méndez", professionalRating: 4.9, client: "María García", status: "en_progreso", date: "2025-03-18", time: "10:00 AM", address: "Cra 15 #82-30, Bogotá", price: "$120.000", notes: "Apartamento de 3 habitaciones" },
  { id: 2, service: "Poda de Jardín", category: "Jardinería", professional: "Ana Ruiz", professionalRating: 4.7, client: "Pedro López", status: "confirmada", date: "2025-03-18", time: "2:00 PM", address: "Cll 100 #15-20, Bogotá", price: "$85.000" },
  { id: 3, service: "Revisión Eléctrica", category: "Electricidad", professional: "Miguel Torres", professionalRating: 4.8, client: "Laura Sánchez", status: "pendiente", date: "2025-03-19", time: "9:00 AM", address: "Cra 7 #45-10, Bogotá", price: "$150.000", notes: "Revisión completa del cableado" },
  { id: 4, service: "Destape de Cañería", category: "Plomería", professional: "Diego Vargas", professionalRating: 4.6, client: "Juan Rodríguez", status: "completada", date: "2025-03-17", time: "3:00 PM", address: "Cll 72 #10-50, Bogotá", price: "$95.000" },
  { id: 5, service: "Pintura Interior", category: "Pintura", professional: "Rosa Martínez", professionalRating: 4.9, client: "Camila Torres", status: "cancelada", date: "2025-03-16", time: "8:00 AM", address: "Cra 11 #90-15, Bogotá", price: "$350.000" },
  { id: 6, service: "Mantenimiento A/C", category: "Aires Acondicionados", professional: "Felipe Herrera", professionalRating: 4.5, client: "Andrés Moreno", status: "confirmada", date: "2025-03-20", time: "11:00 AM", address: "Cll 50 #25-80, Bogotá", price: "$180.000" },
];

const statusConfig = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  confirmada: { label: "Confirmada", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  en_progreso: { label: "En Progreso", color: "bg-blue-100 text-blue-700", icon: CalendarCheck },
  completada: { label: "Completada", color: "bg-gray-100 text-gray-700", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-700", icon: XCircle },
};

const tabs = [
  { id: "todas", label: "Todas" },
  { id: "pendiente", label: "Pendientes" },
  { id: "confirmada", label: "Confirmadas" },
  { id: "en_progreso", label: "En Progreso" },
  { id: "completada", label: "Completadas" },
  { id: "cancelada", label: "Canceladas" },
];

export default function BookingsPanel() {
  const [activeTab, setActiveTab] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mockBookings.filter((b) => {
    const matchesTab = activeTab === "todas" || b.status === activeTab;
    const matchesSearch =
      b.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.professional.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.client && b.client.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500 mt-1">Gestiona todas las reservas de servicios</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-[#0d7a5f] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por servicio, profesional o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filtrar
        </Button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filtered.map((booking) => {
          const statusInfo = statusConfig[booking.status];
          const StatusIcon = statusInfo.icon;
          return (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{booking.service}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{booking.category}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Profesional:</span>
                        <span>{booking.professional}</span>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs">{booking.professionalRating}</span>
                        </div>
                      </div>
                      {booking.client && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-medium">Cliente:</span>
                          <span>{booking.client}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{booking.date} a las {booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.address}</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="mt-2 text-sm text-gray-500 italic">📝 {booking.notes}</p>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-gray-900">{booking.price}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-3 h-3 mr-1" /> Llamar
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-3 h-3 mr-1" /> Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CalendarCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No hay reservas</p>
            <p className="text-sm mt-1">No se encontraron reservas con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
