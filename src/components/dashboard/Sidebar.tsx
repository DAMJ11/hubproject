"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  CreditCard,
  Star,
  Home,
  HelpCircle,
  FileText,
  Factory,
  Leaf,
  Award,
  Briefcase,
  Send,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface SidebarProps {
  isOpen: boolean;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
  userRole: string;
  onNavigateStart?: () => void;
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
  { name: "Empresas", href: "/dashboard/companies", icon: Factory },
  { name: "Proyectos (RFQ)", href: "/dashboard/rfq", icon: FileText },
  { name: "Contratos", href: "/dashboard/contracts", icon: Briefcase },
  { name: "Usuarios", href: "/dashboard/users", icon: Users },
  { name: "Mensajes", href: "/dashboard/messages", icon: MessageSquare, badge: 3 },
  { name: "Pagos", href: "/dashboard/payments", icon: CreditCard },
  { name: "Reseñas", href: "/dashboard/reviews", icon: Star },
  { name: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

const brandNavItems: NavItem[] = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Mis Proyectos", href: "/dashboard/projects", icon: FileText, badge: 2 },
  { name: "Mis Contratos", href: "/dashboard/contracts", icon: Briefcase },
  { name: "Fabricantes", href: "/dashboard/manufacturers", icon: Factory },
  { name: "Mensajes", href: "/dashboard/messages", icon: MessageSquare, badge: 1 },
  { name: "Mi Empresa", href: "/dashboard/company", icon: Building2 },
  { name: "Pagos", href: "/dashboard/payments", icon: CreditCard },
  { name: "Ayuda", href: "/dashboard/help", icon: HelpCircle },
];

const manufacturerNavItems: NavItem[] = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Oportunidades", href: "/dashboard/opportunities", icon: Leaf, badge: 3 },
  { name: "Mis Propuestas", href: "/dashboard/proposals", icon: Send },
  { name: "Mis Contratos", href: "/dashboard/contracts", icon: Briefcase },
  { name: "Mensajes", href: "/dashboard/messages", icon: MessageSquare, badge: 1 },
  {
    name: "Mi Perfil",
    href: "/dashboard/company",
    icon: Factory,
    subItems: [
      { name: "Datos de Empresa", href: "/dashboard/company" },
      { name: "Capacidades", href: "/dashboard/company/capabilities" },
      { name: "Certificaciones", href: "/dashboard/company/certifications" },
    ],
  },
  { name: "Puntuación Verde", href: "/dashboard/green-score", icon: Award },
  { name: "Pagos", href: "/dashboard/payments", icon: CreditCard },
  { name: "Reseñas", href: "/dashboard/reviews", icon: Star },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({
  isOpen,
  isMobile = false,
  mobileOpen = false,
  onToggle,
  onMobileClose,
  userRole,
  onNavigateStart,
}: SidebarProps) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef<HTMLElement | null>(null);

  const labelMap = {
    en: {
      Dashboard: "Dashboard",
      Empresas: "Companies",
      "Proyectos (RFQ)": "Projects (RFQ)",
      Contratos: "Contracts",
      Usuarios: "Users",
      Mensajes: "Messages",
      Pagos: "Payments",
      Reseñas: "Reviews",
      Reportes: "Reports",
      Configuración: "Settings",
      Inicio: "Home",
      "Mis Proyectos": "My Projects",
      "Mis Contratos": "My Contracts",
      Fabricantes: "Manufacturers",
      "Mi Empresa": "My Company",
      Ayuda: "Help",
      Oportunidades: "Opportunities",
      "Mis Propuestas": "My Proposals",
      "Mi Perfil": "My Profile",
      "Datos de Empresa": "Company Details",
      Capacidades: "Capabilities",
      Certificaciones: "Certifications",
      "Puntuación Verde": "Green Score",
    },
    fr: {
      Dashboard: "Tableau de bord",
      Empresas: "Entreprises",
      "Proyectos (RFQ)": "Projets (RFQ)",
      Contratos: "Contrats",
      Usuarios: "Utilisateurs",
      Mensajes: "Messages",
      Pagos: "Paiements",
      Reseñas: "Avis",
      Reportes: "Rapports",
      Configuración: "Parametres",
      Inicio: "Accueil",
      "Mis Proyectos": "Mes Projets",
      "Mis Contratos": "Mes Contrats",
      Fabricantes: "Fabricants",
      "Mi Empresa": "Mon Entreprise",
      Ayuda: "Aide",
      Oportunidades: "Opportunites",
      "Mis Propuestas": "Mes Propositions",
      "Mi Perfil": "Mon Profil",
      "Datos de Empresa": "Donnees d'entreprise",
      Capacidades: "Capacites",
      Certificaciones: "Certifications",
      "Puntuación Verde": "Score Vert",
    },
  } as const;

  const uiText = {
    es: {
      closeMenu: "Cerrar menu",
      collapseMenu: "Colapsar menu",
      searchPlaceholder: "Buscar...",
      roleAdmin: "Administrador",
      roleManufacturer: "Fabricante",
      roleBrand: "Marca",
      ctaAdmin: "Ver Proyectos",
      ctaBrand: "Publicar Proyecto",
      ctaManufacturer: "Ver Oportunidades",
      ctaAdminAria: "Ver proyectos",
      ctaBrandAria: "Publicar proyecto",
      ctaManufacturerAria: "Ver oportunidades",
    },
    en: {
      closeMenu: "Close menu",
      collapseMenu: "Collapse menu",
      searchPlaceholder: "Search...",
      roleAdmin: "Administrator",
      roleManufacturer: "Manufacturer",
      roleBrand: "Brand",
      ctaAdmin: "View Projects",
      ctaBrand: "Publish Project",
      ctaManufacturer: "View Opportunities",
      ctaAdminAria: "View projects",
      ctaBrandAria: "Publish project",
      ctaManufacturerAria: "View opportunities",
    },
    fr: {
      closeMenu: "Fermer le menu",
      collapseMenu: "Reduire le menu",
      searchPlaceholder: "Rechercher...",
      roleAdmin: "Administrateur",
      roleManufacturer: "Fabricant",
      roleBrand: "Marque",
      ctaAdmin: "Voir Projets",
      ctaBrand: "Publier Projet",
      ctaManufacturer: "Voir Opportunites",
      ctaAdminAria: "Voir projets",
      ctaBrandAria: "Publier projet",
      ctaManufacturerAria: "Voir opportunites",
    },
  } as const;

  const t = uiText[language];
  const translateLabel = (label: string) => {
    if (language === "es") return label;
    const dict = language === "en" ? labelMap.en : labelMap.fr;
    return dict[label as keyof typeof dict] ?? label;
  };

  const navItems = userRole === "admin"
    ? adminNavItems
    : userRole === "manufacturer"
      ? manufacturerNavItems
      : brandNavItems;

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const handleNavigate = (href: string) => {
    if (pathname === href) return;
    onNavigateStart?.();
    if (isMobile) onMobileClose?.();
  };

  const expanded = isMobile ? true : isOpen;

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;

    const focusTarget = sidebarRef.current?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    focusTarget?.focus();
  }, [isMobile, mobileOpen]);

  return (
    <aside
      ref={sidebarRef}
      role={isMobile ? "dialog" : undefined}
      aria-modal={isMobile ? true : undefined}
      aria-hidden={isMobile ? !mobileOpen : undefined}
      aria-label="Menu lateral del dashboard"
      className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 z-40 ${
        isMobile
          ? `w-[84vw] max-w-[320px] transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
          : `${isOpen ? "w-64" : "w-20"} hidden lg:block`
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-800">
        {expanded ? (
          <Link href="/dashboard" onClick={() => handleNavigate("/dashboard")} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#1a365d] dark:text-slate-100">FASHIONS DEN</span>
          </Link>
        ) : (
          <Link href="/dashboard" onClick={() => handleNavigate("/dashboard")} className="mx-auto">
            <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </Link>
        )}
        {isMobile ? (
          <button
            onClick={onMobileClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t.closeMenu}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${!isOpen ? "hidden" : ""}`}
            aria-label={t.collapseMenu}
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* CTA Button */}
      {expanded ? (
        <div className="p-4">
          <Link
            href={
              userRole === "admin" ? "/dashboard/rfq"
                : userRole === "brand" ? "/dashboard/projects/new"
                : "/dashboard/opportunities"
            }
            onClick={() =>
              handleNavigate(
                userRole === "admin" ? "/dashboard/rfq"
                  : userRole === "brand" ? "/dashboard/projects/new"
                  : "/dashboard/opportunities"
              )
            }
          >
            <Button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              {userRole === "admin" ? t.ctaAdmin : userRole === "brand" ? t.ctaBrand : t.ctaManufacturer}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="p-2 flex justify-center">
          <Link
            href={
              userRole === "admin" ? "/dashboard/rfq"
                : userRole === "brand" ? "/dashboard/projects/new"
                : "/dashboard/opportunities"
            }
            onClick={() =>
              handleNavigate(
                userRole === "admin" ? "/dashboard/rfq"
                  : userRole === "brand" ? "/dashboard/projects/new"
                  : "/dashboard/opportunities"
              )
            }
          >
            <Button size="icon" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg" aria-label={userRole === "admin" ? t.ctaAdminAria : userRole === "brand" ? t.ctaBrandAria : t.ctaManufacturerAria}>
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Search */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Role badge */}
      {expanded && (
        <div className="px-4 pb-3">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              userRole === "admin"
                ? "bg-purple-100 text-purple-700"
                : userRole === "manufacturer"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
            {userRole === "admin" ? t.roleAdmin : userRole === "manufacturer" ? t.roleManufacturer : t.roleBrand}
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
                    active ? "bg-[#2563eb] text-white" : "text-gray-700 hover:bg-gray-100"
                  } ${!expanded ? "justify-center" : ""}`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-gray-500"}`} />
                  {expanded && (
                    <>
                      <span className="flex-1 text-left font-medium text-sm">{translateLabel(item.name)}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => handleNavigate(item.href)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active ? "bg-[#2563eb] text-white" : "text-gray-700 hover:bg-gray-100"
                  } ${!expanded ? "justify-center" : ""}`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-gray-500"}`} />
                    {item.badge && !expanded && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {expanded && (
                    <>
                      <span className="flex-1 font-medium text-sm">{translateLabel(item.name)}</span>
                      {item.badge && (
                        <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )}

              {hasSubItems && isExpanded && expanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems?.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={() => handleNavigate(subItem.href)}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        pathname === subItem.href
                          ? "bg-gray-100 text-[#2563eb] font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {translateLabel(subItem.name)}
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

