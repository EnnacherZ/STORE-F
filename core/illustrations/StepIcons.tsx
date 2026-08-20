import React from "react";

interface IconProps {
  className?: string;
}

const Frame: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <svg width="48" height="48" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {children}
  </svg>
);

export const BrowseIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <rect x="8" y="10" width="48" height="36" rx="5" fill="currentColor" opacity="0.16" />
    <rect x="14" y="16" width="16" height="12" rx="2" fill="currentColor" />
    <rect x="34" y="16" width="16" height="12" rx="2" fill="currentColor" opacity="0.55" />
    <rect x="14" y="32" width="16" height="8" rx="2" fill="currentColor" opacity="0.55" />
    <rect x="34" y="32" width="16" height="8" rx="2" fill="currentColor" />
    <circle cx="46" cy="50" r="9" fill="none" stroke="currentColor" strokeWidth="3.5" />
    <line x1="52" y1="56" x2="58" y2="62" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </Frame>
);

export const SizeIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <rect x="10" y="24" width="44" height="22" rx="4" fill="currentColor" opacity="0.16" />
    <path d="M16 24 L16 46 M24 24 L24 38 M32 24 L32 46 M40 24 L40 38 M48 24 L48 46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="46" cy="16" r="9" fill="currentColor" />
    <path d="M42 16 L45 19 L51 12" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </Frame>
);

export const OrderIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <path d="M12 16 L52 16 L48 46 C47.4 49 45 50 42 50 L22 50 C19 50 16.6 49 16 46 Z" fill="currentColor" opacity="0.16" />
    <path d="M22 16 L22 12 Q22 6 32 6 Q42 6 42 12 L42 16" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M22 26 L42 26 M22 34 L42 34 M22 42 L36 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </Frame>
);

export const DeliveryIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <rect x="6" y="22" width="30" height="20" rx="3" fill="currentColor" />
    <path d="M36 28 L48 28 L56 36 L56 42 L36 42 Z" fill="currentColor" opacity="0.55" />
    <circle cx="18" cy="46" r="6" fill="none" stroke="currentColor" strokeWidth="3.5" />
    <circle cx="46" cy="46" r="6" fill="none" stroke="currentColor" strokeWidth="3.5" />
    <line x1="40" y1="32" x2="50" y2="32" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
  </Frame>
);
