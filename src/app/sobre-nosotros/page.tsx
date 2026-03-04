import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const values = [
  {
    title: "Sostenibilidad",
    description: "Creemos en un futuro donde la moda y el medio ambiente coexistan en armonía.",
  },
  {
    title: "Transparencia",
    description: "Fomentamos la transparencia en toda la cadena de suministro.",
  },
  {
    title: "Colaboración",
    description: "Conectamos marcas y fabricantes para crear relaciones duraderas.",
  },
  {
    title: "Innovación",
    description: "Utilizamos tecnología para simplificar procesos complejos.",
  },
];

export default function SobreNosotrosPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f0f5f3] to-white py-16 md:py-24">
        <div className="container-custom mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-[#1a365d]">
                Sobre Nosotros
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                ProjectHub es la primera plataforma de abastecimiento sostenible B2B
                de Europa. Nuestra misión es hacer que la moda sostenible sea
                accesible para todas las marcas, conectándolas con fabricantes
                europeos comprometidos con prácticas éticas y ambientales.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Fundada con la visión de transformar la industria de la moda,
                trabajamos cada día para crear un ecosistema donde la
                sostenibilidad sea la norma, no la excepción.
              </p>
              <Link href="https://app.projecthub.com/register">
                <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                  Únete A Nosotros
                </Button>
              </Link>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                alt="Equipo ProjectHub"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] mb-8">
            Nuestra Misión
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Simplificar el proceso de producción de moda sostenible, conectando
            marcas con los mejores fabricantes europeos y proporcionando las
            herramientas necesarias para crear colecciones conscientes y éticas.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-[#f8f8f8]">
        <div className="container-custom mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] text-center mb-12">
            Nuestros Valores
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <h3 className="text-xl font-bold text-[#1a365d] mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-8">
            ¿Listo Para Unirte A La Revolución De La Moda Sostenible?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://app.manufy.com/register">
              <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                Crear Una Cuenta
              </Button>
            </Link>
            <Link href="/contacto">
              <Button
                variant="outline"
                className="border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white rounded-full px-8 py-6 text-lg font-medium"
              >
                Contactar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
