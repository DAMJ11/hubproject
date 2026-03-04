import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "María García",
    role: "Cliente desde 2023",
    content: "Excelente servicio de limpieza. El profesional llegó puntual, fue muy detallista y dejó mi apartamento impecable. 100% recomendado.",
    rating: 5,
    service: "Limpieza Profunda",
  },
  {
    name: "Pedro López",
    role: "Cliente desde 2024",
    content: "Contraté el servicio de jardinería y quedé encantado. Ana hizo un trabajo increíble con mi jardín. Ya agendé el próximo mes.",
    rating: 5,
    service: "Jardinería",
  },
  {
    name: "Laura Sánchez",
    role: "Cliente desde 2023",
    content: "Tenía un problema eléctrico urgente y conseguí un profesional en menos de 2 horas. La plataforma es súper fácil de usar.",
    rating: 4,
    service: "Electricidad",
  },
  {
    name: "Juan Rodríguez",
    role: "Cliente desde 2024",
    content: "He usado TidyHubb para plomería y pintura. Ambos profesionales fueron excelentes. Los precios son justos y transparentes.",
    rating: 5,
    service: "Plomería",
  },
  {
    name: "Camila Torres",
    role: "Profesional desde 2023",
    content: "Soy pintora profesional y TidyHubb me ha conectado con muchos clientes. La plataforma me ayudó a duplicar mis ingresos.",
    rating: 5,
    service: "Pintora Profesional",
  },
  {
    name: "Carlos Méndez",
    role: "Profesional desde 2022",
    content: "Como profesional de limpieza, esta plataforma me da visibilidad y un flujo constante de clientes. Los pagos siempre son puntuales.",
    rating: 5,
    service: "Profesional de Limpieza",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonios" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a365d]">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Miles de clientes y profesionales confían en TidyHubb para sus servicios del hogar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-4">&ldquo;{t.content}&rdquo;</p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 bg-[#0d7a5f] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role} • {t.service}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
