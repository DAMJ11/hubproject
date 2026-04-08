import { promises as fs } from "fs";
import path from "path";
import { query, queryOne } from "@/lib/db";

export const I18N_LOCALES = ["es", "en", "fr"] as const;

export type I18nLocale = (typeof I18N_LOCALES)[number];

type FlatMessages = Record<string, string>;

interface I18nKeyRow {
  id: number;
  key_path: string;
  module: string;
}

export interface TranslationKeyListItem {
  id: number;
  key_path: string;
  module: string;
  display_name: string;
  module_label: string;
  base_es: string;
  base_en: string;
  base_fr: string;
}

interface I18nValueRow {
  locale: I18nLocale;
  status: string;
  value_text: string;
  version: number;
  updated_at: string;
  published_at: string | null;
}

let i18nTablesAvailableCache: boolean | null = null;

async function hasI18nTables(): Promise<boolean> {
  if (i18nTablesAvailableCache !== null) {
    return i18nTablesAvailableCache;
  }

  const rows = await query<{ table_name: string }[]>(
    `SELECT LOWER(table_name) AS table_name
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name IN ('i18n_keys', 'i18n_values')`,
  );

  const tableNames = new Set(rows.map((row) => row.table_name));
  i18nTablesAvailableCache = tableNames.has("i18n_keys") && tableNames.has("i18n_values");
  return i18nTablesAvailableCache;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function flattenMessages(value: unknown, prefix = "", output: FlatMessages = {}): FlatMessages {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const nextPrefix = prefix ? `${prefix}.${index}` : String(index);
      flattenMessages(item, nextPrefix, output);
    });
    return output;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, nestedValue]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      flattenMessages(nestedValue, nextPrefix, output);
    });
    return output;
  }

  if (!prefix) {
    return output;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    output[prefix] = String(value);
  }

  return output;
}

export function setNestedValue(target: Record<string, unknown>, keyPath: string, value: string) {
  const segments = keyPath.split(".");
  let cursor: unknown = target;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const isLast = index === segments.length - 1;
    const nextSegment = segments[index + 1];
    const nextIsArrayIndex = nextSegment ? /^\d+$/.test(nextSegment) : false;
    const currentKey = /^\d+$/.test(segment) ? Number(segment) : segment;

    if (Array.isArray(cursor)) {
      if (isLast) {
        cursor[currentKey as number] = value;
        return;
      }

      if (cursor[currentKey as number] == null) {
        cursor[currentKey as number] = nextIsArrayIndex ? [] : {};
      }

      cursor = cursor[currentKey as number];
      continue;
    }

    if (!isPlainObject(cursor)) {
      return;
    }

    if (isLast) {
      cursor[currentKey as string] = value;
      return;
    }

    if (cursor[currentKey as string] == null) {
      cursor[currentKey as string] = nextIsArrayIndex ? [] : {};
    }

    cursor = cursor[currentKey as string];
  }
}

export function applyFlatOverrides(
  baseMessages: Record<string, unknown>,
  overrides: FlatMessages,
): Record<string, unknown> {
  const clone = JSON.parse(JSON.stringify(baseMessages)) as Record<string, unknown>;

  Object.entries(overrides).forEach(([keyPath, value]) => {
    setNestedValue(clone, keyPath, value);
  });

  return clone;
}

export function getModuleFromKeyPath(keyPath: string) {
  return keyPath.split(".")[0] || "root";
}

function prettifySegment(segment: string) {
  return segment
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function getDisplayNameFromKeyPath(keyPath: string) {
  const segments = keyPath.split(".").filter(Boolean);
  const semanticSegments = segments.filter((segment) => !/^\d+$/.test(segment));
  const tail = semanticSegments.slice(-2);

  if (tail.length === 0) {
    return keyPath;
  }

  return tail.map(prettifySegment).join(" / ");
}

const moduleLabels: Record<string, string> = {
  Header: "Navegacion",
  Hero: "Home",
  Platform: "Home",
  Quality: "Home",
  Pricing: "Home",
  CTA: "Home",
  FinalCTA: "Home",
  Testimonials: "Home",
  Footer: "Footer",
  DashboardHome: "Dashboard",
  DashboardHeader: "Dashboard",
  DashboardLayout: "Dashboard",
  Sidebar: "Dashboard",
  Login: "Autenticacion",
  Register: "Autenticacion",
  ForgotPassword: "Autenticacion",
  ResetPassword: "Autenticacion",
  Users: "Admin",
  Settings: "Dashboard",
  Notifications: "Dashboard",
};

function getModuleLabel(moduleName: string) {
  return moduleLabels[moduleName] ?? moduleName;
}

async function readLocaleMessages(locale: I18nLocale): Promise<Record<string, unknown>> {
  const filePath = path.join(process.cwd(), "messages", `${locale}.json`);
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content) as Record<string, unknown>;
}

