"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

  const clearProgressTimer = () => {
    if (!progressTimerRef.current) return;
    clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
  };

  const startNavigationProgress = () => {
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
  };

  const finishNavigationProgress = () => {
    clearProgressTimer();
    setProgress(100);

    window.setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 220);
  };

  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      finishNavigationProgress();
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      clearProgressTimer();
    };
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando dashboard...</p>
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
            className="h-full bg-[#2563eb] shadow-[0_0_12px_rgba(13,122,95,0.55)] transition-[width] duration-150"
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
          aria-label="Cerrar menu lateral"
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
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

