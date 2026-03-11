import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = {
  servicios: [
    { name: "Aseo del Hogar", href: "#servicios" },
    { name: "Jardinería", href: "#servicios" },
    { name: "Plomería", href: "#servicios" },
    { name: "Electricidad", href: "#servicios" },
    { name: "Pintura", href: "#servicios" },
    { name: "Todos los servicios", href: "#servicios" },
  ],
  empresa: [
    { name: "Sobre Nosotros", href: "/sobre-nosotros" },
    { name: "Blog", href: "/blog" },
    { name: "Trabaja con Nosotros", href: "/contacto" },
    { name: "Contacto", href: "/contacto" },
  ],
  profesionales: [
    { name: "Únete como Profesional", href: "/register" },
    { name: "Requisitos", href: "#profesionales" },
    { name: "Centro de Ayuda", href: "/contacto" },
  ],
  legal: [
    { name: "Términos y Condiciones", href: "/terminos" },
    { name: "Política de Privacidad", href: "/privacidad" },
    { name: "Política de Cookies", href: "/privacidad" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1a365d] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">FASHIONS DEN</span>
            </Link>
            <p className="text-sm text-gray-300 mt-3">
              Tu plataforma de confianza para reservar profesionales calificados
              y verificados para el cuidado de tu hogar.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="font-bold mb-4">Servicios</h4>
            <ul className="space-y-3">
              {footerLinks.servicios.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-300 hover:text-[#2563eb] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-bold mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-300 hover:text-[#2563eb] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Profesionales */}
          <div>
            <h4 className="font-bold mb-4">Profesionales</h4>
            <ul className="space-y-3">
              {footerLinks.profesionales.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-300 hover:text-[#2563eb] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-300 hover:text-[#2563eb] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} FASHIONS DEN. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-white/10">
              🇪🇸 ES
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

