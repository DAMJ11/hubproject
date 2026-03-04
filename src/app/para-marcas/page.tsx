import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    icon: "https://ext.same-assets.com/1292233952/2736336818.png",
    title: "Crea Tu Proyecto",
    description:
      "Publique una solicitud de cotización para ponerse en contacto con los fabricantes.",
  },
  {
    icon: "https://ext.same-assets.com/1292233952/2052961348.png",
    title: "Chatea Y Compara",
    description:
      "Negocie en su propio idioma utilizando nuestro chat traducido en tiempo real.",
  },
  {
    icon: "https://ext.same-assets.com/1292233952/3200581809.png",
    title: "Iniciar Producción",
    description:
      "Ordene su colección utilizando nuestras herramientas seguras de pedido y pago.",
  },
];

const features = [
  {
    title: "Fabricantes Confiables",
    description:
      "Obtenga acceso a fabricantes fiables en Europa para su proyecto de moda sostenible, reduciendo significativamente sus gastos de abastecimiento y simplificando el proceso de adquisición.",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&h=400&fit=crop",
    reverse: false,
  },
  {
    title: "Menos Problemas, Más Coincidencias",
    description:
      "Sube tu proyecto y deja que fabricantes calificados vengan a ti, ahorrando tiempo en búsquedas interminables y teniendo la opción de explorar la red tú mismo.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    reverse: true,
  },
  {
    title: "Orientación Construida A Tu Medida",
    description:
      "Reciba orientación personalizada de nuestro equipo a través del chat en la plataforma. Una vez dentro, estaremos aquí para atender sus necesidades específicas y ayudarle a hacer realidad su proyecto.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    reverse: false,
  },
];

export default function ParaMarcasPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f0f5f3] to-white py-16 md:py-24">
        <div className="container-custom mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a365d] mb-6">
            Comienza Tu
            <br />
            Proyecto De Moda
            <br />
            Sostenible
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Abastézcase de manera eficaz y produzca de manera más sostenible.
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
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop"
              alt="Fashion design studio"
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
                Estás listo para producir tu moda de forma local y sostenible,
                ¡genial! Pero ahora mismo, encontrar al fabricante europeo
                perfecto para tu producto puede ser un verdadero lío. Puede que
                hayas estado navegando por internet, visitando ferias
                comerciales o incluso sumergiéndote en las redes sociales. Pero
                esos métodos pueden consumirte tiempo, vaciarte el bolsillo y,
                en el peor de los casos, llevarte a un fabricante decepcionante.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                Ahí es donde entramos nosotros: presentamos ProjectHub: la primera
                plataforma de abastecimiento sostenible de Europa. ¡Olvídate de
                los dolores de cabeza y dale la bienvenida a una forma súper
                sencilla de encontrar lo que necesitas!
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
              Observe cómo su idea cobra vida en unos sencillos pasos.
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

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a365d] mb-8 max-w-4xl mx-auto leading-tight">
            Empieza Un Viaje Sin Esfuerzo Hacia Un Mundo De La Moda Más
            Consciente
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://app.projecthub.com/register">
              <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                Explora Nuestra Plataforma
              </Button>
            </Link>
            <Button variant="link" className="text-[#1a365d] font-medium text-lg">
              Reservar Una Llamada
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
