import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, CalendarCheck, DollarSign, Star, ArrowUpRight } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getReports } from "@/lib/data/reports";

export default async function ReportsPage() {
  const data = await getReports();
  if (!data) redirect("/login");

  const t = await getTranslations("Reports");
  const locale = await getLocale();
  const { monthlyData, topServices, topProfessionals, totals } = {
    monthlyData: data.monthlyData.map((d) => ({ month: d.month, bookings: d.projects, revenue: d.revenue })),
    topServices: data.topManufacturers.map((m) => ({ name: m.name, bookings: m.contracts_count, revenue: m.revenue, growth: Math.round(m.avg_green_score) })),
    topProfessionals: data.topManufacturers.map((m) => ({ name: m.name, jobs: m.contracts_count, rating: Math.round(m.avg_green_score * 10) / 10, revenue: m.revenue })),
    totals: { total_bookings: data.totals.total_projects, total_revenue: data.totals.total_revenue, new_users: data.totals.total_companies, avg_rating: Math.round(data.totals.avg_rating * 10) / 10 },
  };

  const formatCOP = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  const maxBookings = Math.max(...monthlyData.map((d) => d.bookings), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("monthlyOrders"), value: String(totals.total_bookings), icon: CalendarCheck, color: "bg-blue-100 text-blue-600" },
          { label: t("monthlyRevenue"), value: formatCOP(totals.total_revenue), icon: DollarSign, color: "bg-green-100 text-green-600" },
          { label: t("newClients"), value: String(totals.new_users), icon: Users, color: "bg-purple-100 text-purple-600" },
          { label: t("avgRating"), value: String(totals.avg_rating), icon: Star, color: "bg-yellow-100 text-yellow-600" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {monthlyData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            {t("monthlyOrdersChart")}
          </h3>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-700">{d.bookings}</span>
                <div
                  className="w-full bg-brand-600 rounded-t-md transition-all hover:bg-brand-700"
                  style={{ height: `${(d.bookings / maxBookings) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{d.month}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topServices.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              {t("topServices")}
            </h3>
            <div className="space-y-4">
              {topServices.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">{s.name}</p>
                      <span className={`text-xs font-medium ${s.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {s.growth >= 0 ? "+" : ""}{s.growth}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{t("orders", { count: s.bookings })}</span>
                      <span>{formatCOP(s.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: `${(s.bookings / topServices[0].bookings) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {topProfessionals.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              {t("topSpecialists")}
            </h3>
            <div className="space-y-4">
              {topProfessionals.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{p.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{p.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{t("jobs", { count: p.jobs })}</span>
                      <span>{formatCOP(p.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

