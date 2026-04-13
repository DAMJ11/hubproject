"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function PayoutSettingsClient() {
  const t = useTranslations("DesignerEarnings");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/designer/stripe-connect");
      const data = await res.json();
      if (data.success) {
        setHasAccount(data.data.hasAccount);
        setIsOnboarded(data.data.isOnboarded);
      }
    } catch {
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/designer/stripe-connect", { method: "POST" });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        toast.error(data.message || t("fetchError"));
        setConnecting(false);
      }
    } catch {
      toast.error(t("fetchError"));
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            {t("payoutSettings")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOnboarded ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">{t("stripeConnected")}</p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">{t("stripeOnboarded")}</p>
              </div>
            </div>
          ) : hasAccount ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-400">{t("setupRequired")}</p>
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {connecting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  {connecting ? t("connecting") : t("connectStripe")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium">{t("stripeNotConnected")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("stripeDesc")}</p>
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="mt-4 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {connecting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                {connecting ? t("connecting") : t("connectStripe")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
