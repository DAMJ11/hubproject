import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { routing, type AppLocale } from "@/i18n/routing";
import PreviewShell from "@/components/preview/PreviewShell";

// ─── Helper ─────────────────────────────────────────────────────────────────

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

// ─── Page ───────────────────────────────────────────────────────────────────

interface PreviewPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ section?: string; key?: string; value?: string }>;
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  const { section = "", key = "", value = "" } = await searchParams;

  // Load and deep-clone messages so we can safely mutate
  const baseMessages = (await import(`../../../../messages/${locale}.json`)).default as NestedMessages;
  const messages = structuredClone(baseMessages);

  // Apply the override
  if (key && value) {
    setNestedValue(messages, key, decodeURIComponent(value));
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <PreviewShell
        section={section}
        highlightKey={key}
        initialMessages={messages}
        locale={locale}
      />
    </NextIntlClientProvider>
  );
}

// Prevent static generation — this page always needs fresh searchParams
export const dynamic = "force-dynamic";
