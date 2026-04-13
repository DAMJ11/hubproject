"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Clock, DollarSign, Users, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DesignProject {
  id: number;
  code: string;
  title: string;
  category: string;
  status: string;
  season: string | null;
  budget_min: string | null;
  budget_max: string | null;
  currency: string;
  deadline: string | null;
  proposals_deadline: string | null;
  proposals_count: number;
  created_at: string;
  brand_name: string;
  assigned_designer_name: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  open: "bg-green-100 text-green-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  collections: "Collections",
  tech_packs: "Tech Packs",
  patterns: "Patterns",
  illustration: "Illustration",
  branding: "Branding",
  consulting: "Consulting",
};

export default function DesignProjectsList() {
  const t = useTranslations("DesignProjects");
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", String(pagination.page));

      const res = await fetch(`/api/design-projects?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProjects(json.data || []);
        setPagination(json.pagination);
      }
    } catch {
      toast.error(t("errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search, pagination.page, t]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      const res = await fetch(`/api/design-projects/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success(t("deleted"));
        fetchProjects();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error(t("errorDeleting"));
    }
  };

  const statuses = ["", "draft", "open", "in_progress", "review", "completed", "cancelled"];
  const categories = ["", "collections", "tech_packs", "patterns", "illustration", "branding", "consulting"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link href="/dashboard/design-projects/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="mr-2 h-4 w-4" />
            {t("createProject")}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s ? t(`status.${s}`) : t("allStatuses")}</option>
          ))}
        </select>
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c ? CATEGORY_LABELS[c] : t("allCategories")}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">{t("loading")}</div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t("noProjects")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{project.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[project.status] || "bg-gray-100"}`}>
                        {t(`status.${project.status}`)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {CATEGORY_LABELS[project.category] || project.category}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/dashboard/design-projects/${project.id}`}>
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    </Link>
                    {project.status === "draft" && (
                      <>
                        <Link href={`/dashboard/design-projects/${project.id}/edit`}>
                          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {(project.budget_min || project.budget_max) && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {project.budget_min && project.budget_max
                        ? `${Number(project.budget_min).toLocaleString()} - ${Number(project.budget_max).toLocaleString()} ${project.currency}`
                        : project.budget_max
                        ? `${t("upTo")} ${Number(project.budget_max).toLocaleString()} ${project.currency}`
                        : `${t("from")} ${Number(project.budget_min).toLocaleString()} ${project.currency}`}
                    </div>
                  )}
                  {project.deadline && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {project.proposals_count} {t("proposals")}
                  </div>
                  {project.assigned_designer_name && (
                    <div className="flex items-center gap-1 text-amber-600 font-medium">
                      {t("assignedTo")}: {project.assigned_designer_name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
