"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, MapPin, CheckCircle, XCircle, List, Clock, DollarSign, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Proposal {
  id: number;
  price: string;
  estimated_days: number;
  concept_notes: string | null;
  status: string;
  submitted_at: string;
  responded_at: string | null;
  designer_name: string;
  designer_slug: string | null;
  designer_avatar: string | null;
  rating_avg: string;
  projects_completed: number;
  designer_country: string | null;
  designer_specialties: string | null;
}

interface ProjectDetail {
  id: number;
  code: string;
  title: string;
  description: string;
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
  assigned_designer_slug: string | null;
  proposals: Proposal[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  open: "bg-green-100 text-green-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const PROPOSAL_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  shortlisted: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-500",
};

interface DesignProjectDetailProps {
  projectId: number;
  userRole: string;
}

export default function DesignProjectDetail({ projectId, userRole }: DesignProjectDetailProps) {
  const t = useTranslations("DesignProjects");
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/design-projects/${projectId}`);
      const json = await res.json();
      if (json.success) {
        setProject(json.data);
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error(t("errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleProposalAction = async (proposalId: number, status: string) => {
    setActionLoading(proposalId);
    try {
      const res = await fetch(`/api/design-projects/${projectId}/proposals`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, status }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchProject();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error(t("errorUpdating"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/design-projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(t("statusUpdated"));
        fetchProject();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error(t("errorUpdating"));
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">{t("loading")}</div>;
  }

  if (!project) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Link href="/dashboard/design-projects">
          <Button variant="outline" className="mt-4">{t("backToList")}</Button>
        </Link>
      </div>
    );
  }

  const isBrand = userRole === "brand";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={isBrand ? "/dashboard/design-projects" : "/dashboard/design-opportunities"}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{project.code}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[project.status] || "bg-gray-100"}`}>
              {t(`status.${project.status}`)}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
        </div>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("projectDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm whitespace-pre-wrap">{project.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t("categoryLabel")}</span>
              <p className="font-medium">{t(`category.${project.category}`)}</p>
            </div>
            {project.season && (
              <div>
                <span className="text-muted-foreground">{t("seasonLabel")}</span>
                <p className="font-medium">{project.season}</p>
              </div>
            )}
            {(project.budget_min || project.budget_max) && (
              <div>
                <span className="text-muted-foreground">{t("budget")}</span>
                <p className="font-medium">
                  {project.budget_min && project.budget_max
                    ? `${Number(project.budget_min).toLocaleString()} - ${Number(project.budget_max).toLocaleString()} ${project.currency}`
                    : project.budget_max
                    ? `${t("upTo")} ${Number(project.budget_max).toLocaleString()} ${project.currency}`
                    : `${t("from")} ${Number(project.budget_min).toLocaleString()} ${project.currency}`}
                </p>
              </div>
            )}
            {project.deadline && (
              <div>
                <span className="text-muted-foreground">{t("deadline")}</span>
                <p className="font-medium">{new Date(project.deadline).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {project.assigned_designer_name && (
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
              <p className="text-sm font-medium text-amber-800">
                {t("assignedTo")}: {project.assigned_designer_name}
                {project.assigned_designer_slug && (
                  <Link href={`/designers/${project.assigned_designer_slug}`} className="ml-2 underline">
                    {t("viewProfile")}
                  </Link>
                )}
              </p>
            </div>
          )}

          {/* Status actions for brand */}
          {isBrand && (
            <div className="flex gap-2 pt-2">
              {project.status === "draft" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange("open")}>
                  {t("publishProject")}
                </Button>
              )}
              {project.status === "in_progress" && (
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => handleStatusChange("review")}>
                  {t("markReview")}
                </Button>
              )}
              {project.status === "review" && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange("completed")}>
                  {t("markCompleted")}
                </Button>
              )}
              {["draft", "open"].includes(project.status) && (
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleStatusChange("cancelled")}>
                  {t("cancelProject")}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proposals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            {t("proposalsTitle")} ({project.proposals?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!project.proposals || project.proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{t("noProposals")}</p>
          ) : (
            <div className="space-y-4">
              {project.proposals.map((prop) => (
                <div key={prop.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {prop.designer_avatar ? (
                        <img src={prop.designer_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-amber-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {prop.designer_slug ? (
                            <Link href={`/designers/${prop.designer_slug}`} className="hover:underline">
                              {prop.designer_name}
                            </Link>
                          ) : prop.designer_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {prop.designer_country && (
                            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{prop.designer_country}</span>
                          )}
                          {Number(prop.rating_avg) > 0 && (
                            <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-500" />{Number(prop.rating_avg).toFixed(1)}</span>
                          )}
                          <span>{prop.projects_completed} {t("projectsDone")}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROPOSAL_COLORS[prop.status] || "bg-gray-100"}`}>
                      {t(`proposalStatus.${prop.status}`)}
                    </span>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{Number(prop.price).toLocaleString()} {project.currency}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{prop.estimated_days} {t("days")}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(prop.submitted_at).toLocaleDateString()}
                    </div>
                  </div>

                  {prop.concept_notes && (
                    <p className="text-sm bg-slate-50 p-3 rounded">{prop.concept_notes}</p>
                  )}

                  {/* Actions for brand */}
                  {isBrand && prop.status === "submitted" && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-600 border-amber-300"
                        onClick={() => handleProposalAction(prop.id, "shortlisted")}
                        disabled={actionLoading === prop.id}
                      >
                        <List className="mr-1 h-3.5 w-3.5" />
                        {t("shortlist")}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleProposalAction(prop.id, "accepted")}
                        disabled={actionLoading === prop.id}
                      >
                        <CheckCircle className="mr-1 h-3.5 w-3.5" />
                        {t("accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300"
                        onClick={() => handleProposalAction(prop.id, "rejected")}
                        disabled={actionLoading === prop.id}
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        {t("reject")}
                      </Button>
                    </div>
                  )}
                  {isBrand && prop.status === "shortlisted" && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleProposalAction(prop.id, "accepted")}
                        disabled={actionLoading === prop.id}
                      >
                        <CheckCircle className="mr-1 h-3.5 w-3.5" />
                        {t("accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300"
                        onClick={() => handleProposalAction(prop.id, "rejected")}
                        disabled={actionLoading === prop.id}
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        {t("reject")}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
