import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, Shield, Clock } from "lucide-react";

const highlights = [
  { icon: CheckCircle2, text: "Profesionales verificados" },
  { icon: Star, text: "Calificación promedio 4.8/5" },
  { icon: Shield, text: "Garantía de satisfacción" },
  { icon: Clock, text: "Disponible 7 días a la semana" },
];

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#2563eb]/10 text-[#2563eb] rounded-full px-4 py-2 text-sm font-medium mb-6">
              <span>🏠</span> Tu hogar, nuestro cuidado
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-[#1a365d] leading-tight">
              Profesionales de confianza para tu{" "}
              <span className="text-[#2563eb]">hogar</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-lg">
              TidyHubb es tu plataforma de confianza para reservar profesionales
              calificados y verificados para el mantenimiento y aseo de tu hogar,
              bajo demanda.
            </p>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-gray-700">
                    <Icon className="w-5 h-5 text-[#2563eb]" />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-10">
              <Link href="/register">
                <Button size="lg" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-8 h-12 text-base">
                  Reservar Servicio
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button size="lg" variant="outline" className="rounded-lg px-8 h-12 text-base border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb]/5">
                  ¿Cómo Funciona?
                </Button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1a365d]">10K+</p>
                <p className="text-xs text-gray-500">Servicios completados</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1a365d]">500+</p>
                <p className="text-xs text-gray-500">Profesionales activos</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1a365d]">4.8</p>
                <p className="text-xs text-gray-500">Calificación promedio</p>
              </div>
            </div>
          </div>

          {/* Right - Service Cards Preview */}
          <div className="hidden lg:block relative">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🧹", name: "Aseo del Hogar", desc: "Limpieza profesional", color: "bg-blue-50 border-blue-100" },
                { icon: "🌿", name: "Jardinería", desc: "Cuidado de jardines", color: "bg-green-50 border-green-100" },
                { icon: "🔧", name: "Plomería", desc: "Reparaciones rápidas", color: "bg-orange-50 border-orange-100" },
                { icon: "⚡", name: "Electricidad", desc: "Instalaciones seguras", color: "bg-yellow-50 border-yellow-100" },
                { icon: "🎨", name: "Pintura", desc: "Acabados profesionales", color: "bg-purple-50 border-purple-100" },
                { icon: "❄️", name: "Aires A/C", desc: "Mantenimiento completo", color: "bg-cyan-50 border-cyan-100" },
              ].map((service) => (
                <div key={service.name} className={`${service.color} border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer`}>
                  <span className="text-3xl">{service.icon}</span>
                  <h3 className="font-semibold text-gray-900 mt-3">{service.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

