/**
 * payment.config.ts
 *
 * Payment-provider-facing display assets. Endpoint calls themselves
 * (server/connecter.tsx) are already provider-agnostic; this file isolates
 * the one place a provider name/asset actually leaks into the UI.
 */

export interface CardLogo {
  name: string;
  src: string;
}

export const ACCEPTED_CARD_LOGOS: CardLogo[] = [
  { name: "Visa",             src: "https://static4.youcan.shop/store-front/images/visa.png" },
  { name: "Mastercard",       src: "https://static4.youcan.shop/store-front/images/master-card.png" },
  { name: "American Express", src: "https://static4.youcan.shop/store-front/images/american-express.png" },
  { name: "Discover",         src: "https://static4.youcan.shop/store-front/images/discover.png" },
];
