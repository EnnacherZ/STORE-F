/**
 * StoreConfigContext.tsx
 *
 * The injection point that lets this package stay store-agnostic. Every
 * value that used to be a static `import ... from "../config/..."` inside a
 * specific store's app (brand name/logo, currency list, payment-provider
 * display assets, product taxonomy, storage-key names, serviceable cities)
 * now flows in here instead, supplied by whichever app renders
 * <StorefrontApp config={...} />. Core components read it via useStoreConfig()
 * rather than importing a concrete store's config module directly.
 */
import React, { createContext, ReactNode, useContext } from "react";

export interface StoreConfig {
  name: string;
  legalName: string;
  domain: string;
  contact: { email: string; phone: string; phoneHref: string };
  socials: { facebook: string; instagram: string; instagramHandle: string };
  storageKeys: {
    cartItems: string;
    successItems: string;
    paymentResponse: string;
    clientForm: string;
    orderTrackingAttempts: string;
    orderTrackingLastReset: string;
    language: string;
  };
  serviceableCities: string[];
  logo: { white: string; standard: string; black: string };
  currencies: {
    list: { code: string; label: string; countryCode: string }[];
    default: string;
    getCountryCodeByCurrency: (currency: string) => string;
  };
  payment: { acceptedCardLogos: { name: string; src: string }[] };
  taxonomy: {
    title: Record<string, string>;
    banner: Record<string, string>;
    icon: Record<string, React.ElementType>;
  };
  /**
   * Generates the downloadable/emailed order-invoice PDF. Injected rather
   * than imported directly because a real implementation is tied to
   * store/region-specific assets (a delivery-form layout, a customs
   * document, a specific font) — those are store content, not engine logic.
   * Loosely typed to match the shape callers actually have on hand
   * (a PaymentResponse-like object, a clientData-like object, cart items).
   */
  generateInvoice: (
    paymentResponse: unknown,
    clientForm: unknown,
    items?: unknown[]
  ) => Promise<{ url: string; doc: Uint8Array }>;
}

const StoreConfigContext = createContext<StoreConfig | undefined>(undefined);

export const StoreConfigProvider: React.FC<{ config: StoreConfig; children: ReactNode }> = ({
  config,
  children,
}) => (
  <StoreConfigContext.Provider value={config}>{children}</StoreConfigContext.Provider>
);

export const useStoreConfig = (): StoreConfig => {
  const ctx = useContext(StoreConfigContext);
  if (ctx === undefined) {
    throw new Error(
      "useStoreConfig must be used within <StorefrontApp> — did the host app forget to pass a config prop?"
    );
  }
  return ctx;
};
