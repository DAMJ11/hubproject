"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  ChevronDown,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

const getFlagSrc = (countryCode: "es" | "gb" | "fr") => `https://flagcdn.com/w40/${countryCode}.png`;

interface DashboardHeaderProps {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  onMenuClick: () => void;
}

const headerMessages = {
  es: {
    dashboard: "Dashboard",
    segmentLabels: {
      companies: "Empresas",
      rfq: "Proyectos (RFQ)",
      projects: "Mis Proyectos",
      contracts: "Contratos",
      opportunities: "Oportunidades",
      proposals: "Propuestas",
      company: "Mi Empresa",
      capabilities: "Capacidades",
      certifications: "Certificaciones",
      manufacturers: "Fabricantes",
      users: "Usuarios",
      messages: "Mensajes",
      payments: "Pagos",
      reviews: "Resenas",
      reports: "Reportes",
      settings: "Configuracion",
      help: "Ayuda",
      new: "Nuevo",
      "green-score": "Puntuacion Verde",
    },
    notificationsTitle: "Notificaciones",
    notifications: [
      { id: 1, title: "Tu reserva de limpieza fue confirmada", time: "Hace 5 min", unread: true },
      { id: 2, title: "Carlos M. esta en camino a tu direccion", time: "Hace 1 hora", unread: true },
      { id: 3, title: "Nuevo profesional disponible en tu zona", time: "Hace 2 horas", unread: false },
      { id: 4, title: "Califica tu servicio de jardineria", time: "Hace 3 horas", unread: false },
    ],
    ariaOpenMenu: "Abrir o cerrar menu lateral",
    ariaThemeDark: "Cambiar a modo oscuro",
    ariaThemeLight: "Cambiar a modo claro",
    ariaNotifications: "Abrir notificaciones",
    viewAllNotifications: "Ver todas las notificaciones",
    roleLabels: {
      admin: "Administrador",
      manufacturer: "Fabricante",
      brand: "Marca",
    },
    profileSettings: "Configuracion",
    signOut: "Cerrar sesion",
  },
  en: {
    dashboard: "Dashboard",
    segmentLabels: {
      companies: "Companies",
      rfq: "Projects (RFQ)",
      projects: "My Projects",
      contracts: "Contracts",
      opportunities: "Opportunities",
      proposals: "Proposals",
      company: "My Company",
      capabilities: "Capabilities",
      certifications: "Certifications",
      manufacturers: "Manufacturers",
      users: "Users",
      messages: "Messages",
      payments: "Payments",
      reviews: "Reviews",
      reports: "Reports",
      settings: "Settings",
      help: "Help",
      new: "New",
      "green-score": "Green Score",
    },
    notificationsTitle: "Notifications",
    notifications: [
      { id: 1, title: "Your cleaning booking was confirmed", time: "5 min ago", unread: true },
      { id: 2, title: "Carlos M. is on the way to your address", time: "1 hour ago", unread: true },
      { id: 3, title: "A new professional is available in your area", time: "2 hours ago", unread: false },
      { id: 4, title: "Rate your gardening service", time: "3 hours ago", unread: false },
    ],
    ariaOpenMenu: "Open or close sidebar menu",
    ariaThemeDark: "Switch to dark mode",
    ariaThemeLight: "Switch to light mode",
    ariaNotifications: "Open notifications",
    viewAllNotifications: "View all notifications",
    roleLabels: {
      admin: "Administrator",
      manufacturer: "Manufacturer",
      brand: "Brand",
    },
    profileSettings: "Settings",
    signOut: "Sign out",
  },
  fr: {
    dashboard: "Tableau de bord",
    segmentLabels: {
      companies: "Entreprises",
      rfq: "Projets (RFQ)",
      projects: "Mes Projets",
      contracts: "Contrats",
      opportunities: "Opportunites",
      proposals: "Propositions",
      company: "Mon Entreprise",
      capabilities: "Capacites",
      certifications: "Certifications",
      manufacturers: "Fabricants",
      users: "Utilisateurs",
      messages: "Messages",
      payments: "Paiements",
      reviews: "Avis",
      reports: "Rapports",
      settings: "Parametres",
      help: "Aide",
      new: "Nouveau",
      "green-score": "Score Vert",
    },
    notificationsTitle: "Notifications",
    notifications: [
      { id: 1, title: "Votre reservation de nettoyage a ete confirmee", time: "Il y a 5 min", unread: true },
      { id: 2, title: "Carlos M. est en route vers votre adresse", time: "Il y a 1 heure", unread: true },
      { id: 3, title: "Un nouveau professionnel est disponible dans votre zone", time: "Il y a 2 heures", unread: false },
      { id: 4, title: "Evaluez votre service de jardinage", time: "Il y a 3 heures", unread: false },
    ],
    ariaOpenMenu: "Ouvrir ou fermer le menu lateral",
    ariaThemeDark: "Passer en mode sombre",
    ariaThemeLight: "Passer en mode clair",
    ariaNotifications: "Ouvrir les notifications",
    viewAllNotifications: "Voir toutes les notifications",
    roleLabels: {
      admin: "Administrateur",
      manufacturer: "Fabricant",
      brand: "Marque",
    },
    profileSettings: "Parametres",
    signOut: "Se deconnecter",
  },
} as const;

