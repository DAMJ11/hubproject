"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Star,
  Clock,
  Grid3X3,
  List,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  basePrice: string;
  duration: string;
  rating: number;
  totalReviews: number;
  icon: string;
  popular: boolean;
}

const mockServices: Service[] = [
  { id: 1, name: "Limpieza General", category: "Aseo del Hogar", description: "Limpieza completa de todos los espacios de tu hogar incluyendo baños, cocina y habitaciones.", basePrice: "$60.000", duration: "3-4 horas", rating: 4.8, totalReviews: 245, icon: "🧹", popular: true },
  { id: 2, name: "Limpieza Profunda", category: "Aseo del Hogar", description: "Limpieza exhaustiva con desinfección, incluye ventanas, electrodomésticos y áreas difíciles.", basePrice: "$120.000", duration: "5-6 horas", rating: 4.9, totalReviews: 189, icon: "✨", popular: true },
  { id: 3, name: "Jardinería General", category: "Jardinería", description: "Mantenimiento de jardín: corte de césped, poda de arbustos y limpieza de áreas verdes.", basePrice: "$70.000", duration: "2-3 horas", rating: 4.7, totalReviews: 156, icon: "🌿", popular: true },
  { id: 4, name: "Diseño de Jardín", category: "Jardinería", description: "Diseño y creación de jardines personalizados con plantas ornamentales.", basePrice: "$250.000", duration: "1 día", rating: 4.6, totalReviews: 67, icon: "🌺", popular: false },
  { id: 5, name: "Reparación de Tuberías", category: "Plomería", description: "Reparación de fugas, destape de cañerías y mantenimiento general de tuberías.", basePrice: "$80.000", duration: "1-2 horas", rating: 4.5, totalReviews: 198, icon: "🔧", popular: true },
  { id: 6, name: "Instalación Sanitaria", category: "Plomería", description: "Instalación de grifos, inodoros, lavamanos y otros accesorios sanitarios.", basePrice: "$120.000", duration: "2-3 horas", rating: 4.4, totalReviews: 89, icon: "🚿", popular: false },
  { id: 7, name: "Revisión Eléctrica", category: "Electricidad", description: "Diagnóstico completo del sistema eléctrico del hogar con reporte detallado.", basePrice: "$90.000", duration: "2-3 horas", rating: 4.8, totalReviews: 134, icon: "⚡", popular: true },
  { id: 8, name: "Instalación de Tomacorrientes", category: "Electricidad", description: "Instalación y reparación de tomacorrientes, interruptores y puntos eléctricos.", basePrice: "$60.000", duration: "1-2 horas", rating: 4.6, totalReviews: 78, icon: "🔌", popular: false },
  { id: 9, name: "Pintura Interior", category: "Pintura", description: "Pintura de paredes interiores con preparación de superficie y acabados profesionales.", basePrice: "$180.000", duration: "1-2 días", rating: 4.7, totalReviews: 112, icon: "🎨", popular: true },
  { id: 10, name: "Cerrajería de Emergencia", category: "Cerrajería", description: "Apertura de puertas, cambio de cerraduras y copias de llaves.", basePrice: "$50.000", duration: "30 min - 1 hora", rating: 4.3, totalReviews: 201, icon: "🔑", popular: false },
  { id: 11, name: "Fumigación General", category: "Fumigación", description: "Control de plagas completo para todo tipo de insectos y roedores.", basePrice: "$150.000", duration: "2-3 horas", rating: 4.5, totalReviews: 167, icon: "🦟", popular: true },
  { id: 12, name: "Mantenimiento de A/C", category: "Aires Acondicionados", description: "Limpieza, recarga de gas y mantenimiento preventivo de aires acondicionados.", basePrice: "$100.000", duration: "1-2 horas", rating: 4.6, totalReviews: 143, icon: "❄️", popular: true },
];

const categories = ["Todas", "Aseo del Hogar", "Jardinería", "Plomería", "Electricidad", "Pintura", "Cerrajería", "Fumigación", "Aires Acondicionados"];

export default function ServicesPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = mockServices.filter((s) => {
    const matchesCat = selectedCategory === "Todas" || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-500 mt-1">Explora todos los servicios disponibles para tu hogar</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-[#0d7a5f] hover:bg-[#0a6b52]" : ""}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-[#0d7a5f] hover:bg-[#0a6b52]" : ""}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filtrar
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-[#0d7a5f] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{service.icon}</div>
                  {service.popular && (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#0d7a5f] transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{service.category}</p>
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{service.description}</p>

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-700">{service.rating}</span>
                    <span>({service.totalReviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div>
                    <span className="text-xs text-gray-500">Desde</span>
                    <p className="text-lg font-bold text-[#0d7a5f]">{service.basePrice}</p>
                  </div>
                  <Link href={`/dashboard/services/${service.id}`}>
                    <Button size="sm" className="bg-[#0d7a5f] hover:bg-[#0a6b52] text-white">
                      Reservar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="text-4xl">{service.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                    <span className="text-sm text-gray-500">{service.category}</span>
                    {service.popular && (
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">Popular</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{service.rating} ({service.totalReviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Desde</span>
                  <p className="text-lg font-bold text-[#0d7a5f]">{service.basePrice}</p>
                  <Link href={`/dashboard/services/${service.id}`}>
                    <Button size="sm" className="mt-2 bg-[#0d7a5f] hover:bg-[#0a6b52] text-white">
                      Reservar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No hay servicios</p>
          <p className="text-sm mt-1">No se encontraron servicios con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
