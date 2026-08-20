import React from "react";

interface IconProps {
  className?: string;
}

const Frame: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <svg width="28" height="28" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {children}
  </svg>
);

export const TruckIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <rect x="4" y="20" width="32" height="24" rx="3" fill="currentColor" />
    <path d="M36 26 L50 26 L60 36 L60 44 L36 44 Z" fill="currentColor" opacity="0.55" />
    <circle cx="18" cy="50" r="7" fill="none" stroke="currentColor" strokeWidth="4" />
    <circle cx="48" cy="50" r="7" fill="none" stroke="currentColor" strokeWidth="4" />
  </Frame>
);

export const ShieldCheckIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <path d="M32 6 L54 14 L54 30 C54 44 44 54 32 58 C20 54 10 44 10 30 L10 14 Z" fill="currentColor" />
    <path d="M22 32 L29 39 L43 24" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
  </Frame>
);

export const LockIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <rect x="14" y="28" width="36" height="28" rx="5" fill="currentColor" />
    <path d="M20 28 L20 20 Q20 8 32 8 Q44 8 44 20 L44 28" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <circle cx="32" cy="40" r="5" fill="#fff" opacity="0.85" />
  </Frame>
);

export const ChatIcon: React.FC<IconProps> = (props) => (
  <Frame {...props}>
    <path d="M6 14 C6 9 10 6 16 6 L48 6 C54 6 58 9 58 14 L58 34 C58 39 54 42 48 42 L26 42 L14 54 L16 42 C9 41 6 38 6 34 Z" fill="currentColor" />
    <circle cx="20" cy="23" r="3" fill="#fff" opacity="0.85" />
    <circle cx="32" cy="23" r="3" fill="#fff" opacity="0.85" />
    <circle cx="44" cy="23" r="3" fill="#fff" opacity="0.85" />
  </Frame>
);
