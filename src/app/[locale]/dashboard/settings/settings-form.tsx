"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, Lock, Bell, Shield, Eye, EyeOff, Save, Camera, Loader2, CreditCard, ExternalLink, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { SettingsUser } from "@/lib/data/settings";

interface SettingsFormProps {
  user: SettingsUser;
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const t = useTranslations("Settings");
  const searchParams = useSearchParams();
  const subscriptionParam = searchParams.get("subscription");
  const defaultTab = subscriptionParam ? "billing" : "perfil";

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

  // Billing state
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingData, setBillingData] = useState<{
    plans: Array<{ id: number; slug: string; name: string; price_usd: number; target_role: string }>;
    subscription: {
      plan_slug: string;
      plan_name: string;
      price_usd: number;
      status: string;
      stripe_subscription_id: string | null;
      current_period_end: string;
      trial_ends_at: string | null;
    } | null;
  } | null>(null);
  const [billingError, setBillingError] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBilling = useCallback(async () => {
    setBillingLoading(true);
    setBillingError(false);
    try {
      const res = await fetch("/api/subscriptions");
      const json = await res.json();
      if (json.success) {
        setBillingData(json.data);
      } else {
        setBillingError(true);
      }
    } catch {
      setBillingError(true);
    } finally {
      setBillingLoading(false);
    }
  }, []);

  const handleCheckout = async (planSlug: string) => {
    setCheckoutLoading(planSlug);
    try {
      // First try subscriptions endpoint (handles free plans directly)
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_slug: planSlug }),
      });
      const json = await res.json();

      if (json.data?.requires_checkout) {
        // Paid plan — redirect to Stripe Checkout
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan_slug: planSlug }),
        });
        const checkoutJson = await checkoutRes.json();
        if (checkoutJson.success && checkoutJson.data?.checkout_url) {
          window.location.href = checkoutJson.data.checkout_url;
          return;
        }
        toast.error(checkoutJson.message || "Error");
      } else if (json.success) {
        // Free plan activated
        toast.success(json.message);
        fetchBilling();
      } else {
        toast.error(json.message || "Error");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (json.success && json.data?.portal_url) {
        window.location.href = json.data.portal_url;
        return;
      }
      toast.error(json.message || "Error");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm(t("cancelConfirm"))) return;
    setCancelLoading(true);
    try {
      const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success(t("cancelSuccess"));
        fetchBilling();
      } else {
        toast.error(json.message || "Error");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
      active: { label: t("statusActive"), className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
      trial: { label: t("statusTrial"), className: "bg-blue-100 text-blue-700", icon: AlertCircle },
      cancelled: { label: t("statusCancelled"), className: "bg-orange-100 text-orange-700", icon: XCircle },
      expired: { label: t("statusExpired"), className: "bg-gray-100 text-gray-700", icon: XCircle },
      past_due: { label: t("statusPastDue"), className: "bg-red-100 text-red-700", icon: AlertCircle },
    };
    const s = map[status] || map.expired;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
        <Icon className="w-3 h-3" />
        {s.label}
      </span>
    );
  };

  // Auto-load billing when coming back from Stripe
  useEffect(() => {
    if (subscriptionParam) {
      fetchBilling();
      if (subscriptionParam === "success") {
        toast.success("Suscripción activada correctamente");
      }
    }
  }, [subscriptionParam, fetchBilling]);

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

        <Tabs defaultValue={defaultTab}>
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
            <TabsTrigger value="billing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-600 data-[state=active]:text-brand-600 data-[state=active]:shadow-none gap-2" onClick={() => { if (!billingData && !billingLoading) fetchBilling(); }}>
              <CreditCard className="w-4 h-4" />
              {t("tabBilling")}
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

        <TabsContent value="billing">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-6">{t("billingTitle")}</h3>

            {billingLoading && (
              <div className="flex items-center gap-2 text-gray-500 py-8 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t("loadingBilling")}</span>
              </div>
            )}

            {billingError && (
              <div className="flex items-center gap-2 text-red-500 py-8 justify-center">
                <AlertCircle className="w-5 h-5" />
                <span>{t("billingError")}</span>
              </div>
            )}

            {billingData && !billingLoading && (
              <div className="space-y-6">
                {/* Current plan info */}
                {billingData.subscription ? (
                  <div className="border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{t("currentPlan")}</p>
                        <p className="text-xl font-bold text-gray-900">{billingData.subscription.plan_name}</p>
                      </div>
                      {getStatusBadge(billingData.subscription.status)}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>
                        <strong>${billingData.subscription.price_usd}</strong>{t("monthly")}
                      </span>
                      {billingData.subscription.trial_ends_at && billingData.subscription.status === "trial" && (
                        <span>{t("trialEnds")}: {new Date(billingData.subscription.trial_ends_at).toLocaleDateString()}</span>
                      )}
                      {billingData.subscription.status !== "trial" && (
                        <span>{t("nextBilling")}: {new Date(billingData.subscription.current_period_end).toLocaleDateString()}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {billingData.subscription.stripe_subscription_id && (
                        <Button variant="outline" className="gap-2" onClick={handlePortal} disabled={portalLoading}>
                          {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                          {t("manageBilling")}
                        </Button>
                      )}
                      {billingData.subscription.status !== "cancelled" && (
                        <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2" onClick={handleCancel} disabled={cancelLoading}>
                          {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          {t("cancelSubscription")}
                        </Button>
                      )}
                    </div>
                    {billingData.subscription.stripe_subscription_id && (
                      <p className="text-xs text-gray-400">{t("manageBillingDesc")}</p>
                    )}
                  </div>
                ) : (
                  <div className="border rounded-xl p-5 text-center space-y-2">
                    <p className="font-semibold text-gray-700">{t("noPlan")}</p>
                    <p className="text-sm text-gray-500">{t("noPlanDesc")}</p>
                  </div>
                )}

                {/* Available plans */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">{t("changePlan")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {billingData.plans
                      .filter((p) =>
                        user.role === "admin" ? true :
                        user.role === "brand" ? p.slug.startsWith("brand_") :
                        p.slug.startsWith("supplier_")
                      )
                      .map((plan) => {
                        const isCurrent = billingData.subscription?.plan_slug === plan.slug;
                        return (
                          <div key={plan.id} className={`border rounded-lg p-4 ${isCurrent ? "border-brand-600 bg-brand-50" : "hover:border-gray-400"}`}>
                            <p className="font-semibold text-gray-900">{plan.name}</p>
                            <p className="text-lg font-bold mt-1">
                              {plan.price_usd > 0 ? `$${plan.price_usd}` : t("free")}
                              {plan.price_usd > 0 && <span className="text-sm font-normal text-gray-500">{t("monthly")}</span>}
                            </p>
                            <Button
                              className="w-full mt-3 gap-2"
                              variant={isCurrent ? "outline" : "default"}
                              disabled={isCurrent || checkoutLoading === plan.slug}
                              onClick={() => handleCheckout(plan.slug)}
                            >
                              {checkoutLoading === plan.slug ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isCurrent ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : null}
                              {isCurrent ? t("currentPlan") : t("choosePlan")}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
        </Tabs>
    </div>
  );
}
