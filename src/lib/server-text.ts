import { NextRequest } from "next/server";
import { getBaseLocaleMessages, type I18nLocale, I18N_LOCALES } from "@/lib/i18n-editor";

const DEFAULT_LOCALE: I18nLocale = "es";

function isSupportedLocale(value: string | null | undefined): value is I18nLocale {
  return Boolean(value && I18N_LOCALES.includes(value as I18nLocale));
}

function readNestedValue(source: Record<string, unknown>, keyPath: string) {
  return keyPath.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, source);
}

function interpolate(template: string, values?: Record<string, string>) {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}

function getLocaleFromHeader(request: NextRequest) {
  const directLocale = request.headers.get("x-locale") ?? request.headers.get("x-next-intl-locale");
  if (isSupportedLocale(directLocale)) {
    return directLocale;
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) {
    return null;
  }

  const languages = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const language of languages) {
    const baseLanguage = language.split("-")[0];
    if (isSupportedLocale(baseLanguage)) {
      return baseLanguage;
    }
  }

  return null;
}

export function getRequestLocale(request: NextRequest): I18nLocale {
  const localeFromHeader = getLocaleFromHeader(request);
  if (localeFromHeader) {
    return localeFromHeader;
  }

  const localeFromCookie = request.cookies.get("NEXT_LOCALE")?.value ?? request.cookies.get("oauth_locale")?.value;
  if (isSupportedLocale(localeFromCookie)) {
    return localeFromCookie;
  }

  const localeFromQuery = request.nextUrl.searchParams.get("locale");
  if (isSupportedLocale(localeFromQuery)) {
    return localeFromQuery;
  }

  const pathLocale = request.nextUrl.pathname.split("/").filter(Boolean)[0];
  if (isSupportedLocale(pathLocale)) {
    return pathLocale;
  }

  return DEFAULT_LOCALE;
}

export async function getServerText(request: NextRequest) {
  const locale = getRequestLocale(request);
  const mergedMessages = await getBaseLocaleMessages(locale);

  return (keyPath: string, values?: Record<string, string>, fallback?: string) => {
    const value = readNestedValue(mergedMessages, keyPath);
    if (typeof value === "string") {
      return interpolate(value, values);
    }

    return fallback ? interpolate(fallback, values) : keyPath;
  };
}