/**
 * brandAssets.ts
 *
 * Logo image imports, kept separate from store.config.ts so that file stays
 * safe to import from non-Vite (Node) contexts — image imports require
 * Vite's asset pipeline and only resolve inside the bundled app.
 */
import logoWhite from "../assets/WHITE FIRDAOUS STORE.png";
import logoStandard from "../assets/FIRDAOUS STORE.png";
import logoBlack from "../assets/BLACK FIRDAOUS STORE.png";

export const STORE_LOGO = {
  white: logoWhite,
  standard: logoStandard,
  black: logoBlack,
};
