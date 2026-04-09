"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Pencil,
  MapPin,
  Globe,
  Phone,
  Mail,
  Users,
  Calendar,
  FileText,
  Briefcase,
  Handshake,
  Loader2,
  ExternalLink,
  Save,
  X,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CompanyData {
  id: number;
  name: string;
  slug: string;
  type: string;
  legal_id: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  website: string | null;
  instagram_handle: string | null;
  brand_categories: string | null;
  brand_tagline: string | null;
  ships_worldwide: boolean;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  country: string;
  employee_count: string | null;
  founded_year: number | null;
  is_verified: boolean;
  is_active: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface OwnerData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface StatsData {
  rfqProjects: number;
  proposals: number;
  contracts: number;
}

export default function CompanyDetail({ companyId }: { companyId: string }) {
  const t = useTranslations("AdminCompanyDetail");
  const router = useRouter();

  const [company, setCompany] = useState<CompanyData | null>(null);
  const [owner, setOwner] = useState<OwnerData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string | number | boolean | null>>({});

  const fetchCompany = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("loadError"));
        return;
      }
      setCompany(data.company);
      setOwner(data.owner);
      setStats(data.stats);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [companyId, t]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleVerify = async (verified: boolean) => {
    setActionLoading("verify");
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_verified: verified }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(verified ? t("verified") : t("unverified"));
        fetchCompany();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error(t("actionError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (active: boolean) => {
    setActionLoading("status");
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: active }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(active ? t("activated") : t("blocked"));
        fetchCompany();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error(t("actionError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading("delete");
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("deleted"));
        router.push("/dashboard/companies");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error(t("actionError"));
    } finally {
      setActionLoading(null);
    }
  };

  const startEditing = () => {
    if (!company) return;
    setEditForm({
      name: company.name,
      description: company.description ?? "",
      phone: company.phone ?? "",
      email: company.email ?? "",
      website: company.website ?? "",
      instagram_handle: company.instagram_handle ?? "",
      address_line1: company.address_line1 ?? "",
      city: company.city ?? "",
      state: company.state ?? "",
      country: company.country,
      employee_count: company.employee_count ?? "",
      founded_year: company.founded_year ?? "",
      legal_id: company.legal_id ?? "",
      brand_tagline: company.brand_tagline ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setActionLoading("save");
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("saved"));
        setEditing(false);
        fetchCompany();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error(t("actionError"));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard/companies")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
        </Button>
        <p className="text-gray-500">{t("notFound")}</p>
      </div>
    );
  }

  const typeBadge = company.type === "brand"
    ? "bg-purple-100 text-purple-700"
    : "bg-teal-100 text-teal-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/dashboard/companies")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
        </Button>
        <div className="flex items-center gap-2">
          {!editing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Pencil className="w-4 h-4 mr-1" /> {t("edit")}
            </Button>
          )}
          {editing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
                disabled={actionLoading === "save"}
              >
                <X className="w-4 h-4 mr-1" /> {t("cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={actionLoading === "save"}
              >
                {actionLoading === "save" ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                {t("save")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Company info card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-24 h-24 rounded-xl object-cover border"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>

          {/* Main info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {editing ? (
                <Input
                  value={String(editForm.name ?? "")}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-bold max-w-md"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {company.name}
                </h1>
              )}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeBadge}`}>
                {company.type === "brand" ? t("typeBrand") : t("typeManufacturer")}
              </span>
              {company.is_verified && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                  <CheckCircle className="w-3 h-3" /> {t("verifiedBadge")}
                </span>
              )}
              {!company.is_active && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                  <XCircle className="w-3 h-3" /> {t("inactive")}
                </span>
              )}
            </div>

            {editing ? (
              <textarea
                value={String(editForm.description ?? "")}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
              />
            ) : (
              company.description && (
                <p className="text-gray-600 dark:text-gray-400">{company.description}</p>
              )
            )}

            {company.brand_tagline && !editing && (
              <p className="text-sm text-gray-500 italic">&quot;{company.brand_tagline}&quot;</p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {company.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {company.city}{company.state ? `, ${company.state}` : ""}, {company.country}
                </span>
              )}
              {company.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {company.phone}
                </span>
              )}
              {company.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {company.email}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-brand-600 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" /> {t("website")}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {company.instagram_handle && (
                <span className="flex items-center gap-1">
                  <Instagram className="w-3.5 h-3.5" /> @{company.instagram_handle}
                </span>
              )}
              {company.employee_count && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {company.employee_count} {t("employees")}
                </span>
              )}
              {company.founded_year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {t("founded")} {company.founded_year}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit form fields (when editing) */}
      {editing && (
        <Card className="p-6">
          <h2 className="font-semibold mb-4">{t("editDetails")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldPhone")}</label>
              <Input
                value={String(editForm.phone ?? "")}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldEmail")}</label>
              <Input
                value={String(editForm.email ?? "")}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldWebsite")}</label>
              <Input
                value={String(editForm.website ?? "")}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldInstagram")}</label>
              <Input
                value={String(editForm.instagram_handle ?? "")}
                onChange={(e) => setEditForm({ ...editForm, instagram_handle: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldAddress")}</label>
              <Input
                value={String(editForm.address_line1 ?? "")}
                onChange={(e) => setEditForm({ ...editForm, address_line1: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldCity")}</label>
              <Input
                value={String(editForm.city ?? "")}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldState")}</label>
              <Input
                value={String(editForm.state ?? "")}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldCountry")}</label>
              <Input
                value={String(editForm.country ?? "")}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldEmployees")}</label>
              <Input
                value={String(editForm.employee_count ?? "")}
                onChange={(e) => setEditForm({ ...editForm, employee_count: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldFoundedYear")}</label>
              <Input
                type="number"
                value={String(editForm.founded_year ?? "")}
                onChange={(e) => setEditForm({ ...editForm, founded_year: e.target.value ? Number(e.target.value) : "" })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldLegalId")}</label>
              <Input
                value={String(editForm.legal_id ?? "")}
                onChange={(e) => setEditForm({ ...editForm, legal_id: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fieldTagline")}</label>
              <Input
                value={String(editForm.brand_tagline ?? "")}
                onChange={(e) => setEditForm({ ...editForm, brand_tagline: e.target.value })}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Stats + Owner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t("statsTitle")}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{stats?.rfqProjects ?? 0}</p>
              <p className="text-xs text-gray-500">{t("statsProjects")}</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <Briefcase className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold">{stats?.proposals ?? 0}</p>
              <p className="text-xs text-gray-500">{t("statsProposals")}</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <Handshake className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{stats?.contracts ?? 0}</p>
              <p className="text-xs text-gray-500">{t("statsContracts")}</p>
            </div>
          </div>
        </Card>

        {/* Owner */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t("ownerTitle")}</h2>
          {owner ? (
            <div className="space-y-2">
              <p className="font-medium">{owner.first_name} {owner.last_name}</p>
              <p className="text-sm text-gray-500">{owner.email}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  owner.role === "super_admin" ? "bg-red-100 text-red-700" :
                  owner.role === "admin" ? "bg-purple-100 text-purple-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {owner.role}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  owner.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {owner.is_active ? t("ownerActive") : t("ownerInactive")}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {t("ownerSince")} {new Date(owner.created_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t("noOwner")}</p>
          )}
        </Card>
      </div>

      {/* Internal info */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t("internalInfo")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t("fieldId")}</p>
            <p className="font-mono">{company.id}</p>
          </div>
          <div>
            <p className="text-gray-500">{t("fieldSlug")}</p>
            <p className="font-mono">{company.slug}</p>
          </div>
          <div>
            <p className="text-gray-500">{t("fieldCreated")}</p>
            <p>{new Date(company.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">{t("fieldUpdated")}</p>
            <p>{new Date(company.updated_at).toLocaleDateString()}</p>
          </div>
          {company.legal_id && (
            <div>
              <p className="text-gray-500">{t("fieldLegalId")}</p>
              <p className="font-mono">{company.legal_id}</p>
            </div>
          )}
          {company.brand_categories && (
            <div className="col-span-2">
              <p className="text-gray-500">{t("fieldCategories")}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {JSON.parse(company.brand_categories).map((cat: string) => (
                  <span key={cat} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-xs">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Admin actions */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t("actionsTitle")}</h2>
        <div className="flex flex-wrap gap-3">
          {/* Verify / Unverify */}
          {company.is_verified ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVerify(false)}
              disabled={!!actionLoading}
            >
              {actionLoading === "verify" ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <ShieldOff className="w-4 h-4 mr-1" />
              )}
              {t("removeVerification")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVerify(true)}
              disabled={!!actionLoading}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              {actionLoading === "verify" ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-1" />
              )}
              {t("verify")}
            </Button>
          )}

          {/* Activate / Block */}
          {company.is_active ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleActive(false)}
              disabled={!!actionLoading}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {actionLoading === "status" ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              {t("block")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleActive(true)}
              disabled={!!actionLoading}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              {actionLoading === "status" ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              {t("activate")}
            </Button>
          )}

          {/* Delete (soft) */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!!actionLoading}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" /> {t("delete")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("confirmDeleteDesc", { name: company.name })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {t("confirmDelete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}