export default function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, languages } = useLanguage();
  const selectedLanguage = languages.find((lang) => lang.code === language) ?? languages[0];
  const messages = headerMessages[language];
  const notifications = messages.notifications;
  const unreadCount = notifications.filter((n) => n.unread).length;
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("dashboard-theme");
    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = storedTheme === "dark" || storedTheme === "light"
      ? (storedTheme as "light" | "dark")
      : (preferredDark ? "dark" : "light");

    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("dashboard-theme", theme);
  }, [theme]);

  const segmentLabels = messages.segmentLabels;

  const breadcrumbs = useMemo(() => {
    const cleanPath = pathname.replace(/^\/dashboard\/?/, "");
    const segments = cleanPath.length > 0 ? cleanPath.split("/") : [];

    const labels = segments.map((segment) => {
      if (segmentLabels[segment as keyof typeof segmentLabels]) {
        return segmentLabels[segment as keyof typeof segmentLabels];
      }
      return segment
        .split("-")
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(" ");
    });

    return [messages.dashboard, ...labels];
  }, [messages.dashboard, pathname, segmentLabels]);

  const pageTitle = breadcrumbs[breadcrumbs.length - 1] ?? messages.dashboard;
  const roleLabel = user.role === "admin"
    ? messages.roleLabels.admin
    : user.role === "manufacturer"
      ? messages.roleLabels.manufacturer
      : messages.roleLabels.brand;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesion:", error);
    }
  };

  const getInitials = () => `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          aria-label={messages.ariaOpenMenu}
        >
          <Menu className="w-5 h-5 text-gray-500" />
        </button>

        <div className="hidden sm:block min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{pageTitle}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 truncate">
            <Home className="w-3.5 h-3.5" />
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb}-${index}`} className="inline-flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={index === breadcrumbs.length - 1 ? "text-[#2563eb] font-medium" : ""}>{crumb}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={theme === "dark" ? messages.ariaThemeLight : messages.ariaThemeDark}
          onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-3">
              <img
                src={getFlagSrc(selectedLanguage.countryCode)}
                alt={selectedLanguage.name}
                className="w-5 h-4 rounded-[2px] object-cover"
                loading="lazy"
              />
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <img
                  src={getFlagSrc(lang.countryCode)}
                  alt={lang.name}
                  className="w-5 h-4 rounded-[2px] object-cover"
                  loading="lazy"
                />
                <span>{lang.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={messages.ariaNotifications}>
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{messages.notificationsTitle}</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 px-4 py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    {notification.unread && (
                      <span className="w-2 h-2 bg-[#2563eb] rounded-full flex-shrink-0" />
                    )}
                    <span className={`text-sm ${notification.unread ? "font-medium" : ""}`}>
                      {notification.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 ml-4">{notification.time}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-[#2563eb] font-medium cursor-pointer">
              {messages.viewAllNotifications}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="w-9 h-9 bg-[#2563eb] rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">{getInitials()}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user.firstName}</p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              {messages.segmentLabels.company}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              {messages.profileSettings}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              {messages.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

