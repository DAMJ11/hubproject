"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Leaf, Clock, DollarSign, Building2, Send, ChevronLeft, ChevronRight,
  Calendar, X,
} from "lucide-react";
import { toast } from "sonner";

interface DesignProject {
  id: number;
  code: string;
  title: string;
  description?: string;
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
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  collections: "Collections",
  tech_packs: "Tech Packs",
  patterns: "Patterns",
  illustration: "Illustration",
  branding: "Branding",
  consulting: "Consulting",
};

export default function DesignOpportunitiesClient() {
  const t = useTranslations("DesignOpportunities");
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Proposal form state
  const [selectedProject, setSelectedProject] = useState<DesignProject | null>(null);
  const [proposalForm, setProposalForm] = useState({ price: "", estimatedDays: "", conceptNotes: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", "open");
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
  }, [categoryFilter, search, pagination.page, t]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmitProposal = async () => {
    if (!selectedProject) return;
    if (!proposalForm.price || Number(proposalForm.price) <= 0) {
      toast.error(t("priceRequired"));
      return;
    }
    if (!proposalForm.estimatedDays || Number(proposalForm.estimatedDays) <= 0) {
      toast.error(t("daysRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/design-projects/${selectedProject.id}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(t("proposalSubmitted"));
        setSelectedProject(null);
        setProposalForm({ price: "", estimatedDays: "", conceptNotes: "" });
        fetchProjects();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error(t("errorSubmitting"));
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["", "collections", "tech_packs", "patterns", "illustration", "branding", "consulting"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Leaf className="h-6 w-6 text-amber-600" />
        {t("title")}
      </h1>

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
            <Leaf className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t("noOpportunities")}</p>
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
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {CATEGORY_LABELS[project.category] || project.category}
                      </span>
                      {project.season && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                          {project.season}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {project.brand_name}
                    </p>
                  </div>
                  <Button
                    className="bg-amber-600 hover:bg-amber-700"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(project);
                      setProposalForm({ price: "", estimatedDays: "", conceptNotes: "" });
                    }}
                  >
                    <Send className="mr-1 h-3.5 w-3.5" />
                    {t("submitProposal")}
                  </Button>
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
                      {t("deadline")}: {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  )}
                  {project.proposals_deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {t("proposalsBy")}: {new Date(project.proposals_deadline).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Send className="h-3.5 w-3.5" />
                    {project.proposals_count} {t("proposals")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{pagination.page} / {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Proposal Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t("submitProposalFor")}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedProject(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{selectedProject.title}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("yourPrice")} ({selectedProject.currency}) *</label>
                <Input
                  type="number"
                  min="1"
                  value={proposalForm.price}
                  onChange={(e) => setProposalForm(f => ({ ...f, price: e.target.value }))}
                  placeholder={t("pricePlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("estimatedDays")} *</label>
                <Input
                  type="number"
                  min="1"
                  value={proposalForm.estimatedDays}
                  onChange={(e) => setProposalForm(f => ({ ...f, estimatedDays: e.target.value }))}
                  placeholder={t("daysPlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("conceptNotes")}</label>
                <textarea
                  className="w-full mt-1 rounded-md border px-3 py-2 text-sm min-h-[100px] resize-y"
                  value={proposalForm.conceptNotes}
                  onChange={(e) => setProposalForm(f => ({ ...f, conceptNotes: e.target.value }))}
                  placeholder={t("notesPlaceholder")}
                  maxLength={2000}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setSelectedProject(null)}>{t("cancel")}</Button>
                <Button
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={handleSubmitProposal}
                  disabled={submitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? t("submitting") : t("submit")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
