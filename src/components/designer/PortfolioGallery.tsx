"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Loader2, Trash2, Edit3, Eye, EyeOff, ImagePlus, X, Save, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "collections", label: "Collections" },
  { key: "tech_packs", label: "Tech Packs" },
  { key: "patterns", label: "Patterns" },
  { key: "illustration", label: "Illustrations" },
  { key: "branding", label: "Branding" },
  { key: "consulting", label: "Consulting" },
];

interface PortfolioItem {
  id: number;
  title: string;
  description: string | null;
  category: string;
  season: string | null;
  year: number | null;
  image_url: string | null;
  tags: string | null;
  is_public: boolean;
  views_count: number;
  likes_count: number;
  sort_order: number;
  created_at: string;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PortfolioGallery() {
  const t = useTranslations("DesignerPortfolio");
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "collections",
    season: "",
    year: "",
    imageUrl: "",
    tags: "",
    isPublic: true,
  });

  const fetchItems = useCallback(async () => {
    try {
      const url = filterCategory
        ? `/api/designer/portfolio?category=${filterCategory}`
        : "/api/designer/portfolio";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const resetForm = () => {
    setForm({ title: "", description: "", category: "collections", season: "", year: "", imageUrl: "", tags: "", isPublic: true });
    setEditingItem(null);
    setShowForm(false);
  };

  const openEditForm = (item: PortfolioItem) => {
    let tagsStr = "";
    try { tagsStr = JSON.parse(item.tags || "[]").join(", "); } catch { tagsStr = item.tags || ""; }
    setForm({
      title: item.title,
      description: item.description || "",
      category: item.category,
      season: item.season || "",
      year: item.year?.toString() || "",
      imageUrl: item.image_url || "",
      tags: tagsStr,
      isPublic: item.is_public,
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const onImagePicked = async (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageTooLarge"));
      return;
    }
    const base64 = await fileToBase64(file);
    setForm((p) => ({ ...p, imageUrl: base64 }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error(t("titleRequired")); return; }
    setSaving(true);
    try {
      const tagsArray = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : null,
        tags: tagsArray,
        ...(editingItem ? { id: editingItem.id } : {}),
      };

      const res = await fetch("/api/designer/portfolio", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingItem ? t("itemUpdated") : t("itemCreated"));
        resetForm();
        fetchItems();
      } else {
        toast.error(data.message || t("errorSaving"));
      }
    } catch {
      toast.error(t("errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/designer/portfolio?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(t("itemDeleted"));
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        toast.error(data.message || t("errorDeleting"));
      }
    } catch {
      toast.error(t("errorDeleting"));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleVisibility = async (item: PortfolioItem) => {
    try {
      const res = await fetch("/api/designer/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isPublic: !item.is_public }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_public: !i.is_public } : i))
        );
      }
    } catch {
      toast.error(t("errorSaving"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> {t("addItem")}
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory("")}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !filterCategory ? "bg-amber-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("all")}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilterCategory(c.key)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              filterCategory === c.key ? "bg-amber-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{editingItem ? t("editItem") : t("newItem")}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            {/* Image upload area */}
            <div className="relative">
              {form.imageUrl ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setForm((p) => ({ ...p, imageUrl: "" }))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-amber-400 transition">
                  <ImagePlus className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">{t("uploadImage")}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => onImagePicked(e.target.files?.[0] || null)} />
                </label>
              )}
            </div>

            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={t("itemTitle")}
            />

            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder={t("itemDescription")}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
              <Input
                value={form.season}
                onChange={(e) => setForm((p) => ({ ...p, season: e.target.value }))}
                placeholder={t("season")}
              />
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                placeholder={t("year")}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))}
                  className="rounded"
                />
                {t("public")}
              </label>
            </div>

            <Input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              placeholder={t("tagsPlaceholder")}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>{t("cancel")}</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editingItem ? t("updateItem") : t("createItem")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <ImagePlus className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold text-gray-500">{t("emptyTitle")}</h3>
          <p className="text-gray-400 text-sm">{t("emptySubtitle")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            let parsedTags: string[] = [];
            try { parsedTags = JSON.parse(item.tags || "[]"); } catch { /* empty */ }
            return (
              <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImagePlus className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => openEditForm(item)}
                      className="bg-white rounded-full p-2 hover:bg-gray-100 transition"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleVisibility(item)}
                      className="bg-white rounded-full p-2 hover:bg-gray-100 transition"
                    >
                      {item.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="bg-white rounded-full p-2 hover:bg-red-50 transition text-red-500"
                    >
                      {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Visibility badge */}
                  {!item.is_public && (
                    <span className="absolute top-2 left-2 bg-gray-800/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <EyeOff className="h-3 w-3" /> {t("hidden")}
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {CATEGORIES.find((c) => c.key === item.category)?.label || item.category}
                    {item.season && ` · ${item.season}`}
                    {item.year && ` ${item.year}`}
                  </p>
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {parsedTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500">
                          {tag}
                        </span>
                      ))}
                      {parsedTags.length > 3 && (
                        <span className="text-xs text-gray-400">+{parsedTags.length - 3}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{item.views_count} views</span>
                    <span>{item.likes_count} likes</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
