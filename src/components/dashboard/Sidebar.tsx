"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  CalendarCheck,
  Sparkles,
  Users,
  UserCheck,
  Settings,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Menu,
  BarChart3,
  CreditCard,
  Star,
  Home,
  HelpCircle,
  Ticket,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  subItems?: { name: string; href: string }[];
}

const adminNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reservas", href: "/dashboard/bookings", icon: CalendarCheck, badge: 5 },
  {
    name: "Servicios",
    href: "/dashboard/services",
    icon: Sparkles,
    subItems: [
      { name: "Categorías", href: "/dashboard/services/categories" },
      { name: "Todos los Servicios", href: "/dashboard/services" },
      { name: "Crear Servicio", href: "/dashboard/services/new" },
    ],
  },
  {
    name: "Profesionales",
    href: "/dashboard/professionals",
    icon: UserCheck,
    subItems: [
      { name: "Todos", href: "/dashboard/professionals" },
      { name: "Registrar Nuevo", href: "/dashboard/professionals/new" },
    ],
  },
  { name: "Usuarios", href: "/dashboard/users", icon: Users },
  { name: "Mensajes", href: "/dashboard/messages", icon: MessageSquare, badge: 3 },
  { name: "Pagos", href: "/dashboard/payments", icon: CreditCard },
  { name: "Promociones", href: "/dashboard/promos", icon: Ticket },
  { name: "Reseñas", href: "/dashboard/reviews", icon: Star },
  { name: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

const userNavItems: NavItem[] = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Buscar Servicios", href: "/dashboard/services", icon: Search },
  { name: "Mis Reservas", href: "/dashboard/bookings", icon: CalendarCheck, badge: 2 },
  { name: "Mensajes", href: "/dashboard/messages", icon: MessageSquare, badge: 1 },
  { name: "Mis Direcciones", href: "/dashboard/addresses", icon: MapPin },
  { name: "Mis Reseñas", href: "/dashboard/reviews", icon: Star },
  { name: "Ayuda", href: "/dashboard/help", icon: HelpCircle },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onToggle, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = userRole === "admin" ? adminNavItems : userNavItems;

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {isOpen ? (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0d7a5f] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#1a365d]">TidyHubb</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <div className="w-10 h-10 bg-[#0d7a5f] rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${!isOpen ? "hidden" : ""}`}
        >
          <Menu className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* CTA Button */}
      {isOpen ? (
        <div className="p-4">
          <Link href={userRole === "admin" ? "/dashboard/services/new" : "/dashboard/services"}>
            <Button className="w-full bg-[#0d7a5f] hover:bg-[#0a6b52] text-white rounded-lg flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              {userRole === "admin" ? "Crear Servicio" : "Reservar Servicio"}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="p-2 flex justify-center">
          <Link href={userRole === "admin" ? "/dashboard/services/new" : "/dashboard/services"}>
            <Button size="icon" className="bg-[#0d7a5f] hover:bg-[#0a6b52] text-white rounded-lg">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Search */}
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Role badge */}
      {isOpen && (
        <div className="px-4 pb-3">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              userRole === "admin"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {userRole === "admin" ? "Administrador" : "Cliente"}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="px-2 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-260px)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const isExpanded = expandedItems.includes(item.name);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.name}>
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active ? "bg-[#0d7a5f] text-white" : "text-gray-700 hover:bg-gray-100"
                  } ${!isOpen ? "justify-center" : ""}`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-gray-500"}`} />
                  {isOpen && (
                    <>
                      <span className="flex-1 text-left font-medium text-sm">{item.name}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active ? "bg-[#0d7a5f] text-white" : "text-gray-700 hover:bg-gray-100"
                  } ${!isOpen ? "justify-center" : ""}`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-gray-500"}`} />
                    {item.badge && !isOpen && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {isOpen && (
                    <>
                      <span className="flex-1 font-medium text-sm">{item.name}</span>
                      {item.badge && (
                        <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )}

              {hasSubItems && isExpanded && isOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems?.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        pathname === subItem.href
                          ? "bg-gray-100 text-[#0d7a5f] font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
