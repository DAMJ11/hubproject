"use client";

import { useState } from "react";
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
  Phone,
  Loader2,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

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
  const [callLoading, setCallLoading] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);

  const handleBookCall = async () => {
    setCallLoading(true);
    setCallError(null);
    try {
      const res = await fetch("/api/stripe/strategy-call", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setCallError(data.message || "Something went wrong");
      }
    } catch {
      setCallError("Network error. Please try again.");
    } finally {
      setCallLoading(false);
    }
  };

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
            {getGreeting()}, {user.firstName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon] ?? FileText;
          return (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex-shrink-0 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{stat.value}</p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-tight">{stat.label}</p>
                  </div>
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
        <div className="space-y-4">
          {(isBrand || isManufacturer) && (
            <Card className="border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 flex-shrink-0 bg-brand-600 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Book a strategy call</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">30-min session to accelerate your production journey</p>
                    {callError && <p className="text-xs text-red-500 mt-1">{callError}</p>}
                    <Button
                      size="sm"
                      onClick={handleBookCall}
                      disabled={callLoading}
                      className="mt-2 bg-brand-600 hover:bg-brand-700 text-white text-xs h-8"
                    >
                      {callLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Phone className="w-3 h-3 mr-1" />}
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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


