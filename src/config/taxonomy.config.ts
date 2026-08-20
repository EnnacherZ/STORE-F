/**
 * taxonomy.config.ts
 *
 * Presentation-only data for each product type: page title, banner image,
 * title icon. Keyed by the same productType strings the backend returns.
 *
 * This is NOT the source of truth for which product types / categories the
 * store carries — that's fetched dynamically from the backend via
 * ParametersContext (see contexts/ParametersContext.tsx, consumed by
 * FilterSection.tsx and Header.tsx). This file only supplies the local
 * assets/icons a given type should render with once the backend says it
 * exists — it intentionally has no "list of all product types" of its own,
 * so there's a single source of truth for the taxonomy itself.
 */
import { LiaShoePrintsSolid } from "react-icons/lia";
import { GiSandal } from "react-icons/gi";
import { FaShirt } from "react-icons/fa6";
import { PiPantsBold } from "react-icons/pi";
import React from "react";
import shoesBanner from "../assets/shoes.png";
import sandalsBanner from "../assets/sandals.png";
import shirtsBanner from "../assets/shirts.png";
import pantsBanner from "../assets/pants.png";

export const productTitle: Record<string, string> = {
  Shoe: "Shoes models",
  Sandal: "Sandals models",
  Shirt: "Shirts models",
  Pant: "Pants models",
};

export const productBanner: Record<string, string> = {
  Shoe: shoesBanner,
  Sandal: sandalsBanner,
  Shirt: shirtsBanner,
  Pant: pantsBanner,
};

// To add a new product type: add one line here (plus productTitle/productBanner
// above) — no other file needs changing for the icon/title/banner to show up.
export const productIcon: Record<string, React.ElementType> = {
  Shoe: LiaShoePrintsSolid,
  Sandal: GiSandal,
  Shirt: FaShirt,
  Pant: PiPantsBold,
};
