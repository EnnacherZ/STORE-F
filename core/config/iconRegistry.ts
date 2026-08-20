/**
 * iconRegistry.ts
 *
 * Maps the backend CatalogSection.icon strings (e.g. "FaTshirt:fa")
 * to actual React icon components. The backend stores icons as
 * "ComponentName:package" where package is the react-icons subfolder.
 *
 * If a section icon isn't in this registry, HangerIcon is used as fallback.
 */
import React from "react";

// FontAwesome (react-icons/fa)
import {
  FaBoxOpen, FaTshirt, FaShoePrints, FaLeaf, FaGem, FaHeart,
  FaLaptop, FaCookieBite, FaPaintBrush, FaBook, FaCouch,
  FaFlask, FaWrench, FaMedal, FaPaw, FaCar, FaBaby,
} from "react-icons/fa";

// FontAwesome 6 (react-icons/fa6)
import { FaBagShopping } from "react-icons/fa6";

// Fallback
import { HangerIcon } from "../illustrations/CategoryIcons";

type IconComponent = React.FC<{ size?: number; className?: string }>;

/**
 * Registry of backend icon strings → React components.
 * Key format matches CatalogSection.icon: "ComponentName:package"
 */
const ICON_REGISTRY: Record<string, IconComponent> = {
  "FaBoxOpen:fa":         FaBoxOpen,
  "FaTshirt:fa":          FaTshirt,
  "FaShoePrints:fa":      FaShoePrints,
  "FaLeaf:fa":            FaLeaf,
  "FaGem:fa":             FaGem,
  "FaHeart:fa":           FaHeart,
  "FaBagShopping:fa6":    FaBagShopping,
  "FaLaptop:fa":          FaLaptop,
  "FaCookieBite:fa":      FaCookieBite,
  "FaPaintBrush:fa":      FaPaintBrush,
  "FaBook:fa":            FaBook,
  "FaCouch:fa":           FaCouch,
  "FaFlask:fa":           FaFlask,
  "FaWrench:fa":          FaWrench,
  "FaMedal:fa":           FaMedal,
  "FaPaw:fa":             FaPaw,
  "FaCar:fa":             FaCar,
  "FaBaby:fa":            FaBaby,
};

/**
 * Resolve a backend icon string to a React component.
 * Falls back to HangerIcon for unknown/unregistered icons.
 */
export const resolveIcon = (iconString: string): IconComponent =>
  ICON_REGISTRY[iconString] ?? HangerIcon;
