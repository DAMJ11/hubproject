"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
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
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { getPusherClient } from "@/lib/realtime/pusherClient";

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

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  reference_type: string | null;
  reference_id: number | null;
  is_read: boolean;
  created_at: string;
}

export default function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("DashboardHeader");
  const locale = useLocale();

  const [isPending, startTransition] = useTransition();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=10");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Pusher real-time: toast inmediato cuando llega un mensaje nuevo
  useEffect(() => {
    if (!user?.id) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`private-user-${user.id}`);

    const onNewMessage = (data: {
      preview?: string;
      senderName?: string;
      senderUserId?: number;
      messageId?: number;
    }) => {
      // No mostrar toast si el mensaje lo envió el propio usuario
      if (data.senderUserId === user.id) return;
      const sender = data.senderName ?? t("newMessageDefault");
      const preview = data.preview ?? "";
      toast(sender, {
        description: preview,
        icon: "💬",
        duration: 5000,
      });
      fetchNotifications();
    };

    channel.bind("chat.message.created", onNewMessage);

    return () => {
      channel.unbind("chat.message.created", onNewMessage);
      pusher.unsubscribe(`private-user-${user.id}`);
    };
  }, [user.id, fetchNotifications, t]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("justNow");
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  const selectedLanguage = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];
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

  const SEGMENT_KEYS = ["companies","rfq","projects","contracts","opportunities","proposals","company","capabilities","certifications","manufacturers","users","messages","payments","reviews","reports","settings","help","new","green-score","translations"] as const;

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

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      toast.success(t("logoutSuccess"));
      router.push("/login");
    } catch {
      toast.error(t("logoutError"));
    }
  };

  const getInitials = () => `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
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
                <span className={index === breadcrumbs.length - 1 ? "text-brand-600 font-medium" : ""}>{crumb}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={theme === "dark" ? t("ariaThemeLight") : t("ariaThemeDark")}
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {theme === "dark" ? t("ariaThemeLight") : t("ariaThemeDark")}
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`flex items-center gap-2 px-3 transition-opacity duration-200 ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
              <Image
                src={getFlagSrc(selectedLanguage.countryCode)}
                alt={selectedLanguage.name}
                width={20}
                height={16}
                className={`w-5 h-4 rounded-[2px] object-cover ${isPending ? "animate-pulse" : ""}`}
              />
              {isPending ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-brand-600 rounded-full animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Image
                  src={getFlagSrc(lang.countryCode)}
                  alt={lang.name}
                  width={20}
                  height={16}
                  className="w-5 h-4 rounded-[2px] object-cover"
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
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t("notificationsTitle")}</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" />
                  {t("markAllRead")}
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  {t("noNotifications")}
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex flex-col items-start gap-1 px-4 py-3 cursor-pointer"
                    onClick={() => {
                      if (n.reference_type === "conversation") {
                        router.push("/dashboard/messages");
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {!n.is_read && (
                        <span className="w-2 h-2 bg-brand-600 rounded-full flex-shrink-0" />
                      )}
                      <span className={`text-sm truncate ${!n.is_read ? "font-medium" : ""}`}>
                        {n.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-4 line-clamp-1">{n.message}</span>
                    <span className="text-xs text-gray-400 ml-4">{timeAgo(n.created_at)}</span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-brand-600 font-medium cursor-pointer"
              onClick={() => router.push("/dashboard/messages")}
            >
              {t("viewAllNotifications")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">{getInitials()}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{roleLabel}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
              <p className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/company")}>
              <User className="w-4 h-4 mr-2" />
              {t("segmentLabels.company")}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              {t("profileSettings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("logoutConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("logoutConfirmDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("logoutCancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                {t("logoutConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}

