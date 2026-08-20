/**
 * currency.config.ts
 *
 * Single source of truth for supported currencies. The list is gated at
 * runtime by VITE_CURRENCY_AVAILABILITY (see contexts/PaymentContext.tsx) —
 * MAD is always offered; USD/EUR only show up when that flag is enabled.
 */

export interface CurrencyOption {
  code: string;
  label: string;
  countryCode: string;
}

export const DEFAULT_CURRENCY = "MAD";

export const CURRENCIES: CurrencyOption[] = [
  { code: "MAD", label: "MAD",   countryCode: "MA" },
  { code: "USD", label: "USD $", countryCode: "US" },
  { code: "EUR", label: "EUR €", countryCode: "EU" },
];

export const CURRENCY_TO_COUNTRY_CODE: Record<string, string> = Object.fromEntries(
  CURRENCIES.map(c => [c.code, c.countryCode])
);

export const getCountryCodeByCurrency = (currency: string): string =>
  CURRENCY_TO_COUNTRY_CODE[currency] ?? "";
