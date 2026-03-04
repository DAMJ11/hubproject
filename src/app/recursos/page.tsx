import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const articles = [
  {
    title: "Costos De Iniciar Una Línea De Ropa.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "Cómo Encontrar El Fabricante De Sudaderas Con Capucha Perfecto",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "Cómo Encontrar Un Fabricante De Camisetas",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "30 Consejos Sobre Cómo Iniciar Una Línea De Ropa",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "Abastecimiento Local De Ropa.",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "¿Cómo Se Hace La Ropa?",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "¿Cómo Encontrar Fabricantes De Ropa Personalizada Para Startups?",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "¿Cómo Promocionar Una Línea De Ropa?",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "Organizar Sesión De Fotos",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop",
    slug: "#",
  },
];

export default function RecursosPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f0f5f3] to-white py-12 md:py-16">
        <div className="container-custom mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a365d]">
            Artículos
          </h1>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <Card
                key={index}
                className="overflow-hidden rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-[200px]">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#1a365d] mb-4 line-clamp-3">
                    {article.title}
                  </h3>
                  <Link href={article.slug}>
                    <Button
                      variant="outline"
                      className="rounded-full px-6 border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white"
                    >
                      Leer Más
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
