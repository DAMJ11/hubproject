import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Recycle, Globe, Heart, Shield, Users } from "lucide-react";

const pillars = [
  {
    icon: Leaf,
    title: "Producción Ética",
    description:
      "Trabajamos exclusivamente con fabricantes que cumplen estándares éticos de producción, garantizando condiciones laborales justas.",
  },
  {
    icon: Recycle,
    title: "Economía Circular",
    description:
      "Promovemos prácticas de economía circular, desde el diseño hasta el fin de vida del producto.",
  },
  {
    icon: Globe,
    title: "Reducción De Huella",
    description:
      "Fomentamos la producción local para reducir la huella de carbono del transporte.",
  },
  {
    icon: Heart,
    title: "Materiales Sostenibles",
    description:
      "Incentivamos el uso de materiales orgánicos, reciclados y de bajo impacto ambiental.",
  },
  {
    icon: Shield,
    title: "Transparencia Total",
    description:
      "Exigimos transparencia en toda la cadena de suministro de nuestros socios.",
  },
  {
    icon: Users,
    title: "Comunidad Responsable",
    description:
      "Construimos una comunidad de marcas y fabricantes comprometidos con el cambio.",
  },
];

export default function PoliticaSostenibilidadPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f0f5f3] to-white py-16 md:py-24">
        <div className="container-custom mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-[#1a365d]">
                Política De Sostenibilidad
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                En ProjectHub, la sostenibilidad no es solo una palabra de moda, es
                el núcleo de todo lo que hacemos. Nuestra política de
                sostenibilidad guía cada decisión que tomamos y cada socio con
                el que trabajamos.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Estamos comprometidos a transformar la industria de la moda
                hacia un modelo más responsable, ético y respetuoso con el medio
                ambiente.
              </p>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop"
                alt="Sostenibilidad"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] text-center mb-4">
            Nuestros Pilares De Sostenibilidad
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Estos son los principios fundamentales que guían nuestro compromiso
            con la sostenibilidad.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <Card
                key={index}
                className="p-6 rounded-2xl hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-[#0d7a5f]/10 rounded-xl flex items-center justify-center mb-6">
                    <pillar.icon className="w-8 h-8 text-[#0d7a5f]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a365d] mb-4">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-600">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-16 md:py-24 bg-[#0d6c5d]">
        <div className="container-custom mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Nuestro Compromiso
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
            Nos comprometemos a verificar rigurosamente a cada fabricante en
            nuestra plataforma, asegurándonos de que cumplan con nuestros
            estándares de sostenibilidad. Solo trabajamos con socios que
            compartan nuestra visión de una industria de la moda más
            responsable.
          </p>
          <Link href="https://app.projecthub.com/register">
            <Button className="bg-white text-[#0d6c5d] hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-medium">
              Únete A Nuestro Movimiento
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-8">
            ¿Quieres Saber Más Sobre Nuestra Política?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contacto">
              <Button className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium">
                Contactar
              </Button>
            </Link>
            <Link href="https://app.projecthub.com/register">
              <Button
                variant="outline"
                className="border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white rounded-full px-8 py-6 text-lg font-medium"
              >
                Crear Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
