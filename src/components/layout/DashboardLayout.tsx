"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { useDashboardUser } from "@/contexts/DashboardUserContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const EDGE_SWIPE_ZONE_PX = 24;
const SWIPE_OPEN_THRESHOLD_PX = 64;
const SWIPE_CLOSE_THRESHOLD_PX = 64;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useDashboardUser();
  const t = useTranslations("DashboardLayout");
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchCurrentXRef = useRef<number | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (!progressTimerRef.current) return;
    clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
  }, []);

  const startNavigationProgress = useCallback(() => {
    clearProgressTimer();
    setIsNavigating(true);
    setProgress(18);

    progressTimerRef.current = setInterval(() => {
      setProgress((value) => {
        if (value >= 88) return value;
        const increment = value < 45 ? 7 : 3;
        return Math.min(value + increment, 88);
      });
    }, 120);
  }, [clearProgressTimer]);

  const finishNavigationProgress = useCallback(() => {
    clearProgressTimer();
    setProgress(100);

    window.setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 220);
  }, [clearProgressTimer]);

  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      finishNavigationProgress();
    }
  }, [finishNavigationProgress, pathname]);

  useEffect(() => {
    return () => {
      clearProgressTimer();
    };
  }, [clearProgressTimer]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");

    const syncViewport = () => {
      const mobile = media.matches;
      setIsMobile(mobile);

      if (!mobile) {
        setMobileSidebarOpen(false);
      }
    };

    syncViewport();
    media.addEventListener("change", syncViewport);

    return () => {
      media.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const originalOverflow = document.body.style.overflow;
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobile, mobileSidebarOpen]);

  useEffect(() => {
    if (!isMobile) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobile, mobileSidebarOpen]);

  useEffect(() => {
    if (!isMobile) return;

    if (mobileSidebarOpen) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
      return;
    }

    lastFocusedElementRef.current?.focus?.();
    lastFocusedElementRef.current = null;
  }, [isMobile, mobileSidebarOpen]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchCurrentXRef.current = touchStartXRef.current;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current == null) return;
    touchCurrentXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    const startX = touchStartXRef.current;
    const endX = touchCurrentXRef.current;

    touchStartXRef.current = null;
    touchCurrentXRef.current = null;

    if (!isMobile || startX == null || endX == null) return;

    const deltaX = endX - startX;
    const startedFromEdge = startX <= EDGE_SWIPE_ZONE_PX;

    // Swipe right from left edge opens drawer, swipe left closes it.
    if (!mobileSidebarOpen && startedFromEdge && deltaX > SWIPE_OPEN_THRESHOLD_PX) {
      setMobileSidebarOpen(true);
    }

    if (mobileSidebarOpen && deltaX < -SWIPE_CLOSE_THRESHOLD_PX) {
      setMobileSidebarOpen(false);
    }
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileSidebarOpen((prev) => !prev);
      return;
    }

    setDesktopSidebarOpen((prev) => !prev);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-slate-950 flex"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isNavigating && (
        <div className="fixed left-0 right-0 top-0 z-[60] h-1 bg-transparent pointer-events-none">
          <div
            className="h-full bg-brand-600 shadow-[0_0_12px_rgba(13,122,95,0.55)] transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Sidebar — siempre montado */}
      <Sidebar
        isOpen={desktopSidebarOpen}
        isMobile={isMobile}
        mobileOpen={mobileSidebarOpen}
        onToggle={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
        onMobileClose={() => setMobileSidebarOpen(false)}
        userRole={user.role}
        onNavigateStart={startNavigationProgress}
      />

      {isMobile && mobileSidebarOpen && (
        <button
          aria-label={t("closeSidebar")}
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Área principal */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          desktopSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {/* Header — siempre montado */}
        <DashboardHeader
          user={user}
          onMenuClick={handleMenuClick}
        />

        {/* Contenido de la sección — solo esto cambia al navegar */}
        <main id="main-content" className="flex-1 overflow-auto">
          <div
            key={pathname}
            className="px-4 py-5 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

