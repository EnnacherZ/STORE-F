/**
 * config/index.ts
 *
 * Assembles this store's StoreConfig object, injected into
 * @firdaous/storefront-core via <StorefrontApp config={firdaousStoreConfig} />.
 * This is the one file a forked/new store needs to rewrite (plus its own
 * store.config/brandAssets/currency.config/payment.config/taxonomy.config,
 * assets, and locales) — nothing in the core package needs to change.
 */
import type { StoreConfig } from "../../core/config/StoreConfigContext";
import {
  STORE_NAME,
  STORE_LEGAL_NAME,
  STORE_DOMAIN,
  STORE_CONTACT,
  STORE_SOCIALS,
  STORAGE_KEYS,
  SERVICEABLE_CITIES,
} from "./store.config";
import { STORE_LOGO } from "./brandAssets";
import { CURRENCIES, DEFAULT_CURRENCY, getCountryCodeByCurrency } from "./currency.config";
import { ACCEPTED_CARD_LOGOS } from "./payment.config";
import { productTitle, productBanner, productIcon } from "./taxonomy.config";
import createInvoice from "../contexts/CreateInvoice";

export const firdaousStoreConfig: StoreConfig = {
  name: STORE_NAME,
  legalName: STORE_LEGAL_NAME,
  domain: STORE_DOMAIN,
  contact: STORE_CONTACT,
  socials: STORE_SOCIALS,
  storageKeys: STORAGE_KEYS,
  serviceableCities: SERVICEABLE_CITIES,
  logo: STORE_LOGO,
  currencies: {
    list: CURRENCIES,
    default: DEFAULT_CURRENCY,
    getCountryCodeByCurrency,
  },
  payment: {
    acceptedCardLogos: ACCEPTED_CARD_LOGOS,
  },
  taxonomy: {
    title: productTitle,
    banner: productBanner,
    icon: productIcon,
  },
  generateInvoice: createInvoice as StoreConfig["generateInvoice"],
};
