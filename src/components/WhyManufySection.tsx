import { CheckCircle2, Users, Shield, Clock, Sparkles, CreditCard } from "lucide-react";

const reasons = [
  {
    icon: CheckCircle2,
    title: "Profesionales Verificados",
    description: "Cada profesional pasa por un riguroso proceso de verificación de identidad, antecedentes y habilidades.",
  },
  {
    icon: Shield,
    title: "Garantía de Satisfacción",
    description: "Si no estás satisfecho con el servicio, te lo repetimos sin costo adicional o te devolvemos tu dinero.",
  },
  {
    icon: Clock,
    title: "Servicio bajo Demanda",
    description: "Reserva servicios cuando los necesites, disponible los 7 días de la semana con horarios flexibles.",
  },
  {
    icon: CreditCard,
    title: "Pagos Seguros",
    description: "Tu pago está protegido. Solo se cobra cuando el servicio ha sido completado a tu satisfacción.",
  },
  {
    icon: Users,
    title: "Comunidad Confiable",
    description: "Sistema de reseñas transparente para que elijas al mejor profesional con base en experiencias reales.",
  },
  {
    icon: Sparkles,
    title: "Calidad Premium",
    description: "Nuestros profesionales usan productos y herramientas de alta calidad para resultados excepcionales.",
  },
];

export default function WhyManufySection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a365d]">
            ¿Por qué elegir TidyHubb?
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Somos la plataforma líder en servicios para el hogar con los estándares más altos de calidad y confianza.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div key={reason.title} className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-[#2563eb]/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 text-[#2563eb]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1a365d] mb-3">{reason.title}</h3>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

