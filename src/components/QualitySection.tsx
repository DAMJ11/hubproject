import { Star } from "lucide-react";

const services = [
  { icon: "🧹", name: "Aseo del Hogar", desc: "Limpieza general, profunda y organización de espacios.", price: "Desde $60.000", popular: true },
  { icon: "🌿", name: "Jardinería", desc: "Corte de césped, poda, diseño de jardines.", price: "Desde $70.000", popular: true },
  { icon: "🔧", name: "Plomería", desc: "Reparaciones, destapes e instalaciones sanitarias.", price: "Desde $80.000", popular: true },
  { icon: "⚡", name: "Electricidad", desc: "Revisión, instalación y reparaciones eléctricas.", price: "Desde $90.000", popular: false },
  { icon: "🎨", name: "Pintura", desc: "Pintura interior y exterior con acabados premium.", price: "Desde $180.000", popular: true },
  { icon: "🔑", name: "Cerrajería", desc: "Apertura, cambio de cerraduras, copias de llaves.", price: "Desde $50.000", popular: false },
  { icon: "🦟", name: "Fumigación", desc: "Control de plagas para todo tipo de insectos.", price: "Desde $150.000", popular: false },
  { icon: "🪚", name: "Carpintería", desc: "Reparación de muebles, puertas y acabados.", price: "Desde $100.000", popular: false },
  { icon: "❄️", name: "Aires A/C", desc: "Instalación, limpieza y recarga de gas.", price: "Desde $100.000", popular: true },
  { icon: "🚚", name: "Mudanzas", desc: "Embalaje, transporte y descargue seguro.", price: "Desde $200.000", popular: false },
];

export default function QualitySection() {
  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a365d]">
            Nuestros Servicios
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Ofrecemos una amplia gama de servicios profesionales para mantener tu hogar en perfectas condiciones.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="relative bg-gray-50 border border-gray-100 rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group"
            >
              {service.popular && (
                <span className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Popular
                </span>
              )}
              <span className="text-4xl block mb-3">{service.icon}</span>
              <h3 className="font-semibold text-[#1a365d] text-sm group-hover:text-[#0d7a5f] transition-colors">
                {service.name}
              </h3>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{service.desc}</p>
              <p className="text-sm font-bold text-[#0d7a5f] mt-3">{service.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
