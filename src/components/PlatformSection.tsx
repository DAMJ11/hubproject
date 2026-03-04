import { Search, CalendarCheck, Star, Shield } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Busca el servicio",
    description: "Explora nuestro catálogo de servicios para el hogar y encuentra exactamente lo que necesitas.",
  },
  {
    step: "02",
    icon: CalendarCheck,
    title: "Reserva en línea",
    description: "Elige fecha, hora y profesional. Confirma tu reserva en segundos con pago seguro.",
  },
  {
    step: "03",
    icon: Shield,
    title: "Recibe al profesional",
    description: "Un profesional verificado llegará a tu puerta en la fecha y hora acordadas.",
  },
  {
    step: "04",
    icon: Star,
    title: "Califica el servicio",
    description: "Después del servicio, califica y deja tu reseña para ayudar a otros usuarios.",
  },
];

export default function PlatformSection() {
  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a365d]">
            ¿Cómo funciona TidyHubb?
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Reservar un servicio profesional para tu hogar es fácil, rápido y seguro.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-[#0d7a5f]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0d7a5f] transition-colors">
                    <Icon className="w-10 h-10 text-[#0d7a5f] group-hover:text-white transition-colors" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-[#0d7a5f] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#1a365d] mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
