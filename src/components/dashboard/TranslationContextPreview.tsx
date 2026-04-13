"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Eye, Loader2, Maximize2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SECTION_ORDER } from "@/components/preview/PreviewSections";

// ─── Types ──────────────────────────────────────────────────────────────────

type LocaleCode = "es" | "en" | "fr";

export interface TranslationContextPreviewProps {
  keyPath: string;
  editedValue: string;
  locale: LocaleCode;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Maps i18n module name → landing section name (for SECTION_ORDER) */
const MODULE_TO_SECTION: Record<string, string> = {
  Hero: "Hero",
  Header: "Header",
  Platform: "Platform",
  WhyManufy: "WhyManufy",
  Quality: "Quality",
  CTA: "CTA",
  Testimonials: "Testimonials",
  StrategyCallSection: "StrategyCallSection",
  Pricing: "Pricing",
  FinalCTA: "FinalCTA",
  Footer: "Footer",
  ForManufacturers: "ForManufacturers",
};

const SECTION_LABELS: Record<string, string> = {
  Hero: "Landing — Hero",
  Header: "Navegación",
  Platform: "Cómo funciona",
  WhyManufy: "Por qué FashionsDen",
  Quality: "Servicios",
  CTA: "CTA Fabricantes",
  Testimonials: "Testimonios",
  StrategyCallSection: "Strategy Call",
  Pricing: "Precios",
  FinalCTA: "CTA Final",
  Footer: "Pie de página",
  ForManufacturers: "Para Fabricantes",
};

function getSection(keyPath: string): string | null {
  const moduleName = keyPath.split(".")[0];
  return MODULE_TO_SECTION[moduleName] ?? null;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TranslationContextPreview({
  keyPath,
  editedValue,
  locale,
}: TranslationContextPreviewProps) {
  const currentLocale = useLocale();
  const previewLocale = locale || currentLocale;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastSentRef = useRef<string>("");

  const section = getSection(keyPath);
  const sectionLabel = section ? (SECTION_LABELS[section] ?? section) : null;
  const isSupported = section !== null && SECTION_ORDER.includes(section);

  // Build iframe URL
  const buildUrl = useCallback(() => {
    if (!section) return "";
    const params = new URLSearchParams({
      section,
      key: keyPath,
      value: editedValue,
    });
    return `/${previewLocale}/preview?${params.toString()}`;
  }, [section, keyPath, editedValue, previewLocale]);

  // Send real-time updates via postMessage
  const sendUpdate = useCallback(
    (value: string) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow || !section) return;

      const payload = JSON.stringify({
        type: "i18n-preview-update",
        key: keyPath,
        value,
        section,
      });

      // Avoid sending duplicate messages
      if (payload === lastSentRef.current) return;
      lastSentRef.current = payload;

      iframe.contentWindow.postMessage(
        { type: "i18n-preview-update", key: keyPath, value, section },
        "*"
      );
    },
    [keyPath, section]
  );

  // Listen for "ready" message from iframe
  useEffect(() => {
    if (!open) return;

    function handler(event: MessageEvent) {
      if (event.data?.type === "i18n-preview-ready") {
        setLoading(false);
        // Send current value once iframe is ready
        sendUpdate(editedValue);
      }
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [open, editedValue, sendUpdate]);

  // Send updates as the user types (while sheet is open)
  useEffect(() => {
    if (!open) return;
    sendUpdate(editedValue);
  }, [editedValue, open, sendUpdate]);

  // Reset loading state when opening
  useEffect(() => {
    if (open) setLoading(true);
  }, [open]);

  if (!isSupported) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-xs"
        title={`Ver cómo quedará en ${sectionLabel}`}
      >
        <Maximize2 className="h-3.5 w-3.5" />
        Ver en contexto
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-hidden p-0">
          {/* Header bar */}
          <div className="flex items-center justify-between border-b bg-white px-6 py-3">
            <SheetHeader className="text-left">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand-500" />
                <SheetTitle className="text-sm font-semibold">
                  Vista previa —{" "}
                  <span className="text-brand-600">{sectionLabel}</span>
                </SheetTitle>
              </div>
              <p className="font-mono text-[11px] text-gray-400">{keyPath}</p>
            </SheetHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                En vivo · {previewLocale.toUpperCase()}
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Componente real
              </Badge>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Preview iframe */}
          <div className="relative h-[calc(90vh-60px)] bg-gray-100">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b bg-gray-200 px-4 py-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 rounded-md bg-white px-3 py-1 text-center font-mono text-[11px] text-gray-400 shadow-inner">
                fashionsden.com/{previewLocale} · {sectionLabel}
              </div>
            </div>

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <p className="text-sm text-gray-500">Cargando componente real...</p>
              </div>
            )}

            {/* The actual iframe */}
            <iframe
              ref={iframeRef}
              src={open ? buildUrl() : undefined}
              className="h-[calc(90vh-100px)] w-full border-0"
              title={`Vista previa: ${sectionLabel}`}
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
