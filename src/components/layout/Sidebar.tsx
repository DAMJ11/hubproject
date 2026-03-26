"use client";

import { useEffect, useRef, useState } from "react";
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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessagesCount";
import { useOpportunitiesCount } from "@/hooks/useOpportunitiesCount";

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
  key: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  subItems?: { key: string; href: string }[];
}

const adminNavItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "companies", href: "/dashboard/companies", icon: Factory },
  { key: "projectsRfq", href: "/dashboard/rfq", icon: FileText },
  { key: "contracts", href: "/dashboard/contracts", icon: Briefcase },
  { key: "users", href: "/dashboard/users", icon: Users },
  { key: "messages", href: "/dashboard/messages", icon: MessageSquare },
  { key: "payments", href: "/dashboard/payments", icon: CreditCard },
  { key: "reviews", href: "/dashboard/reviews", icon: Star },
  { key: "reports", href: "/dashboard/reports", icon: BarChart3 },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
];

const brandNavItems: NavItem[] = [
  { key: "home", href: "/dashboard", icon: Home },
  { key: "myProjects", href: "/dashboard/projects", icon: FileText, badge: 2 },
  { key: "myContracts", href: "/dashboard/contracts", icon: Briefcase },
  { key: "manufacturers", href: "/dashboard/manufacturers", icon: Factory },
  { key: "messages", href: "/dashboard/messages", icon: MessageSquare },
  { key: "myCompany", href: "/dashboard/company", icon: Building2 },
  { key: "payments", href: "/dashboard/payments", icon: CreditCard },
  { key: "help", href: "/dashboard/help", icon: HelpCircle },
];

const manufacturerNavItems: NavItem[] = [
  { key: "home", href: "/dashboard", icon: Home },
  { key: "opportunities", href: "/dashboard/opportunities", icon: Leaf },
  { key: "myProposals", href: "/dashboard/proposals", icon: Send },
  { key: "myContracts", href: "/dashboard/contracts", icon: Briefcase },
  { key: "messages", href: "/dashboard/messages", icon: MessageSquare },
  {
    key: "myProfile",
    href: "/dashboard/company",
    icon: Factory,
    subItems: [
      { key: "companyDetails", href: "/dashboard/company" },
      { key: "capabilities", href: "/dashboard/company/capabilities" },
      { key: "certifications", href: "/dashboard/company/certifications" },
    ],
  },
  { key: "greenScore", href: "/dashboard/green-score", icon: Award },
  { key: "payments", href: "/dashboard/payments", icon: CreditCard },
  { key: "reviews", href: "/dashboard/reviews", icon: Star },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
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
  const t = useTranslations("Sidebar");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef<HTMLElement | null>(null);
  const { unreadCount } = useUnreadMessagesCount(15000);
  const { opportunitiesCount } = useOpportunitiesCount(userRole === "manufacturer", 10000);

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
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-brand-900 dark:text-slate-100">FASHIONS DEN</span>
          </Link>
        ) : (
          <Link href="/dashboard" onClick={() => handleNavigate("/dashboard")} className="mx-auto">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </Link>
        )}
        {isMobile ? (
          <button
            onClick={onMobileClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={t("closeMenu")}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors ${!isOpen ? "hidden" : ""}`}
            aria-label={t("collapseMenu")}
          >
            <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
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
            <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              {userRole === "admin" ? t("ctaAdmin") : userRole === "brand" ? t("ctaBrand") : t("ctaManufacturer")}
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg" aria-label={userRole === "admin" ? t("ctaAdminAria") : userRole === "brand" ? t("ctaBrandAria") : t("ctaManufacturerAria")}>
                  <Plus className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {userRole === "admin" ? t("ctaAdmin") : userRole === "brand" ? t("ctaBrand") : t("ctaManufacturer")}
              </TooltipContent>
            </Tooltip>
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
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-lg"
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
            {userRole === "admin" ? t("roleAdmin") : userRole === "manufacturer" ? t("roleManufacturer") : t("roleBrand")}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav aria-label={t("navigationLabel")} className="px-2 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-260px)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const isExpanded = expandedItems.includes(item.key);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const itemBadge = item.key === "messages"
            ? unreadCount
            : item.key === "opportunities" && userRole === "manufacturer"
              ? opportunitiesCount
              : (item.badge ?? 0);

          return (
            <div key={item.key}>
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpand(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active ? "bg-brand-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  } ${!expanded ? "justify-center" : ""}`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
                  {expanded && (
                    <>
                      <span className="flex-1 text-left font-medium text-sm">{t(`nav.${item.key}`)}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => handleNavigate(item.href)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active ? "bg-brand-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  } ${!expanded ? "justify-center" : ""}`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
                    {itemBadge > 0 && !expanded && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {itemBadge}
                      </span>
                    )}
                  </div>
                  {expanded && (
                    <>
                      <span className="flex-1 font-medium text-sm">{t(`nav.${item.key}`)}</span>
                      {itemBadge > 0 && (
                        <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {itemBadge}
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
                          ? "bg-gray-100 dark:bg-slate-800 text-brand-600 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {t(`nav.${subItem.key}`)}
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

