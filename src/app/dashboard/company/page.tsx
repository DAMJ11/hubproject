"use client";

import { useState, useEffect, useCallback } from "react";
import { Factory, Save, Loader2, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CompanyData {
  id: number;
  name: string;
  slug: string;
  type: string;
  legal_id: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  country: string;
  employee_count: string | null;
  founded_year: number | null;
  is_verified: boolean;
}

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    website: "",
    addressLine1: "",
    city: "",
    state: "",
    country: "Colombia",
    employeeCount: "",
    foundedYear: "",
    legalId: "",
  });

  const fetchCompany = useCallback(async () => {
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const c = data.data[0];
        setCompany(c);
        setForm({
          name: c.name || "",
          description: c.description || "",
          phone: c.phone || "",
          website: c.website || "",
          addressLine1: c.address_line1 || "",
          city: c.city || "",
          state: c.state || "",
          country: c.country || "Colombia",
          employeeCount: c.employee_count || "",
          foundedYear: c.founded_year?.toString() || "",
          legalId: c.legal_id || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <Factory className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <h2 className="text-lg font-semibold text-gray-700 mb-1">Sin empresa asociada</h2>
        <p className="text-gray-500">Tu cuenta no está vinculada a ninguna empresa aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Mi Empresa
            {company.is_verified && <CheckCircle className="w-5 h-5 text-[#2563eb]" />}
          </h1>
          <p className="text-gray-500 mt-1">
            {company.type === "manufacturer" ? "Perfil de fabricante" : "Perfil de marca"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIT / ID Fiscal</label>
            <Input value={form.legalId} onChange={(e) => setForm({ ...form, legalId: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sitio Web</label>
            <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
        </div>

        <div className="border-t dark:border-slate-700 pt-4">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Ubicación
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
              <Input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad</label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departamento</label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">País</label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empleados</label>
            <select
              value={form.employeeCount}
              onChange={(e) => setForm({ ...form, employeeCount: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700"
            >
              <option value="">Seleccionar</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="500+">500+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Año fundación</label>
            <Input
              type="number"
              value={form.foundedYear}
              onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
              min="1900"
              max="2026"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar cambios
          </Button>
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Guardado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

