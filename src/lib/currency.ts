/**
 * Currency formatting utility.
 *
 * Default currency is read from NEXT_PUBLIC_DEFAULT_CURRENCY (fallback: EUR).
 * When multi-currency conversion is needed, extend this module with a
 * `convertCurrency(amount, from, to)` function backed by an exchange-rate API.
 */

const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "EUR";

/**
 * Format a number as currency using Intl.NumberFormat.
 * @param amount   - The numeric value to format.
 * @param locale   - BCP-47 locale string (e.g. "en", "es", "fr").
 * @param currency - ISO 4217 code. Defaults to NEXT_PUBLIC_DEFAULT_CURRENCY.
 */
export function formatCurrency(
  amount: number | null | undefined,
  locale: string = "en",
  currency: string = DEFAULT_CURRENCY
): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export { DEFAULT_CURRENCY };
