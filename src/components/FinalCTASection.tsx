import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FinalCTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#2563eb] to-[#065f46] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
          ¿Listo para transformar el cuidado de tu hogar?
        </h2>
        <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
          Únete a miles de personas que ya confían en TidyHubb para mantener
          su hogar impecable con profesionales verificados.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link href="/register">
            <Button size="lg" className="bg-white text-[#2563eb] hover:bg-gray-100 rounded-lg px-8 h-12 text-base font-semibold">
              Comenzar Ahora — Es Gratis
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 rounded-lg px-8 h-12 text-base"
            >
              Ya tengo cuenta
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

