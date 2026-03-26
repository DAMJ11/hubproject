"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, Lock, Bell, Shield, Eye, EyeOff, Save, Camera, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { SettingsUser } from "@/lib/data/settings";

interface SettingsFormProps {
  user: SettingsUser;
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const t = useTranslations("Settings");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailMessages: true,
    emailPromos: false,
    pushBookings: true,
    pushMessages: true,
    pushPromos: false,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  const handleSaveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);

    await new Promise((resolve) => setTimeout(resolve, 450));

    setSavingProfile(false);
    toast.success(t("profileSaved"));
  };

  const handleSaveNotifications = async () => {
    if (savingNotifications) return;
    setSavingNotifications(true);

    await new Promise((resolve) => setTimeout(resolve, 450));

    setSavingNotifications(false);
    toast.success(t("notificationsSaved"));
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("subtitle")}</p>
        </div>

        <Tabs defaultValue="perfil">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger value="perfil" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-600 data-[state=active]:text-brand-600 data-[state=active]:shadow-none gap-2">
              <User className="w-4 h-4" />
              {t("tabProfile")}
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-600 data-[state=active]:text-brand-600 data-[state=active]:shadow-none gap-2">
              <Shield className="w-4 h-4" />
              {t("tabSecurity")}
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-600 data-[state=active]:text-brand-600 data-[state=active]:shadow-none gap-2">
              <Bell className="w-4 h-4" />
              {t("tabNotifications")}
            </TabsTrigger>
          </TabsList>

        <TabsContent value="perfil">
          <Card className="p-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <Avatar className="w-20 h-20 text-2xl">
                  <AvatarFallback className="bg-brand-600 text-white font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border hover:bg-gray-50">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                <p className="text-sm text-gray-500">{user.role === "admin" ? t("roleAdmin") : t("roleClient")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("firstName")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="pl-10"
                    placeholder={t("firstNamePlaceholder")}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("lastName")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="pl-10"
                    placeholder={t("lastNamePlaceholder")}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("phone")}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    placeholder={t("phonePlaceholder")}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button className="bg-brand-600 hover:bg-brand-700 gap-2" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingProfile ? t("saving") : t("saveChanges")}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-6">{t("changePassword")}</h3>
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("currentPassword")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("newPassword")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="pl-10"
                    placeholder={t("newPasswordPlaceholder")}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("confirmPassword")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                    placeholder={t("confirmPasswordPlaceholder")}
                  />
                </div>
              </div>
              <Button className="bg-brand-600 hover:bg-brand-700 gap-2 mt-2">
                <Shield className="w-4 h-4" />
                {t("updatePassword")}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-6">{t("notificationPreferences")}</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">{t("emailSection")}</h4>
                <div className="space-y-3">
                  {[
                    { key: "emailBookings" as const, label: t("notifBookings"), desc: t("notifBookingsDesc") },
                    { key: "emailMessages" as const, label: t("notifMessages"), desc: t("notifMessagesDesc") },
                    { key: "emailPromos" as const, label: t("notifPromos"), desc: t("notifPromosDesc") },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        className="w-5 h-5 rounded text-brand-600 focus:ring-brand-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-3">{t("pushSection")}</h4>
                <div className="space-y-3">
                  {[
                    { key: "pushBookings" as const, label: t("pushBookings"), desc: t("pushBookingsDesc") },
                    { key: "pushMessages" as const, label: t("pushMessages"), desc: t("pushMessagesDesc") },
                    { key: "pushPromos" as const, label: t("pushPromos"), desc: t("pushPromosDesc") },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        className="w-5 h-5 rounded text-brand-600 focus:ring-brand-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button className="bg-brand-600 hover:bg-brand-700 gap-2" onClick={handleSaveNotifications} disabled={savingNotifications}>
                  {savingNotifications ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingNotifications ? t("saving") : t("savePreferences")}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
        </Tabs>
    </div>
  );
}
