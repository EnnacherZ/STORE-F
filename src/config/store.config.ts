/**
 * store.config.ts
 *
 * The single place to edit when forking this codebase for a different store.
 * Deliberately free of Vite/browser-only syntax (no `import.meta.env`, no
 * asset imports) so it can also be imported by standalone Node scripts that
 * run outside the Vite pipeline (e.g. src/sitemap.tsx).
 */

export const STORE_NAME = "Al-Firdaous Store";
export const STORE_LEGAL_NAME = "AL FIRDAOUS STORE";

// Used by src/sitemap.tsx. Runtime origin (for QR codes / tracking links
// generated in the browser) is a separate concern — see VITE_ACTUAL_ORIGIN,
// read directly in src/contexts/CreateInvoice.tsx.
export const STORE_DOMAIN = "https://www.alfirdaousstore.com";

export const STORE_CONTACT = {
  email: "contact@alfirdaousstore.com",
  phone: "+212 600 000 000",
  phoneHref: "tel:+212600000000",
};

export const STORE_SOCIALS = {
  facebook: "https://web.facebook.com/profile.php?id=61581025313047",
  instagram: "https://www.instagram.com/store_alfirdaous/",
  instagramHandle: "store_alfirdaous",
  whatsapp: "",
  tiktok: "",
  youtube: "",
};

// Every localStorage/sessionStorage key this app writes, in one place.
// NOTE: these are the exact strings already live in real users' browsers —
// changing a value here invalidates/orphans whatever they've already stored
// (an in-progress cart, a saved checkout form, etc). Safe to rename freely
// only when forking this codebase for a brand-new store with no existing users.
export const STORAGE_KEYS = {
  cartItems: "AL-Firdaous-All-Items",
  successItems: "AL-Firdaous-Success-All-Items",
  paymentResponse: "AlFirdaousStorePaymentResponse",
  clientForm: "ClientData",
  orderTrackingAttempts: "AlFirdaousStoreOrderTrackingLimitAttempts",
  orderTrackingLastReset: "AlFirdaousStoreOrderTrackingLimitAttemptsLastReset",
  language: "AlFirdaousStoreLang",
};

// Cities the store currently ships to.
export const SERVICEABLE_CITIES = [
  "Laâyoune",
  // "Casablanca",
  // "Rabat",
  // "Marrakech",
  // "Fès",
  // "Tanger",
  // "Agadir",
  // "Meknès",
  // "Oujda",
  // "El Jadida",
  // "Tétouan",
  // "Safi",
  // "Nador",
  // "Khouribga",
  // "Béni Mellal",
  // "Kenitra",
  // "Mohammedia",
  // "Essaouira",
  // "Errachidia",
  // "Ouarzazate",
];
