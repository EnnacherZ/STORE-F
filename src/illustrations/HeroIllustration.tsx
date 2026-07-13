import React from "react";

const HeroIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 600 600"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Illustration of shoes, a shirt and a bag displayed on shelves"
  >
    <defs>
      <linearGradient id="shelfGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0e92e4" stopOpacity="0.16" />
        <stop offset="100%" stopColor="#0e92e4" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Background circle */}
    <circle cx="300" cy="300" r="270" fill="#0a1c27" opacity="0.04" />
    <circle cx="300" cy="300" r="220" fill="#0e92e4" opacity="0.07" />

    {/* Back shelf line */}
    <rect x="80" y="200" width="440" height="6" rx="3" fill="#0a1c27" opacity="0.1" />
    <rect x="80" y="430" width="440" height="6" rx="3" fill="#0a1c27" opacity="0.1" />

    {/* ── Shirt (left, hanging) ─────────────────────────── */}
    <g transform="translate(110,150)">
      <circle cx="60" cy="6" r="14" fill="none" stroke="#0a1c27" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M30 20 L48 8 L60 18 L72 8 L90 20 L100 46 L82 56 L78 46 L78 130 Q60 138 42 130 L42 46 L38 56 L20 46 Z"
        fill="#e07b39"
      />
      <path d="M48 8 L60 18 L72 8 L66 24 L54 24 Z" fill="#0a1c27" opacity="0.18" />
      <rect x="42" y="60" width="36" height="6" rx="3" fill="#ffffff" opacity="0.35" />
    </g>

    {/* ── Sneaker (center-front, larger, hero piece) ──────── */}
    <g transform="translate(195,300)">
      <ellipse cx="105" cy="148" rx="120" ry="14" fill="#0a1c27" opacity="0.08" />
      <path
        d="M10 110 C10 70 40 30 95 22 C130 16 160 30 178 56 C196 50 210 56 212 72 C214 92 198 104 178 104 L40 110 C24 112 10 112 10 110 Z"
        fill="#0e92e4"
      />
      <path
        d="M40 110 L178 104 C188 104 198 102 206 96 L210 116 C210 124 200 130 188 130 L42 130 C24 130 12 122 10 110 Z"
        fill="#0a6eb0"
      />
      <path d="M95 22 C130 16 160 30 178 56" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />
      <circle cx="120" cy="50" r="5" fill="#ffffff" opacity="0.7" />
      <circle cx="140" cy="46" r="5" fill="#ffffff" opacity="0.7" />
      <circle cx="160" cy="46" r="5" fill="#ffffff" opacity="0.7" />
      <rect x="42" y="118" width="140" height="8" rx="4" fill="#ffffff" opacity="0.4" />
    </g>

    {/* ── Sandal (right) ───────────────────────────────────── */}
    <g transform="translate(420,340)">
      <ellipse cx="55" cy="98" rx="65" ry="10" fill="#0a1c27" opacity="0.07" />
      <path
        d="M10 70 C6 40 20 10 50 6 C78 2 96 22 98 50 C100 72 92 90 70 92 L24 92 C14 92 10 82 10 70 Z"
        fill="#7ec8a4"
      />
      <path d="M30 14 L34 60 M50 8 L52 62 M70 16 L66 62" stroke="#0a1c27" strokeOpacity="0.2" strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>

    {/* ── Folded pants (bottom-left) ───────────────────────── */}
    <g transform="translate(95,440)">
      <rect x="0" y="0" width="120" height="56" rx="8" fill="#a78bfa" />
      <rect x="0" y="0" width="120" height="18" rx="8" fill="#26215c" opacity="0.18" />
      <rect x="10" y="26" width="46" height="8" rx="4" fill="#ffffff" opacity="0.3" />
      <rect x="64" y="26" width="46" height="8" rx="4" fill="#ffffff" opacity="0.3" />
    </g>

    {/* ── Small tote bag (bottom-right) ────────────────────── */}
    <g transform="translate(380,432)">
      <path d="M14 30 L14 18 Q14 0 32 0 Q50 0 50 18 L50 30" fill="none" stroke="#0a1c27" strokeOpacity="0.3" strokeWidth="5" strokeLinecap="round" />
      <rect x="0" y="28" width="64" height="56" rx="6" fill="#c9a84c" />
      <rect x="0" y="28" width="64" height="14" rx="6" fill="#0a1c27" opacity="0.12" />
    </g>

    {/* Floating accent dots */}
    <circle cx="150" cy="120" r="5" fill="#0e92e4" opacity="0.5" />
    <circle cx="500" cy="180" r="7" fill="#e07b39" opacity="0.4" />
    <circle cx="80" cy="380" r="6" fill="#7ec8a4" opacity="0.5" />
    <circle cx="520" cy="420" r="5" fill="#a78bfa" opacity="0.45" />
  </svg>
);

export default HeroIllustration;
