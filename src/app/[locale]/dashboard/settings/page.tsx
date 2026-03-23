"use client";

import { useEffect, useState } from "react";
import { useDashboardUser } from "@/contexts/DashboardUserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { User, Mail, Phone, Lock, Bell, Shield, Eye, EyeOff, Save, Camera, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export default function SettingsPage() {
  const { user } = useDashboardUser();
  const t = useTranslations("Settings");
  const [activeTab, setActiveTab] = useState("perfil");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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
  const [profileSaved, setProfileSaved] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    setProfileSaved(false);

    await new Promise((resolve) => setTimeout(resolve, 450));

    setSavingProfile(false);
    setProfileSaved(true);
  };

  const handleSaveNotifications = async () => {
    if (savingNotifications) return;
    setSavingNotifications(true);
    setNotificationsSaved(false);

    await new Promise((resolve) => setTimeout(resolve, 450));

    setSavingNotifications(false);
    setNotificationsSaved(true);
  };

  const tabs = [
    { id: "perfil", label: t("tabProfile"), icon: User },
    { id: "seguridad", label: t("tabSecurity"), icon: Shield },
    { id: "notificaciones", label: t("tabNotifications"), icon: Bell },
  ];

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex gap-2 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-[#2563eb] border-[#2563eb]"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "perfil" && (
          <Card className="p-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-2xl font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
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

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-sm text-emerald-700">{profileSaved ? t("profileSaved") : ""}</p>
              <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] gap-2" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingProfile ? t("saving") : t("saveChanges")}
              </Button>
            </div>
          </Card>
        )}

        {activeTab === "seguridad" && (
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
              <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] gap-2 mt-2">
                <Shield className="w-4 h-4" />
                {t("updatePassword")}
              </Button>
            </div>
          </Card>
        )}

        {activeTab === "notificaciones" && (
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
                        className="w-5 h-5 rounded text-[#2563eb] focus:ring-[#2563eb]"
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
                        className="w-5 h-5 rounded text-[#2563eb] focus:ring-[#2563eb]"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-emerald-700">{notificationsSaved ? t("notificationsSaved") : ""}</p>
                <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] gap-2" onClick={handleSaveNotifications} disabled={savingNotifications}>
                  {savingNotifications ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingNotifications ? t("saving") : t("savePreferences")}
                </Button>
              </div>
            </div>
          </Card>
        )}
    </div>
  );
}

