import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const news = [
  {
    title: "ProjectHub lanza nueva plataforma para fabricantes sostenibles",
    date: "15 Feb 2024",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "La moda sostenible crece un 25% en Europa",
    date: "10 Feb 2024",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "Nuevas regulaciones de sostenibilidad en la UE",
    date: "5 Feb 2024",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "ProjectHub expande su red de fabricantes en Portugal",
    date: "1 Feb 2024",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "Tendencias de moda circular para 2024",
    date: "28 Ene 2024",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "Cómo las marcas están adoptando prácticas sostenibles",
    date: "20 Ene 2024",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
    slug: "#",
  },
];

export default function NoticiasPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f0f5f3] to-white py-12 md:py-16">
        <div className="container-custom mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a365d]">
            Noticias
          </h1>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <Card
                key={index}
                className="overflow-hidden rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-[200px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{item.date}</p>
                  <h3 className="text-xl font-bold text-[#1a365d] mb-4 line-clamp-2">
                    {item.title}
                  </h3>
                  <Link href={item.slug}>
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
