import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserCheck, Shield, Award } from "lucide-react";

export default function CTASection() {
  return (
    <section id="profesionales" className="py-20 bg-[#0d7a5f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
              ¿Eres profesional? Únete a nuestra red
            </h2>
            <p className="mt-6 text-lg text-white/80">
              Conéctate con miles de clientes que buscan tus servicios. Aumenta tus ingresos
              trabajando con horarios flexibles y recibe pagos seguros.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: UserCheck, text: "Acceso a una amplia base de clientes" },
                { icon: Shield, text: "Pagos protegidos y garantizados" },
                { icon: Award, text: "Soporte y capacitación continua" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-white/90">{item.text}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-10">
              <Link href="/register">
                <Button size="lg" className="bg-white text-[#0d7a5f] hover:bg-gray-100 rounded-lg px-8 h-12">
                  Registrarme como Profesional
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: "$2.5M+", label: "Pagados a profesionales" },
              { value: "500+", label: "Profesionales activos" },
              { value: "98%", label: "Tasa de satisfacción" },
              { value: "24h", label: "Tiempo promedio de pago" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
