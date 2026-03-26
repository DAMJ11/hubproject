"use client";

import { useState } from "react";
import { Award, Plus, Trash2, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { CertificationItem } from "@/lib/data/certifications";

interface Props {
  initialCerts: CertificationItem[];
}

export default function CertificationsManager({ initialCerts }: Props) {
  const t = useTranslations("Certifications");
  const locale = useLocale();
  const [certs, setCerts] = useState<CertificationItem[]>(initialCerts);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    issuedBy: "",
    certificateUrl: "",
    issuedAt: "",
    expiresAt: "",
  });

  const refreshCerts = async () => {
    try {
      const res = await fetch("/api/manufacturers/certifications");
      const data = await res.json();
      if (data.success) setCerts(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/manufacturers/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          issuedBy: form.issuedBy || null,
          certificateUrl: form.certificateUrl || null,
          issuedAt: form.issuedAt || null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm({ name: "", issuedBy: "", certificateUrl: "", issuedAt: "", expiresAt: "" });
        refreshCerts();
        toast.success(t("certAdded"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("certAddError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/manufacturers/certifications?id=${id}`, { method: "DELETE" });
      setCerts((prev) => prev.filter((c) => c.id !== id));
      toast.success(t("certDeleted"));
    } catch (err) {
      console.error(err);
      toast.error(t("certDeleteError"));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-brand-600 hover:bg-brand-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> {t("add")}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-white">{t("newCertification")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("nameLabel")}</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("namePlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("issuedBy")}</label>
              <Input value={form.issuedBy} onChange={(e) => setForm({ ...form, issuedBy: e.target.value })} placeholder={t("issuedByPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("issuedAt")}</label>
              <Input type="date" value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("expiresAt")}</label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={saving || !form.name.trim()} className="bg-brand-600 hover:bg-brand-700 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("save")}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
          </div>
        </div>
      )}

      {certs.length === 0 ? (
        <EmptyState icon={Award} title={t("empty")} description={t("emptyHint")} />
      ) : (
        <div className="space-y-3">
          {certs.map((cert) => (
            <div key={cert.id} className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    cert.is_expired
                      ? "bg-red-50 dark:bg-red-900/30"
                      : cert.is_verified
                        ? "bg-green-50 dark:bg-green-900/30"
                        : "bg-yellow-50 dark:bg-yellow-900/30"
                  }`}>
                    {cert.is_expired ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : cert.is_verified ? (
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <Award className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {cert.name}
                      {cert.is_verified && (
                        <StatusBadge entity="certifications" status="verified" />
                      )}
                      {cert.is_expired && (
                        <StatusBadge entity="certifications" status="expired" />
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      {cert.issued_by && <span>{t("by", { issuer: cert.issued_by })}</span>}
                      {cert.issued_at && <span>{t("from", { date: new Date(cert.issued_at).toLocaleDateString(locale) })}</span>}
                      {cert.expires_at && <span>{t("until", { date: new Date(cert.expires_at).toLocaleDateString(locale) })}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(cert.id)} className="text-gray-400 hover:text-red-500 p-1" aria-label={t("delete")}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
