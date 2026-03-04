"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Star,
  MapPin,
  CheckCircle2,
  Phone,
  MessageSquare,
  UserCheck,
  Award,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Professional {
  id: number;
  name: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  completedJobs: number;
  location: string;
  verified: boolean;
  available: boolean;
  memberSince: string;
  avatar: string;
  bio: string;
  hourlyRate?: string;
}

const mockProfessionals: Professional[] = [
  {
    id: 1, name: "Carlos Méndez", specialties: ["Aseo del Hogar", "Limpieza Profunda"],
    rating: 4.9, totalReviews: 187, completedJobs: 312, location: "Bogotá, Chapinero",
    verified: true, available: true, memberSince: "2023", avatar: "CM",
    bio: "Profesional certificado con más de 5 años de experiencia en limpieza residencial y comercial.",
    hourlyRate: "$25.000/hr",
  },
  {
    id: 2, name: "Ana Ruiz", specialties: ["Jardinería", "Diseño de Jardines"],
    rating: 4.7, totalReviews: 143, completedJobs: 256, location: "Bogotá, Usaquén",
    verified: true, available: true, memberSince: "2022", avatar: "AR",
    bio: "Ingeniera agrónoma especializada en jardines urbanos y mantenimiento de zonas verdes.",
    hourlyRate: "$30.000/hr",
  },
  {
    id: 3, name: "Miguel Torres", specialties: ["Electricidad", "Instalaciones"],
    rating: 4.8, totalReviews: 98, completedJobs: 178, location: "Bogotá, Suba",
    verified: true, available: false, memberSince: "2023", avatar: "MT",
    bio: "Técnico electricista certificado CONTE. Especialista en instalaciones residenciales.",
    hourlyRate: "$35.000/hr",
  },
  {
    id: 4, name: "Diego Vargas", specialties: ["Plomería", "Instalación Sanitaria"],
    rating: 4.6, totalReviews: 156, completedJobs: 289, location: "Bogotá, Kennedy",
    verified: true, available: true, memberSince: "2021", avatar: "DV",
    bio: "Plomero profesional con experiencia en reparaciones y remodelaciones de baños y cocinas.",
    hourlyRate: "$28.000/hr",
  },
  {
    id: 5, name: "Rosa Martínez", specialties: ["Pintura", "Acabados"],
    rating: 4.9, totalReviews: 112, completedJobs: 198, location: "Bogotá, Teusaquillo",
    verified: true, available: true, memberSince: "2022", avatar: "RM",
    bio: "Pintora profesional con acabados de alta calidad. Especialista en pintura decorativa.",
    hourlyRate: "$32.000/hr",
  },
  {
    id: 6, name: "Felipe Herrera", specialties: ["Aires Acondicionados", "Refrigeración"],
    rating: 4.5, totalReviews: 89, completedJobs: 145, location: "Bogotá, Engativá",
    verified: false, available: true, memberSince: "2024", avatar: "FH",
    bio: "Técnico en refrigeración y aires acondicionados. Todas las marcas.",
    hourlyRate: "$30.000/hr",
  },
];

export default function ProfessionalsPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filtered = mockProfessionals.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerified = !showVerifiedOnly || p.verified;
    const matchesAvailable = !showAvailableOnly || p.available;
    return matchesSearch && matchesVerified && matchesAvailable;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profesionales</h1>
          <p className="text-gray-500 mt-1">Encuentra profesionales verificados para tus servicios</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, especialidad o ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showVerifiedOnly ? "default" : "outline"}
          onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
          className={`flex items-center gap-2 ${showVerifiedOnly ? "bg-[#0d7a5f] hover:bg-[#0a6b52]" : ""}`}
        >
          <CheckCircle2 className="w-4 h-4" /> Solo Verificados
        </Button>
        <Button
          variant={showAvailableOnly ? "default" : "outline"}
          onClick={() => setShowAvailableOnly(!showAvailableOnly)}
          className={`flex items-center gap-2 ${showAvailableOnly ? "bg-[#0d7a5f] hover:bg-[#0a6b52]" : ""}`}
        >
          <Calendar className="w-4 h-4" /> Disponibles Ahora
        </Button>
      </div>

      {/* Professionals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((pro) => (
          <Card key={pro.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 ${
                  pro.available ? "bg-[#0d7a5f]" : "bg-gray-400"
                }`}>
                  {pro.avatar}
                </div>

                <div className="flex-1">
                  {/* Name & Status */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{pro.name}</h3>
                    {pro.verified && (
                      <span className="flex items-center gap-1 text-blue-600 text-xs">
                        <CheckCircle2 className="w-4 h-4 fill-blue-100" /> Verificado
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium text-sm">{pro.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({pro.totalReviews} reseñas)</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{pro.completedJobs} trabajos</span>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {pro.specialties.map((spec) => (
                      <span key={spec} className="bg-[#0d7a5f]/10 text-[#0d7a5f] text-xs px-2 py-1 rounded-full font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 mt-3">{pro.bio}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {pro.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3" /> Desde {pro.memberSince}
                    </div>
                    {pro.hourlyRate && (
                      <span className="font-medium text-[#0d7a5f]">{pro.hourlyRate}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="bg-[#0d7a5f] hover:bg-[#0a6b52] text-white">
                      Reservar
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-3 h-3 mr-1" /> Mensaje
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="w-3 h-3 mr-1" /> Llamar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Availability indicator */}
              <div className={`mt-4 pt-3 border-t flex items-center gap-2 text-sm ${
                pro.available ? "text-green-600" : "text-gray-400"
              }`}>
                <div className={`w-2 h-2 rounded-full ${pro.available ? "bg-green-500" : "bg-gray-300"}`} />
                {pro.available ? "Disponible ahora" : "No disponible"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No hay profesionales</p>
          <p className="text-sm mt-1">No se encontraron profesionales con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
