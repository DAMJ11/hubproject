"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Star, Search, ThumbsUp, MessageSquare } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Review {
  id: number;
  client: string;
  professional: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  isPublic: boolean;
}

const mockReviews: Review[] = [
  { id: 1, client: "María González", professional: "Carlos Méndez", service: "Limpieza General", rating: 5, comment: "Excelente servicio, muy puntual y dejó todo impecable. Definitivamente lo recomiendo.", date: "2026-03-01", isPublic: true },
  { id: 2, client: "Ana Martínez", professional: "Laura Díaz", service: "Poda de Jardín", rating: 4, comment: "Muy buen trabajo con el jardín, quedó hermoso. Solo tardó un poco más de lo esperado.", date: "2026-02-28", isPublic: true },
  { id: 3, client: "Luis Pérez", professional: "Miguel Torres", service: "Revisión Eléctrica", rating: 5, comment: "Profesional muy capacitado, explicó todo claramente y resolvió el problema rápido.", date: "2026-02-27", isPublic: true },
  { id: 4, client: "Sandra López", professional: "Carlos Méndez", service: "Limpieza Profunda", rating: 3, comment: "El servicio fue aceptable, pero esperaba más detalle en la cocina.", date: "2026-02-25", isPublic: true },
  { id: 5, client: "Diego Torres", professional: "Ana Ruiz", service: "Mantenimiento Jardín", rating: 5, comment: "Increíble trabajo, mi jardín nunca se había visto tan bien. Muy profesional.", date: "2026-02-23", isPublic: true },
  { id: 6, client: "Camila Vargas", professional: "Pedro Vargas", service: "Reparación de Fugas", rating: 4, comment: "Resolvió la fuga rápidamente. Buen servicio y precio justo.", date: "2026-02-20", isPublic: false },
];

export default function ReviewsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d7a5f]" />
      </div>
    );
  }
  if (!user) return null;

  const isAdmin = user.role === "admin";
  const avgRating = (mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1);

  const filtered = mockReviews.filter((r) => {
    const matchSearch = `${r.client} ${r.professional} ${r.service} ${r.comment}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRating = filterRating === 0 || r.rating === filterRating;
    return matchSearch && matchRating;
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? "Reseñas" : "Mis Reseñas"}</h1>
            <p className="text-gray-500 mt-1">{isAdmin ? "Todas las reseñas de la plataforma" : "Reseñas que has dejado"}</p>
          </div>
          <Card className="px-4 py-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-xl font-bold">{avgRating}</span>
            <span className="text-sm text-gray-500">/ 5.0 ({mockReviews.length} reseñas)</span>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar reseñas..." className="pl-10" />
          </div>
          <div className="flex gap-2">
            <Button variant={filterRating === 0 ? "default" : "outline"} size="sm" onClick={() => setFilterRating(0)}
              className={filterRating === 0 ? "bg-[#0d7a5f] hover:bg-[#0a6b52]" : ""}>Todas</Button>
            {[5, 4, 3, 2, 1].map((r) => (
              <Button key={r} variant={filterRating === r ? "default" : "outline"} size="sm" onClick={() => setFilterRating(r)}
                className={filterRating === r ? "bg-[#0d7a5f] hover:bg-[#0a6b52]" : ""}>
                {r} <Star className="w-3 h-3 ml-1 fill-current" />
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((review) => (
            <Card key={review.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0d7a5f] flex items-center justify-center text-white text-sm font-bold">
                    {review.client.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.client}</p>
                    <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{review.service}</span>
                <span className="text-xs text-gray-400 mx-2">•</span>
                <span className="text-xs text-gray-500">Profesional: {review.professional}</span>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#0d7a5f]">
                  <ThumbsUp className="w-3.5 h-3.5" /> Útil
                </button>
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#0d7a5f]">
                  <MessageSquare className="w-3.5 h-3.5" /> Responder
                </button>
                {!review.isPublic && (
                  <span className="text-xs text-orange-500 ml-auto">Privada</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
