import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

/* Shared wrapper keeps every icon on the same 64×64 grid so they drop
   into category cards at identical visual weight. */
const Frame: React.FC<{ size?: number; className?: string; children: React.ReactNode }> = ({
  size = 56,
  className,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const ShoeIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <path
      d="M4 40 C4 30 12 22 24 20 C30 19 35 23 40 28 C44 24 50 26 51 32 C52 38 47 42 40 42 L10 42 C6 42 4 42 4 40 Z"
      fill="currentColor"
    />
    <path d="M10 42 L40 42 C44 42 48 41 51 38 L52 46 C52 50 47 52 41 52 L11 52 C6 52 4 49 4 44 Z" fill="currentColor" opacity="0.55" />
    <path d="M24 20 C30 19 35 23 40 28" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" />
  </Frame>
);

export const SandalIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <path
      d="M10 38 C8 24 16 12 28 10 C40 8 47 18 48 30 C49 40 44 50 32 51 L18 51 C12 51 11 46 10 38 Z"
      fill="currentColor"
    />
    <path
      d="M17 14 L19 46 M28 9 L29 47 M40 16 L37 47"
      stroke="currentColor"
      strokeOpacity="0.45"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  </Frame>
);

export const ShirtIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <path
      d="M22 6 L28 13 L32 16 L36 13 L42 6 L54 16 L48 28 L42 24 L42 56 Q32 60 22 56 L22 24 L16 28 L10 16 Z"
      fill="currentColor"
    />
    <path d="M28 13 L32 16 L36 13 L33 21 L31 21 Z" fill="currentColor" opacity="0.4" />
  </Frame>
);

export const PantIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <path
      d="M16 8 L48 8 L50 28 L54 56 L42 56 L36 30 L34 56 L32 56 L30 30 L28 56 L16 56 L18 28 Z"
      fill="currentColor"
    />
    <rect x="16" y="8" width="32" height="9" rx="2" fill="currentColor" opacity="0.4" />
  </Frame>
);

export const BagIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <path
      d="M18 24 L18 16 Q18 6 32 6 Q46 6 46 16 L46 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <rect x="10" y="22" width="44" height="34" rx="6" fill="currentColor" />
    <rect x="10" y="22" width="44" height="10" rx="6" fill="currentColor" opacity="0.4" />
  </Frame>
);

export const HangerIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <circle cx="32" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="3" />
    <path
      d="M32 14 L32 20 C32 22 34 22 36 24 L54 38 C58 41 56 46 50 46 L14 46 C8 46 6 41 10 38 L28 24 C30 22 32 22 32 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="14" y1="46" x2="50" y2="46" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </Frame>
);

/* ── Normalizer: maps a raw productType string to the right icon ───── */
const ICON_MAP: Record<string, React.FC<IconProps>> = {
  shoe: ShoeIcon,
  shoes: ShoeIcon,
  sneaker: ShoeIcon,
  sneakers: ShoeIcon,
  chaussure: ShoeIcon,
  chaussures: ShoeIcon,
  sandal: SandalIcon,
  sandals: SandalIcon,
  sandale: SandalIcon,
  sandales: SandalIcon,
  shirt: ShirtIcon,
  shirts: ShirtIcon,
  chemise: ShirtIcon,
  chemises: ShirtIcon,
  tshirt: ShirtIcon,
  "t-shirt": ShirtIcon,
  pant: PantIcon,
  pants: PantIcon,
  pantalon: PantIcon,
  pantalons: PantIcon,
  trouser: PantIcon,
  trousers: PantIcon,
  bag: BagIcon,
  bags: BagIcon,
  sac: BagIcon,
  sacs: BagIcon,
};

export const getCategoryIcon = (type: string): React.FC<IconProps> =>
  ICON_MAP[type.toLowerCase()] ?? HangerIcon;
