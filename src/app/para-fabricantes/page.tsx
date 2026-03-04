import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    icon: "https://ext.same-assets.com/1292233952/2736336818.png",
    title: "Encuentra Nuevos Clientes Potenciales",
    description:
      "Reciba actualizaciones sobre las últimas RFQ en sus categorías de producción.",
  },
  {
    icon: "https://ext.same-assets.com/1292233952/2052961348.png",
    title: "Chatear Y Negociar",
    description:
      "Negocie en su propio idioma utilizando nuestro chat traducido en tiempo real.",
  },
  {
    icon: "https://ext.same-assets.com/1292233952/3200581809.png",
    title: "Iniciar Producción",
    description:
      "Cierre un trato y comience a producir para el cliente potencial recién encontrado.",
  },
];

const features = [
  {
    title: "Precios Justos Para La Sostenibilidad",
    description:
      "La fabricación sostenible no puede igualar los precios a los que están acostumbradas las marcas en el ámbito de la moda rápida. Tenemos la misión de educar a las marcas sobre el verdadero valor de los productos sostenibles para garantizar que reciba una compensación justa por su compromiso con la sostenibilidad.",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=400&fit=crop",
    reverse: false,
  },
  {
    title: "Disponible En Tu Idioma",
    description:
      "Chatea, negocia y gestiona fácilmente a tus clientes en nuestra plataforma, todo en tu idioma preferido. Con nuestras prácticas herramientas de traducción, comunicarte con clientes de toda Europa es pan comido.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    reverse: true,
  },
  {
    title: "Apoye El Crecimiento De Su Negocio Sostenible",
    description:
      "¡Te cubrimos! Puede confiar en nuestra experiencia y apoyo en cada paso del camino. Ya sea para encontrar los clientes potenciales adecuados o mejorar la sostenibilidad de su negocio, estamos aquí para ayudarlo.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    reverse: false,
  },
];

const pricingPlans = [
  {
    name: "BÁSICO",
    price: "49",
    description: "Ideal para socios de la cadena de suministro que buscan comenzar.",
    highlighted: false,
  },
  {
    name: "CRECIMIENTO",
    price: "79",
    description: "La opción preferida por los socios de la cadena de suministro establecidos.",
    highlighted: true,
  },
  {
    name: "PROFESIONAL",
    price: "99",
    description: "Experiencia única diseñada para empresas más grandes listas para nuevos clientes potenciales.",
    highlighted: false,
  },
];

export default function ParaFabricantesPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f0f5f3] to-white py-16 md:py-24">
        <div className="container-custom mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a365d] mb-6">
            Encuentre Nuevos
            <br />
            Clientes Potenciales
            <br />
            Y Haga Crecer
            <br />
            Su Negocio
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Hazte visible para las marcas en toda Europa.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://app.projecthub.com/register">
              <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                Únete Ahora
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white rounded-full px-8 py-6 text-lg font-medium"
            >
              Aprende Más
            </Button>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <Image
              src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=500&fit=crop"
              alt="Manufacturing workshop"
              width={800}
              height={500}
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] leading-tight">
                La Primera
                <br />
                Plataforma De
                <br />
                Abastecimiento
                <br />
                Sostenible De
                <br />
                Europa
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Te encanta crear productos de calidad, no pasar horas intentando
                conseguir a tu próximo cliente. Pero entre ferias, correos
                electrónicos no solicitados y el caos de las redes sociales, es
                fácil agotarse incluso antes de cerrar una venta.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                Por eso creamos ProjectHub, la primera plataforma de abastecimiento
                sostenible de Europa. Te conectamos con una comunidad de marcas
                sostenibles que buscan activamente socios como tú para que
                puedas impulsar tu negocio sin estrés.
              </p>
              <Link href="https://app.projecthub.com/register">
                <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                  Únete Ahora
                </Button>
              </Link>
            </div>
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop"
                alt="Platform preview"
                width={600}
                height={400}
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-[#0d6c5d]">
        <div className="container-custom mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Crear Moda De Forma Fácil
            </h2>
            <p className="text-white/80 text-lg">
              Ayude a su próximo cliente en unos sencillos pasos.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <Image
                      src={step.icon}
                      alt={step.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a365d] mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4 space-y-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                feature.reverse ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div
                className={`space-y-4 ${feature.reverse ? "lg:order-2" : ""}`}
              >
                <h3 className="text-2xl md:text-3xl font-bold text-[#1a365d]">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
              <div className={feature.reverse ? "lg:order-1" : ""}>
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] mb-4">
              Precios Para Fabricantes
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              Ofrecemos paquetes para diferentes capacidades de producción.
            </p>
            <Button
              variant="outline"
              className="rounded-full px-8 py-6 border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white"
            >
              Ver Comparación Completa
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                  plan.highlighted
                    ? "border-2 border-[#0d7a5f] shadow-xl"
                    : "border shadow-lg"
                }`}
              >
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <svg
                      className="w-12 h-12"
                      viewBox="0 0 40 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 5L35 15V30L20 40L5 30V15L20 5Z"
                        fill={plan.highlighted ? "#0d7a5f" : "#1a365d"}
                      />
                      <path
                        d="M20 12L28 17V27L20 32L12 27V17L20 12Z"
                        fill="white"
                      />
                      <path
                        d="M20 18L24 21V27L20 30L16 27V21L20 18Z"
                        fill={plan.highlighted ? "#0d7a5f" : "#1a365d"}
                      />
                    </svg>
                  </div>

                  <h3 className="text-sm font-bold tracking-wider text-gray-500 mb-4">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-4xl font-bold text-[#0d7a5f]">
                      {plan.price}
                    </span>
                    <span className="text-xl text-[#0d7a5f] ml-1">€</span>
                    <span className="text-gray-600 ml-1">/mes</span>
                  </div>

                  <p className="text-gray-600 mb-6 min-h-[48px]">
                    {plan.description}
                  </p>

                  <Button
                    variant="outline"
                    className={`rounded-full px-8 py-6 w-full font-medium transition-all ${
                      plan.highlighted
                        ? "border-2 border-[#0d7a5f] text-[#0d7a5f] hover:bg-[#0d7a5f] hover:text-white"
                        : "border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white"
                    }`}
                  >
                    Aprende Más
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-[#f8f8f8]">
        <div className="container-custom mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d]">
                  ¿Listo Para Empezar?
                </h2>
                <p className="text-gray-600 text-lg">
                  ¡Crea una cuenta y sumérgete en tu próxima aventura de moda
                  sostenible!
                </p>
              </div>
              <Link href="https://app.projecthub.com/register">
                <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium whitespace-nowrap">
                  Crear Una Cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
