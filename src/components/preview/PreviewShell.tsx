"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { SECTION_MAP, SECTION_ORDER } from "@/components/preview/PreviewSections";

// ─── Helpers ────────────────────────────────────────────────────────────────

type NestedMessages = Record<string, unknown>;

function setNestedValue(target: NestedMessages, keyPath: string, value: string): void {
  const parts = keyPath.split(".");
  let current: NestedMessages = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof current[part] !== "object" || current[part] === null) {
      current[part] = {};
    }
    current = current[part] as NestedMessages;
  }
  current[parts[parts.length - 1]] = value;
}

// ─── Shell ──────────────────────────────────────────────────────────────────

interface PreviewShellProps {
  section: string;
  highlightKey: string;
  initialMessages: NestedMessages;
  locale: string;
}

export default function PreviewShell({
  section,
  highlightKey,
  initialMessages,
  locale,
}: PreviewShellProps) {
  const [messages, setMessages] = useState<NestedMessages>(initialMessages);
  const [activeKey, setActiveKey] = useState(highlightKey);
  const [activeSection, setActiveSection] = useState(section);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Listen for postMessage from admin panel
  useEffect(() => {
    function handler(event: MessageEvent) {
      const data = event.data;
      if (data?.type !== "i18n-preview-update") return;

      const { key, value, section: newSection } = data as {
        type: string;
        key: string;
        value: string;
        section?: string;
      };

      setMessages((prev) => {
        const clone = structuredClone(prev);
        setNestedValue(clone, key, value);
        return clone;
      });

      setActiveKey(key);
      if (newSection && newSection !== activeSection) {
        setActiveSection(newSection);
      }
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [activeSection]);

  // Scroll to section on mount / section change
  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSection]);

  // Determine which sections to render for context
  const sectionIndex = SECTION_ORDER.indexOf(activeSection);
  const contextSections =
    sectionIndex >= 0
      ? SECTION_ORDER.slice(Math.max(0, sectionIndex - 1), sectionIndex + 2)
      : [activeSection];

  // Notify parent that preview is ready
  useEffect(() => {
    window.parent?.postMessage({ type: "i18n-preview-ready" }, "*");
  }, []);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {/* Global highlight style for the active key */}
      <style>{`
        [data-preview-section="${activeSection}"] {
          position: relative;
        }
        [data-preview-section="${activeSection}"]::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 50;
          border: 2px solid rgb(146 121 186 / 0.4);
          border-radius: 8px;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Indicator bar */}
        <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white/95 px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
            <span className="text-xs font-semibold text-brand-600">Vista previa en vivo</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="font-mono">{activeKey}</span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700">
              {locale.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Render sections with context */}
        {contextSections.map((sectionName) => {
          const SectionComponent = SECTION_MAP[sectionName];
          if (!SectionComponent) return null;

          const isActive = sectionName === activeSection;

          return (
            <div
              key={sectionName}
              ref={isActive ? sectionRef : undefined}
              data-preview-section={isActive ? sectionName : undefined}
              className={isActive ? "" : "opacity-40 pointer-events-none"}
            >
              <SectionComponent />
            </div>
          );
        })}
      </div>
    </NextIntlClientProvider>
  );
}
