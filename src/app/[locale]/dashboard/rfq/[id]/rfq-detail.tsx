"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Pencil,
  Save,
  X,
  Loader2,
  Calendar,
  Package,
  DollarSign,
  Leaf,
  Users,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Trash2,
  UserPlus,
  Search,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/currency";

interface RfqData {
  id: number;
  code: string;
  title: string;
  description: string | null;
  project_type: string | null;
  brand_company_id: number;
  category_id: number;
  category_name: string;
  brand_name: string;
  brand_city: string | null;
  quantity: number;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  deadline: string | null;
  proposals_deadline: string | null;
  status: string;
  requires_sample: boolean;
  preferred_materials: string | null;
  sustainability_priority: boolean;
  proposals_count: number;
  created_at: string;
  updated_at: string;
  materials: Array<{
    id: number;
    material_type: string;
    composition: string | null;
    recycled_percentage: number | null;
    specifications: string | null;
  }>;
  attachments: Array<{
    id: number;
    file_name: string;
    file_url: string;
    file_type: string | null;
  }>;
}

interface AdminNote {
  id: number;
  content: string;
  admin_name: string;
  created_at: string;
}

const STATUS_OPTIONS = ["draft", "open", "evaluating", "awarded", "cancelled", "expired"];

export default function RfqDetail({ rfqId, userRole }: { rfqId: string; userRole: string }) {
  const t = useTranslations("RFQDetail");
  const tStatus = useTranslations("RFQ.status");
  const locale = useLocale();
  const router = useRouter();
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  const [rfq, setRfq] = useState<RfqData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string | number | boolean | null>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Admin notes state
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Assign to manufacturer state
  const [showAssign, setShowAssign] = useState(false);
  const [mfrSearch, setMfrSearch] = useState("");
  const [mfrResults, setMfrResults] = useState<Array<{ id: number; name: string; city: string | null }>>([]);
  const [mfrSearching, setMfrSearching] = useState(false);
  const [selectedMfr, setSelectedMfr] = useState<{ id: number; name: string } | null>(null);
  const [assignAmount, setAssignAmount] = useState("");
  const [assignTerms, setAssignTerms] = useState("");
  const [assigning, setAssigning] = useState(false);

  const formatPrice = (amount: number | null) => {
    if (amount === null) return "—";
    return formatCurrency(amount, locale);
  };

  const fetchRfq = useCallback(async () => {
    try {
      const res = await fetch(`/api/rfq/${rfqId}`);
      const data = await res.json();
      if (data.success) {
        setRfq(data.data);
      } else {
        toast.error(t("loadError"));
      }
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [rfqId, t]);

  const fetchNotes = useCallback(async () => {
    if (!isAdmin) return;
    setNotesLoading(true);
    try {
      const res = await fetch(`/api/admin/notes?entity_type=rfq_project&entity_id=${rfqId}`);
      const data = await res.json();
      if (data.success) setNotes(data.notes);
    } catch {
      // silent
    } finally {
      setNotesLoading(false);
    }
  }, [rfqId, isAdmin]);

  useEffect(() => {
    fetchRfq();
    fetchNotes();
  }, [fetchRfq, fetchNotes]);

  const startEditing = () => {
    if (!rfq) return;
    setEditForm({
      title: rfq.title,
      description: rfq.description ?? "",
      quantity: rfq.quantity,
      budgetMin: rfq.budget_min ?? "",
      budgetMax: rfq.budget_max ?? "",
      deadline: rfq.deadline ? rfq.deadline.split("T")[0] : "",
      proposalsDeadline: rfq.proposals_deadline ? rfq.proposals_deadline.split("T")[0] : "",
      preferredMaterials: rfq.preferred_materials ?? "",
      status: rfq.status,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!rfq) return;
    setActionLoading("save");
    try {
      const payload: Record<string, unknown> = { id: rfq.id };
      if (editForm.status !== rfq.status) payload.status = editForm.status;
      if (editForm.title !== rfq.title) payload.title = editForm.title;
      if (editForm.description !== (rfq.description ?? "")) payload.description = editForm.description;
      if (Number(editForm.quantity) !== rfq.quantity) payload.quantity = Number(editForm.quantity);
      if (editForm.budgetMin !== "" && Number(editForm.budgetMin) !== rfq.budget_min) payload.budgetMin = Number(editForm.budgetMin);
      if (editForm.budgetMax !== "" && Number(editForm.budgetMax) !== rfq.budget_max) payload.budgetMax = Number(editForm.budgetMax);
      if (editForm.deadline) payload.deadline = editForm.deadline;
      if (editForm.proposalsDeadline) payload.proposalsDeadline = editForm.proposalsDeadline;
      if (editForm.preferredMaterials !== (rfq.preferred_materials ?? "")) payload.preferredMaterials = editForm.preferredMaterials;

      const res = await fetch("/api/rfq", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("saved"));
        setEditing(false);
        fetchRfq();
      } else {
        toast.error(data.message || t("actionError"));
      }
    } catch {
      toast.error(t("actionError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: "rfq_project",
          entity_id: Number(rfqId),
          content: newNote.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewNote("");
        fetchNotes();
        toast.success(t("noteAdded"));
      } else {
        toast.error(data.error || t("actionError"));
      }
    } catch {
      toast.error(t("actionError"));
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const res = await fetch(`/api/admin/notes?id=${noteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchNotes();
        toast.success(t("noteDeleted"));
      }
    } catch {
      toast.error(t("actionError"));
    }
  };

  // Search manufacturers for assignment
  const searchManufacturers = async (q: string) => {
    if (q.length < 2) { setMfrResults([]); return; }
    setMfrSearching(true);
    try {
      const res = await fetch(`/api/companies/search?q=${encodeURIComponent(q)}&type=manufacturer&limit=5`);
      const data = await res.json();
      if (data.success) setMfrResults(data.companies ?? data.data ?? []);
    } catch { /* silent */ }
    finally { setMfrSearching(false); }
  };

  const handleAssign = async () => {
    if (!selectedMfr || !assignAmount) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/admin/rfq/${rfqId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manufacturerCompanyId: selectedMfr.id,
          totalAmount: Number(assignAmount),
          terms: assignTerms || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("assignSuccess"));
        setShowAssign(false);
        setSelectedMfr(null);
        setAssignAmount("");
        setAssignTerms("");
        fetchRfq();
      } else {
        toast.error(data.message || t("actionError"));
      }
    } catch {
      toast.error(t("actionError"));
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard/rfq")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
        </Button>
        <p className="text-gray-500">{t("notFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/dashboard/rfq")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
        </Button>
        {isAdmin && !editing && (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Pencil className="w-4 h-4 mr-1" /> {t("edit")}
          </Button>
        )}
        {editing && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={actionLoading === "save"}>
              <X className="w-4 h-4 mr-1" /> {t("cancel")}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={actionLoading === "save"}>
              {actionLoading === "save" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              {t("save")}
            </Button>
          </div>
        )}
      </div>

      {/* Main info */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{rfq.code}</span>
            {editing ? (
              <select
                value={String(editForm.status)}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="text-xs border rounded px-2 py-1 dark:bg-slate-800 dark:border-slate-700"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{tStatus(s)}</option>
                ))}
              </select>
            ) : (
              <StatusBadge entity="projects" status={rfq.status} />
            )}
            {rfq.sustainability_priority && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 inline-flex items-center gap-1">
                <Leaf className="w-3 h-3" /> {t("eco")}
              </span>
            )}
          </div>

          {editing ? (
            <Input
              value={String(editForm.title ?? "")}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="text-xl font-bold"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{rfq.title}</h1>
          )}

          {editing ? (
            <textarea
              value={String(editForm.description ?? "")}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
            />
          ) : (
            rfq.description && <p className="text-gray-600 dark:text-gray-400">{rfq.description}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> {rfq.brand_name}
            </span>
            {rfq.brand_city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {rfq.brand_city}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> {rfq.category_name}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {rfq.proposals_count} {t("proposals")}
            </span>
          </div>
        </div>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specs */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t("specsTitle")}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {t("quantity")}</span>
              {editing ? (
                <Input
                  type="number"
                  value={String(editForm.quantity ?? "")}
                  onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                  className="w-32 text-right"
                />
              ) : (
                <span className="font-medium">{rfq.quantity} {t("units")}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {t("budget")}</span>
              {editing ? (
                <div className="flex gap-1">
                  <Input
                    type="number"
                    value={String(editForm.budgetMin ?? "")}
                    onChange={(e) => setEditForm({ ...editForm, budgetMin: e.target.value })}
                    className="w-24 text-right"
                    placeholder="Min"
                  />
                  <span className="self-center">–</span>
                  <Input
                    type="number"
                    value={String(editForm.budgetMax ?? "")}
                    onChange={(e) => setEditForm({ ...editForm, budgetMax: e.target.value })}
                    className="w-24 text-right"
                    placeholder="Max"
                  />
                </div>
              ) : (
                <span className="font-medium">{formatPrice(rfq.budget_min)} – {formatPrice(rfq.budget_max)}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {t("deadline")}</span>
              {editing ? (
                <Input
                  type="date"
                  value={String(editForm.deadline ?? "")}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  className="w-40"
                />
              ) : (
                <span className="font-medium">{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : "—"}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t("proposalsDeadline")}</span>
              {editing ? (
                <Input
                  type="date"
                  value={String(editForm.proposalsDeadline ?? "")}
                  onChange={(e) => setEditForm({ ...editForm, proposalsDeadline: e.target.value })}
                  className="w-40"
                />
              ) : (
                <span className="font-medium">{rfq.proposals_deadline ? new Date(rfq.proposals_deadline).toLocaleDateString() : "—"}</span>
              )}
            </div>
            {rfq.requires_sample && (
              <div className="flex justify-between">
                <span className="text-gray-500">{t("sampleRequired")}</span>
                <span className="font-medium text-green-600">{t("yes")}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Materials */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t("materialsTitle")}</h2>
          {rfq.preferred_materials && !editing && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rfq.preferred_materials}</p>
          )}
          {editing && (
            <textarea
              value={String(editForm.preferredMaterials ?? "")}
              onChange={(e) => setEditForm({ ...editForm, preferredMaterials: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3 dark:bg-slate-800 dark:border-slate-700"
              placeholder={t("preferredMaterialsPlaceholder")}
            />
          )}
          {rfq.materials.length > 0 ? (
            <div className="space-y-2">
              {rfq.materials.map((m) => (
                <div key={m.id} className="border dark:border-slate-700 rounded-lg p-3 text-sm">
                  <p className="font-medium">{m.material_type}</p>
                  {m.composition && <p className="text-gray-500">{m.composition}</p>}
                  {m.recycled_percentage !== null && m.recycled_percentage > 0 && (
                    <span className="text-xs text-green-600">{m.recycled_percentage}% {t("recycled")}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t("noMaterials")}</p>
          )}
        </Card>
      </div>

      {/* Internal info */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t("internalInfo")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t("fieldId")}</p>
            <p className="font-mono">{rfq.id}</p>
          </div>
          <div>
            <p className="text-gray-500">{t("fieldCode")}</p>
            <p className="font-mono">{rfq.code}</p>
          </div>
          <div>
            <p className="text-gray-500">{t("fieldCreated")}</p>
            <p>{new Date(rfq.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">{t("fieldUpdated")}</p>
            <p>{new Date(rfq.updated_at).toLocaleDateString()}</p>
          </div>
          {rfq.project_type && (
            <div className="col-span-2">
              <p className="text-gray-500">{t("fieldProjectType")}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {JSON.parse(rfq.project_type).map((pt: string) => (
                  <span key={pt} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-xs">{pt}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Admin: Assign to Manufacturer */}
      {isAdmin && !["awarded", "cancelled", "expired"].includes(rfq.status) && (
        <Card className="p-6">
          {!showAssign ? (
            <Button variant="outline" onClick={() => setShowAssign(true)} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" /> {t("assignToManufacturer")}
            </Button>
          ) : (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> {t("assignToManufacturer")}
              </h2>

              {/* Manufacturer search */}
              {!selectedMfr ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={t("searchManufacturer")}
                      value={mfrSearch}
                      onChange={(e) => { setMfrSearch(e.target.value); searchManufacturers(e.target.value); }}
                      className="pl-9"
                    />
                  </div>
                  {mfrSearching && <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto" />}
                  {mfrResults.length > 0 && (
                    <div className="border dark:border-slate-700 rounded-lg divide-y dark:divide-slate-700 max-h-40 overflow-y-auto">
                      {mfrResults.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedMfr({ id: m.id, name: m.name }); setMfrResults([]); setMfrSearch(""); }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{m.name}</span>
                          {m.city && <span className="text-xs text-gray-400">({m.city})</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">{selectedMfr.name}</span>
                  <button onClick={() => setSelectedMfr(null)} className="ml-auto text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Amount & Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t("contractAmount")} ({rfq.currency})</label>
                  <Input
                    type="number"
                    value={assignAmount}
                    onChange={(e) => setAssignAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t("contractTerms")}</label>
                  <Input
                    value={assignTerms}
                    onChange={(e) => setAssignTerms(e.target.value)}
                    placeholder={t("termsPlaceholder")}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setShowAssign(false); setSelectedMfr(null); }}>
                  {t("cancel")}
                </Button>
                <Button size="sm" onClick={handleAssign} disabled={assigning || !selectedMfr || !assignAmount}>
                  {assigning ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                  {t("confirmAssign")}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Admin Notes Panel */}
      {isAdmin && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t("notesTitle")}
          </h2>

          {/* New note input */}
          <div className="flex gap-2 mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              rows={2}
              className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 resize-none"
            />
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={savingNote || !newNote.trim()}
              className="self-end"
            >
              {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>

          {/* Notes list */}
          {notesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : notes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">{t("noNotes")}</p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="border dark:border-slate-700 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{note.admin_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title={t("deleteNote")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
