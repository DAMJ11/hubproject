"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Plus, Home, Building, Pencil, Trash2, Star, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AddressItem } from "@/lib/data/addresses";

interface Props {
  initialAddresses: AddressItem[];
}

export default function AddressesManager({ initialAddresses }: Props) {
  const t = useTranslations("Addresses");
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    label: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);

  const getIcon = (label: string) => {
    if (label.toLowerCase().includes("oficina") || label.toLowerCase().includes("taller")) return Building;
    return Home;
  };

  const handleDeleteAddress = (addressId: number, label: string) => {
    setDeleteTarget({ id: addressId, label });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setAddresses((prev) => prev.filter((addr) => addr.id !== deleteTarget.id));
    toast.success(t("deleteSuccess"));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-brand-600 hover:bg-brand-700 gap-2">
          <Plus className="w-4 h-4" />
          {t("addButton")}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">{t("form.newTitle")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("form.label")}</label>
              <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder={t("form.labelPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("form.addressLine1")}</label>
              <Input value={formData.address_line1} onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })} placeholder={t("form.addressLine1Placeholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("form.complement")}</label>
              <Input value={formData.address_line2} onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })} placeholder={t("form.complementPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("form.city")}</label>
              <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder={t("form.cityPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("form.state")}</label>
              <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder={t("form.statePlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("form.postalCode")}</label>
              <Input value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} placeholder={t("form.postalCodePlaceholder")} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>{t("form.cancel")}</Button>
            <Button className="bg-brand-600 hover:bg-brand-700">{t("form.save")}</Button>
          </div>
        </Card>
      )}

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title={t("emptyAddresses")} description={t("emptyAddressesHint")} />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map((addr) => {
          const Icon = getIcon(addr.label);
          return (
            <Card key={addr.id} className={`p-5 relative ${addr.is_default ? "ring-2 ring-brand-600" : ""}`}>
              {addr.is_default && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-brand-600 text-white text-xs px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" /> {t("defaultBadge")}
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{addr.label}</h3>
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span>
                    {addr.address_line1}
                    {addr.address_line2 && <>, {addr.address_line2}</>}
                  </span>
                </p>
                <p className="pl-6">{addr.city}, {addr.state}</p>
                {addr.postal_code && <p className="pl-6">{t("postalCodeLabel", { code: addr.postal_code })}</p>}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-brand-600 gap-1">
                  <Pencil className="w-3.5 h-3.5" /> {t("edit")}
                </Button>
                {!addr.is_default && (
                  <>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-brand-600 gap-1">
                      <Star className="w-3.5 h-3.5" /> {t("setDefault")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-red-600 gap-1 ml-auto"
                      aria-label={t("deleteAriaLabel", { label: addr.label })}
                      onClick={() => handleDeleteAddress(addr.id, addr.label)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? t("deleteConfirm", { label: deleteTarget.label }) : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("form.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {t("deleteAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
