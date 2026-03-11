"use client";

import { useState, useEffect, useCallback } from "react";
import { Award, Plus, Trash2, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Certification {
  id: number;
  company_id: number;
  name: string;
  issued_by: string | null;
  certificate_url: string | null;
  issued_at: string | null;
  expires_at: string | null;
  is_verified: boolean;
  is_expired: boolean;
}

export default function CertificationsPage() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    issuedBy: "",
    certificateUrl: "",
    issuedAt: "",
    expiresAt: "",
  });

  const fetchCerts = useCallback(async () => {
    try {
      const res = await fetch("/api/manufacturers/certifications");
      const data = await res.json();
      if (data.success) setCerts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCerts();
  }, [fetchCerts]);

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
        fetchCerts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/manufacturers/certifications?id=${id}`, { method: "DELETE" });
      setCerts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificaciones</h1>
          <p className="text-gray-500 mt-1">Certificaciones de sostenibilidad y calidad</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
          <Plus className="w-4 h-4 mr-2" /> Agregar
        </Button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-white">Nueva certificación</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: GOTS, OEKO-TEX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emitido por</label>
              <Input value={form.issuedBy} onChange={(e) => setForm({ ...form, issuedBy: e.target.value })} placeholder="Organismo certificador" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha emisión</label>
              <Input type="date" value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha expiración</label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={saving || !form.name.trim()} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {certs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
          <Award className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No tienes certificaciones registradas</p>
          <p className="text-sm text-gray-400 mt-1">Las certificaciones mejoran tu puntuación verde</p>
        </div>
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
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Verificada</span>
                      )}
                      {cert.is_expired && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Expirada</span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      {cert.issued_by && <span>Por: {cert.issued_by}</span>}
                      {cert.issued_at && <span>Desde: {new Date(cert.issued_at).toLocaleDateString("es-CO")}</span>}
                      {cert.expires_at && <span>Hasta: {new Date(cert.expires_at).toLocaleDateString("es-CO")}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(cert.id)} className="text-gray-400 hover:text-red-500 p-1">
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