export async function getBaseLocaleMessages(locale: I18nLocale) {
  return readLocaleMessages(locale);
}

export async function loadBaseLocaleMaps(): Promise<Record<I18nLocale, FlatMessages>> {
  const entries = await Promise.all(
    I18N_LOCALES.map(async (locale) => [locale, flattenMessages(await readLocaleMessages(locale))] as const),
  );

  return Object.fromEntries(entries) as Record<I18nLocale, FlatMessages>;
}

export async function ensureI18nTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS i18n_keys (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      key_path VARCHAR(255) NOT NULL UNIQUE,
      module VARCHAR(100) NOT NULL,
      description TEXT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_i18n_keys_module (module),
      INDEX idx_i18n_keys_active (is_active)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS i18n_values (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      key_id INT NOT NULL,
      locale VARCHAR(5) NOT NULL,
      value_text MEDIUMTEXT NOT NULL,
      status VARCHAR(20) NOT NULL,
      version INT NOT NULL DEFAULT 1,
      created_by_user_id INT NOT NULL,
      published_by_user_id INT NULL,
      published_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_i18n_values_key_locale_version (key_id, locale, version),
      INDEX idx_i18n_values_key_locale (key_id, locale),
      INDEX idx_i18n_values_locale_status (locale, status)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS i18n_audit_logs (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      key_path VARCHAR(255) NOT NULL,
      locale VARCHAR(5) NOT NULL,
      old_value MEDIUMTEXT NULL,
      new_value MEDIUMTEXT NOT NULL,
      action VARCHAR(20) NOT NULL,
      changed_by_user_id INT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_i18n_audit_key_locale (key_path, locale),
      INDEX idx_i18n_audit_created (created_at)
    )
  `);
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

// Deduplication lock: prevents concurrent syncI18nKeys calls from causing MySQL deadlocks
// on INSERT IGNORE with the same rows hitting the same unique index simultaneously.
let _syncI18nKeysInFlight: Promise<void> | null = null;

export function syncI18nKeys(): Promise<void> {
  if (_syncI18nKeysInFlight !== null) {
    return _syncI18nKeysInFlight;
  }

  _syncI18nKeysInFlight = _runSyncI18nKeys().finally(() => {
    _syncI18nKeysInFlight = null;
  });

  return _syncI18nKeysInFlight;
}

async function _runSyncI18nKeys() {
  const localeMaps = await loadBaseLocaleMaps();
  const allKeys = Array.from(
    new Set(I18N_LOCALES.flatMap((locale) => Object.keys(localeMaps[locale]))),
  ).sort((left, right) => left.localeCompare(right));

  if (allKeys.length === 0) {
    return;
  }

  for (const chunk of chunkArray(allKeys, 200)) {
    const placeholders = chunk.map(() => "(?, ?, 1)").join(", ");
    const params = chunk.flatMap((keyPath) => [keyPath, getModuleFromKeyPath(keyPath)]);

    let attempts = 0;
    while (attempts < 3) {
      try {
        await query(
          `INSERT IGNORE INTO i18n_keys (key_path, module, is_active) VALUES ${placeholders}`,
          params,
        );
        break;
      } catch (error) {
        attempts += 1;
        const mysqlError = error as { code?: string };
        if (mysqlError.code === "ER_LOCK_DEADLOCK" && attempts < 3) {
          // Brief delay before retry: 50ms, 100ms
          await new Promise<void>((resolve) => setTimeout(resolve, 50 * attempts));
          continue;
        }
        throw error;
      }
    }
  }
}

export async function getTranslationModules() {
  const rows = await query<{ module: string }[]>(
    "SELECT DISTINCT module FROM i18n_keys WHERE is_active = TRUE ORDER BY module ASC",
  );
  return rows.map((row) => row.module);
}

export async function getTranslationKeys(filters?: { search?: string; module?: string }): Promise<TranslationKeyListItem[]> {
  const clauses = ["is_active = TRUE"];
  const params: (string | number | boolean | null)[] = [];

  if (filters?.module && filters.module !== "all") {
    clauses.push("module = ?");
    params.push(filters.module);
  }

  const [rows, localeMaps] = await Promise.all([
    query<I18nKeyRow[]>(
    `SELECT id, key_path, module FROM i18n_keys WHERE ${clauses.join(" AND ")} ORDER BY module ASC, key_path ASC`,
    params,
    ),
    loadBaseLocaleMaps(),
  ]);

  const search = filters?.search?.trim().toLowerCase() ?? "";

  const enriched = rows.map<TranslationKeyListItem>((row) => {
    const baseEs = localeMaps.es[row.key_path] ?? "";
    const baseEn = localeMaps.en[row.key_path] ?? "";
    const baseFr = localeMaps.fr[row.key_path] ?? "";

    return {
      id: row.id,
      key_path: row.key_path,
      module: row.module,
      display_name: getDisplayNameFromKeyPath(row.key_path),
      module_label: getModuleLabel(row.module),
      base_es: baseEs,
      base_en: baseEn,
      base_fr: baseFr,
    };
  });

  if (!search) {
    return enriched;
  }

  return enriched.filter((item) => {
    const searchableFields = [
      item.key_path,
      item.display_name,
      item.module,
      item.module_label,
      item.base_es,
      item.base_en,
      item.base_fr,
    ].map((value) => value.toLowerCase());

    return searchableFields.some((field) => field.includes(search));
  });
}

export async function getPublishedOverridesMap(locale: I18nLocale): Promise<FlatMessages> {
  try {
    const tablesAvailable = await hasI18nTables();
    if (!tablesAvailable) {
      return {};
    }

    const rows = await query<{ key_path: string; value_text: string }[]>(
      `SELECT k.key_path, v.value_text
       FROM i18n_values v
       INNER JOIN i18n_keys k ON k.id = v.key_id
       WHERE v.locale = ? AND v.status = 'published'`,
      [locale],
    );

    return rows.reduce<FlatMessages>((accumulator, row) => {
      accumulator[row.key_path] = row.value_text;
      return accumulator;
    }, {});
  } catch (error) {
    const sqlError = error as { code?: string };
    if (sqlError.code === "ER_NO_SUCH_TABLE") {
      i18nTablesAvailableCache = false;
      return {};
    }

    throw error;
  }
}

export async function getKeyRowByPath(keyPath: string) {
  return queryOne<I18nKeyRow>(
    "SELECT id, key_path, module FROM i18n_keys WHERE key_path = ? LIMIT 1",
    [keyPath],
  );
}

export async function getValuesByKeyId(keyId: number) {
  return query<I18nValueRow[]>(
    `SELECT locale, status, value_text, version, updated_at, published_at
     FROM i18n_values
     WHERE key_id = ?
     ORDER BY locale ASC, version DESC`,
    [keyId],
  );
}

export async function getNextVersion(keyId: number, locale: I18nLocale) {
  const row = await queryOne<{ next_version: number | null }>(
    "SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM i18n_values WHERE key_id = ? AND locale = ?",
    [keyId, locale],
  );

  return row?.next_version ?? 1;
}

export async function insertAuditLog(params: {
  keyPath: string;
  locale: I18nLocale;
  oldValue: string | null;
  newValue: string;
  action: "create" | "update" | "publish" | "rollback";
  changedByUserId: number;
}) {
  await query(
    `INSERT INTO i18n_audit_logs (key_path, locale, old_value, new_value, action, changed_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      params.keyPath,
      params.locale,
      params.oldValue,
      params.newValue,
      params.action,
      params.changedByUserId,
    ],
  );
}
