"use client";

import { useState } from "react";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { HelpCircle, Search, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, BookOpen, Shield, CreditCard, CalendarCheck } from "lucide-react";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  { id: 1, category: "Reservas", question: "¿Cómo puedo hacer una reserva?", answer: "Ve a la sección 'Buscar Servicios', selecciona el que necesitas, elige la fecha y hora, y confirma tu reserva. Recibirás una confirmación por correo electrónico." },
  { id: 2, category: "Reservas", question: "¿Puedo cancelar mi reserva?", answer: "Sí, puedes cancelar hasta 4 horas antes del servicio sin costo. Cancellaciones posteriores pueden tener un cargo del 30% del valor del servicio." },
  { id: 3, category: "Reservas", question: "¿Qué pasa si el profesional no llega?", answer: "En caso de no-show del profesional, te contactaremos inmediatamente para asignar otro profesional o reprogramar sin costo adicional. Además, recibirás un descuento en tu próximo servicio." },
  { id: 4, category: "Pagos", question: "¿Qué métodos de pago aceptan?", answer: "Aceptamos pagos en efectivo, tarjeta de crédito/débito, transferencia bancaria, Nequi y Daviplata. El pago se realiza una vez completado el servicio." },
  { id: 5, category: "Pagos", question: "¿Cómo aplico un código de descuento?", answer: "Al momento de confirmar tu reserva, encontrarás un campo para ingresar tu código promocional. El descuento se aplicará automáticamente al total." },
  { id: 6, category: "Seguridad", question: "¿Los profesionales están verificados?", answer: "Todos nuestros profesionales pasan por un proceso de verificación que incluye validación de identidad, antecedentes y certificaciones profesionales. Solo los verificados aparecen en la plataforma." },
  { id: 7, category: "Seguridad", question: "¿Existe garantía por el servicio?", answer: "Sí, todos los servicios tienen una garantía de satisfacción. Si no estás conforme, puedes solicitar una revisión gratuita dentro de las 48 horas siguientes al servicio." },
  { id: 8, category: "Cuenta", question: "¿Cómo cambio mi contraseña?", answer: "Ve a Configuración > Seguridad y podrás cambiar tu contraseña. Necesitarás ingresar tu contraseña actual y la nueva contraseña dos veces para confirmar." },
];

const categoryIcons: Record<string, React.ElementType> = {
  Reservas: CalendarCheck,
  Pagos: CreditCard,
  Seguridad: Shield,
  Cuenta: BookOpen,
};

export default function HelpPage() {
  const { user } = useDashboardUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  if (!user) return null;

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  const filtered = faqs.filter((f) => {
    const matchSearch = `${f.question} ${f.answer}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === "all" || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-[#2563eb]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">¿En qué te podemos ayudar?</h1>
          <p className="text-gray-500 mt-1">Busca en nuestras preguntas frecuentes o contáctanos</p>
          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar en preguntas frecuentes..." className="pl-12 h-12 text-base" />
          </div>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          <Button variant={activeCategory === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveCategory("all")}
            className={activeCategory === "all" ? "bg-[#2563eb] hover:bg-[#1d4ed8]" : ""}>Todas</Button>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || HelpCircle;
            return (
              <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)}
                className={`gap-1 ${activeCategory === cat ? "bg-[#2563eb] hover:bg-[#1d4ed8]" : ""}`}>
                <Icon className="w-3.5 h-3.5" /> {cat}
              </Button>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {filtered.map((faq) => (
            <Card key={faq.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{faq.category}</span>
                  <span className="font-medium text-gray-900">{faq.question}</span>
                </div>
                {expandedId === faq.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expandedId === faq.id && (
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t pt-3 bg-gray-50">
                  {faq.answer}
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card className="p-6 max-w-3xl mx-auto">
          <h3 className="font-semibold text-lg mb-2">¿No encontraste lo que buscabas?</h3>
          <p className="text-sm text-gray-500 mb-4">Nuestro equipo está disponible para ayudarte</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-[#2563eb] hover:bg-[#2563eb]/5 transition-colors">
              <MessageSquare className="w-6 h-6 text-[#2563eb]" />
              <span className="text-sm font-medium">Chat en Vivo</span>
              <span className="text-xs text-gray-500">Respuesta inmediata</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-[#2563eb] hover:bg-[#2563eb]/5 transition-colors">
              <Mail className="w-6 h-6 text-[#2563eb]" />
              <span className="text-sm font-medium">Email</span>
              <span className="text-xs text-gray-500">soporte@fashionsden.com</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-[#2563eb] hover:bg-[#2563eb]/5 transition-colors">
              <Phone className="w-6 h-6 text-[#2563eb]" />
              <span className="text-sm font-medium">Teléfono</span>
              <span className="text-xs text-gray-500">+57 601 555 0000</span>
            </button>
          </div>
        </Card>
    </div>
  );
}

