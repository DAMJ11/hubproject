import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const posts = [
  {
    title: "5 Pasos para crear una marca de moda sostenible",
    excerpt: "Descubre cómo iniciar tu marca de moda con prácticas sostenibles desde el día uno.",
    date: "15 Feb 2024",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "El futuro de la moda circular",
    excerpt: "La economía circular está transformando la industria de la moda. Aquí te contamos cómo.",
    date: "10 Feb 2024",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "Certificaciones sostenibles que debes conocer",
    excerpt: "Una guía completa sobre las certificaciones más importantes en moda sostenible.",
    date: "5 Feb 2024",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "Materiales sostenibles para tu colección",
    excerpt: "Explora los materiales más innovadores y ecológicos para tu próxima colección.",
    date: "1 Feb 2024",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "Cómo comunicar la sostenibilidad de tu marca",
    excerpt: "Estrategias efectivas para transmitir tus valores sostenibles a tus clientes.",
    date: "28 Ene 2024",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&fit=crop",
    slug: "#",
  },
  {
    title: "Tendencias de moda ética para 2024",
    excerpt: "Las tendencias que marcarán el futuro de la moda responsable este año.",
    date: "20 Ene 2024",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
    slug: "#",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f0f5f3] to-white py-12 md:py-16">
        <div className="container-custom mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a365d]">
            Blog
          </h1>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Card
                key={index}
                className="overflow-hidden rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-[200px]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                  <h3 className="text-xl font-bold text-[#1a365d] mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <Link href={post.slug}>
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
