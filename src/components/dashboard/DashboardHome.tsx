"use client";

import {
  FileText,
  MessageSquare,
  Factory,
  Briefcase,
  Clock,
  Leaf,
  Search,
  Plus,
  Send,
  CreditCard,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessagesCount";

interface DashboardHomeProps {
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
  initialStats: StatItem[];
  initialProjects: ProjectItem[];
}

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
}

interface ProjectItem {
  id: number;
  code: string;
  title: string;
  status: string;
  quantity: number;
  budget_max: number;
  proposals_count: number;
  created_at: string;
  brand_name: string;
  category_name: string;
}

const iconMap: Record<string, React.ElementType> = {
  FileText,
  MessageSquare,
  Factory,
  Briefcase,
  Leaf,
  Send,
  CreditCard,
};

export default function DashboardHome({ user, initialStats, initialProjects }: DashboardHomeProps) {
  const t = useTranslations("DashboardHome");
  const locale = useLocale();
  const isBrand = user.role === "brand";
  const isManufacturer = user.role === "manufacturer";
  const isAdmin = user.role === "admin";
  const stats = initialStats;
  const projects = initialProjects;
  const { unreadCount: unreadChats, pendingCount: pendingChats } = useUnreadMessagesCount();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("greeting.morning");
    if (hour < 18) return t("greeting.afternoon");
    return t("greeting.evening");
  };

  const formatPrice = (n: number) => formatCurrency(n, locale);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user.firstName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin
              ? t("subtitle.admin")
              : isBrand
                ? t("subtitle.brand")
                : t("subtitle.manufacturer")}
          </p>
        </div>
        {isBrand && (
          <Link href="/dashboard/projects/new">
            <Button className="bg-brand-600 hover:bg-brand-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> {t("button.createProject")}
            </Button>
          </Link>
        )}
        {isManufacturer && (
          <Link href="/dashboard/opportunities">
            <Button className="bg-brand-600 hover:bg-brand-700 text-white">
              <Search className="w-4 h-4 mr-2" /> {t("button.viewOpportunities")}
            </Button>
          </Link>
        )}
        {isAdmin && (
          <Link href="/dashboard/rfq">
            <Button className="bg-brand-600 hover:bg-brand-700 text-white">
              <FileText className="w-4 h-4 mr-2" /> {t("button.viewProjects")}
            </Button>
          </Link>
        )}
      </div>

      {/* Unread messages / pending requests banner */}
      {(unreadChats > 0 || pendingChats > 0) && (
        <Link href={pendingChats > 0 ? "/dashboard/messages?tab=pending" : "/dashboard/messages"}>
          <div className="flex items-center gap-3 p-4 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 transition-colors">
            <MessageSquare className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <span className="text-sm font-medium text-brand-700">
              {pendingChats > 0 && unreadChats === 0
                ? t("pendingRequestsBanner", { count: pendingChats })
                : pendingChats > 0
                  ? t("pendingAndUnreadBanner", { pending: pendingChats, unread: unreadChats })
                  : t("unreadMessagesBanner", { count: unreadChats })}
            </span>
            <span className="ml-auto text-xs text-brand-600 font-medium">
              {t("goToMessages")} &rarr;
            </span>
          </div>
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon] ?? FileText;
          return (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {isAdmin ? t("section.recentProjects") : isBrand ? t("section.myProjects") : t("section.recentOpportunities")}
              </CardTitle>
              <Link href={isAdmin ? "/dashboard/rfq" : isBrand ? "/dashboard/projects" : "/dashboard/opportunities"}>
                <Button variant="ghost" size="sm" className="text-brand-600">{t("viewAll")}</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <EmptyState icon={FileText} title={t("noProjects")} />
              ) : (
                <div className="space-y-4">
                  {projects.map((p) => {
                    return (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{p.title}</h4>
                            <StatusBadge entity="projects" status={p.status} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="text-xs text-gray-400 dark:text-gray-500">{p.code}</span>
                            <span>📦 {p.quantity} {t("units")}</span>
                            <span className="flex items-center gap-1"><Send className="w-3 h-3" /> {p.proposals_count} {t("proposals")}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(p.created_at).toLocaleDateString(locale)}</span>
                          </div>
                        </div>
                        {p.budget_max > 0 && (
                          <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(p.budget_max)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel - Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t("section.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isAdmin && (
                <>
                  <Link href="/dashboard/companies">
                    <Button variant="outline" className="w-full justify-start">
                      <Factory className="w-4 h-4 mr-2" /> {t("quick.viewCompanies")}
                    </Button>
                  </Link>
                  <Link href="/dashboard/rfq">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" /> {t("quick.manageProjects")}
                    </Button>
                  </Link>
                  <Link href="/dashboard/contracts">
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="w-4 h-4 mr-2" /> {t("quick.viewContracts")}
                    </Button>
                  </Link>
                </>
              )}
              {isBrand && (
                <>
                  <Link href="/dashboard/projects/new">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" /> {t("quick.newProject")}
                    </Button>
                  </Link>
                  <Link href="/dashboard/manufacturers">
                    <Button variant="outline" className="w-full justify-start">
                      <Factory className="w-4 h-4 mr-2" /> {t("quick.exploreManufacturers")}
                    </Button>
                  </Link>
                  <Link href="/dashboard/contracts">
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="w-4 h-4 mr-2" /> {t("quick.myContracts")}
                    </Button>
                  </Link>
                </>
              )}
              {isManufacturer && (
                <>
                  <Link href="/dashboard/opportunities">
                    <Button variant="outline" className="w-full justify-start">
                      <Leaf className="w-4 h-4 mr-2" /> {t("quick.viewOpportunities")}
                    </Button>
                  </Link>
                  <Link href="/dashboard/proposals">
                    <Button variant="outline" className="w-full justify-start">
                      <Send className="w-4 h-4 mr-2" /> {t("quick.myProposals")}
                    </Button>
                  </Link>
                  <Link href="/dashboard/company">
                    <Button variant="outline" className="w-full justify-start">
                      <Factory className="w-4 h-4 mr-2" /> {t("quick.myProfile")}
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


