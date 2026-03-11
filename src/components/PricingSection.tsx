import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    name: "Básico",
    price: "Gratis",
    period: "",
    description: "Perfecto para empezar a usar TidyHubb",
    features: [
      "Hasta 3 reservas al mes",
      "Acceso al catálogo completo",
      "Mensajes con profesionales",
      "Soporte por email",
    ],
    cta: "Comenzar Gratis",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$29.900",
    period: "/mes",
    description: "Para usuarios frecuentes que quieren más beneficios",
    features: [
      "Reservas ilimitadas",
      "Profesionales premium verificados",
      "Prioridad en asignación",
      "Descuentos exclusivos (10%)",
      "Soporte prioritario 24/7",
      "Sin comisión por reserva",
    ],
    cta: "Elegir Premium",
    highlighted: true,
  },
  {
    name: "Empresarial",
    price: "Personalizado",
    period: "",
    description: "Para empresas y administradores de propiedad",
    features: [
      "Todo lo de Premium",
      "Múltiples propiedades",
      "Panel administrativo dedicado",
      "Facturación consolidada",
      "Account manager dedicado",
      "API de integración",
    ],
    cta: "Contactar Ventas",
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section id="precios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a365d]">
            Planes y Precios
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. Puedes cambiar o cancelar en cualquier momento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-[#2563eb] text-white ring-4 ring-[#2563eb]/20 scale-105"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium mb-4">
                  Más Popular
                </span>
              )}
              <h3 className={`text-xl font-bold ${plan.highlighted ? "text-white" : "text-[#1a365d]"}`}>
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-[#1a365d]"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={plan.highlighted ? "text-white/70" : "text-gray-500"}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={`mt-3 text-sm ${plan.highlighted ? "text-white/80" : "text-gray-600"}`}>
                {plan.description}
              </p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? "text-white" : "text-[#2563eb]"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/register">
                  <Button
                    className={`w-full h-12 rounded-lg font-medium ${
                      plan.highlighted
                        ? "bg-white text-[#2563eb] hover:bg-gray-100"
                        : "bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

