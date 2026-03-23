"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const getFlagSrc = (countryCode: string) => `https://flagcdn.com/w40/${countryCode}.png`;

const LANGUAGES = [
  { code: "es" as const, countryCode: "es", name: "Español" },
  { code: "en" as const, countryCode: "gb", name: "English" },
  { code: "fr" as const, countryCode: "fr", name: "Français" },
];

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

const NOTIFICATION_UNREAD = [true, true, false, false];

export default function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("DashboardHeader");
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const selectedLanguage = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];
  const unreadCount = NOTIFICATION_UNREAD.filter(Boolean).length;
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

  const SEGMENT_KEYS = ["companies","rfq","projects","contracts","opportunities","proposals","company","capabilities","certifications","manufacturers","users","messages","payments","reviews","reports","settings","help","new","green-score"] as const;

  const breadcrumbs = useMemo(() => {
    const cleanPath = pathname.replace(/^\/dashboard\/?/, "");
    const segments = cleanPath.length > 0 ? cleanPath.split("/") : [];

    const labels = segments.map((segment) => {
      if (SEGMENT_KEYS.includes(segment as typeof SEGMENT_KEYS[number])) {
        return t(`segmentLabels.${segment}`);
      }
      return segment
        .split("-")
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(" ");
    });

    return [t("dashboard"), ...labels];
  }, [t, pathname]);

  const pageTitle = breadcrumbs[breadcrumbs.length - 1] ?? t("dashboard");
  const roleLabel = user.role === "admin"
    ? t("roleAdmin")
    : user.role === "manufacturer"
      ? t("roleManufacturer")
      : t("roleBrand");

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
          aria-label={t("ariaOpenMenu")}
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
          aria-label={theme === "dark" ? t("ariaThemeLight") : t("ariaThemeDark")}
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
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
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
            <Button variant="ghost" size="icon" className="relative" aria-label={t("ariaNotifications")}>
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
              <h3 className="font-semibold text-gray-900">{t("notificationsTitle")}</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {[0, 1, 2, 3].map((i) => (
                <DropdownMenuItem
                  key={i}
                  className="flex flex-col items-start gap-1 px-4 py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    {NOTIFICATION_UNREAD[i] && (
                      <span className="w-2 h-2 bg-[#2563eb] rounded-full flex-shrink-0" />
                    )}
                    <span className={`text-sm ${NOTIFICATION_UNREAD[i] ? "font-medium" : ""}`}>
                      {t(`notifications.${i}.title`)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 ml-4">{t(`notifications.${i}.time`)}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-[#2563eb] font-medium cursor-pointer">
              {t("viewAllNotifications")}
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
              {t("segmentLabels.company")}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              {t("profileSettings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

