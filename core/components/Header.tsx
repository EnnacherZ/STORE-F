import React, { useEffect, useLayoutEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../contexts/CartContext";
import { useClientAuth } from "../contexts/ClientAuthContext";
import { useLangContext } from "../contexts/LanguageContext";
import { useParametersContext } from "../contexts/ParametersContext";
import { useTranslation } from "react-i18next";
import Marquee from "react-fast-marquee";
// FIX: swapped bold filled Font Awesome glyphs for Feather's thin-stroke
// outline icons — bold/filled icons read as generic "app UI"; thin outline
// icons are the more editorial, premium convention used across luxury
// e-commerce sites, and pair better with the widened letter-spacing already
// used on the category nav.
import { FiShoppingBag, FiUser, FiLogOut, FiChevronRight, FiGlobe } from "react-icons/fi";
import { goTo, selectedLang } from "./constants";
import { useStoreConfig } from "../config/StoreConfigContext";
import "../styles/header.css";

const LANGUAGES = ["Français", "العربية", "English"];

// ── Shared language selector ─────────────────────────────────────────────────
const LangSelector: React.FC<{
  currentLang: string;
  onChange: (lang: string) => void;
  className?: string;
}> = ({ currentLang, onChange, className = "" }) => (
  <div className={`lang-selector ${className}`}>
    <FiGlobe size={20} aria-hidden />
    <select
      value={currentLang}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Select language"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang}>{lang}</option>
      ))}
    </select>
  </div>
);

// ── Account button (desktop) ─────────────────────────────────────────────────
const AccountBtn: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, client, signOut, isLoading } = useClientAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <button
        className="desktop-account-btn"
        onClick={() => goTo("/account/signin")}
        aria-label={t("auth.signIn")}
      >
        <FiUser aria-hidden />
        <span>{t("auth.signIn")}</span>
      </button>
    );
  }

  return (
    <div className="account-menu-wrap" onClick={(e) => e.stopPropagation()}>
      <button
        className="desktop-account-btn desktop-account-btn--active"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <FiUser aria-hidden />
        <span>{client?.first_name}</span>
      </button>

      {menuOpen && (
        <div className="account-dropdown" role="menu">
          <button
            className="account-dropdown__header account-dropdown__header--link"
            role="menuitem"
            onClick={() => { setMenuOpen(false); goTo("/account"); }}
          >
            <p className="account-dropdown__name">
              {client?.first_name} {client?.last_name}
            </p>
            <p className="account-dropdown__email">{client?.email}</p>
          </button>
          <hr className="account-dropdown__divider" />
          <button
            className="account-dropdown__item"
            role="menuitem"
            onClick={() => { setMenuOpen(false); goTo("/account"); }}
          >
            <FiUser aria-hidden />
            {t("auth.myAccount")}
          </button>
          <hr className="account-dropdown__divider" />
          <button
            className="account-dropdown__item account-dropdown__item--danger"
            role="menuitem"
            onClick={signOut}
          >
            <FiLogOut aria-hidden />
            {t("auth.signOut")}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Mobile account link (inside sidebar) ─────────────────────────────────────
const SidebarAccountItem: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { t } = useTranslation();
  const { isAuthenticated, client, signOut, isLoading } = useClientAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <li className="sidebar__item">
        <Link
          to="/signin"
          className="sidebar__link"
          data-active={isActive ? "true" : "false"}
        >
          <span className="sidebar__link-icon"><FiUser /></span>
          <span className="sidebar__link-label">{t("auth.signIn")}</span>
          <FiChevronRight className="sidebar__link-arrow" aria-hidden />
        </Link>
      </li>
    );
  }

  return (
    <li className="sidebar__item sidebar__item--account">
      <div className="sidebar__account-info">
        <FiUser className="sidebar__account-icon" aria-hidden />
        <div>
          <p className="sidebar__account-name">
            {client?.first_name} {client?.last_name}
          </p>
          <p className="sidebar__account-email">{client?.email}</p>
        </div>
      </div>
      <Link
        to="/account"
        className="sidebar__link sidebar__link--account-btn"
        data-active="false"
      >
        <span className="sidebar__link-icon"><FiUser /></span>
        <span className="sidebar__link-label">{t("auth.myAccount")}</span>
        <FiChevronRight className="sidebar__link-arrow" aria-hidden />
      </Link>
      <button className="sidebar__signout-btn" onClick={signOut}>
        <FiLogOut aria-hidden />
        {t("auth.signOut")}
      </button>
    </li>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const Header: React.FC = () => {
  const isPub = import.meta.env.VITE_IS_HEADER_PUB === "true";

  const { itemCount } = useCart();
  const { setCurrentLang, currentLang } = useLangContext();
  const { t } = useTranslation();
  const location = useLocation();
  const { productTypes } = useParametersContext(); // string[]
  const { logo } = useStoreConfig();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // FIX: the mobile sidebar had no RTL awareness at all — see the header
  // element below, which used to hardcode dir="ltr" unconditionally. It
  // always slid in from the left even in Arabic. Computed once here and
  // used to pick the sidebar's slide-in edge (mirrors Dash-F-main's
  // DeliveryPortal sidebar, which already gets this right).
  const isRtl = selectedLang(currentLang) === "ar";

  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 800);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, currentLang]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const isActive = (path: string) =>
    location.pathname === path || (path === "/Home" && location.pathname === "/");

  return (
    <>
      {/* ── Promo banner ─────────────────────────────────────────────────── */}
      {isPub && (
        <div className="promo-banner" aria-live="polite">
          <Marquee speed={50} gradient={false}>
            <span className="promo-banner__text">{t("delivery.cityOnly")}</span>
          </Marquee>
        </div>
      )}

      {/* ── Header shell ─────────────────────────────────────────────────── */}
      <header className="site-header" dir={isRtl ? "rtl" : "ltr"}>
        {isMobile ? (
          /* ══ MOBILE ══════════════════════════════════════════════════════ */
          <>
            <div className="mobile-bar">
              <button
                className="hamburger"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-expanded={sidebarOpen}
                aria-controls="sidebar-nav"
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              >
                <span className={`hamburger__line ${sidebarOpen ? "is-top-open" : ""}`} />
                <span className={`hamburger__line ${sidebarOpen ? "is-mid-open" : ""}`} />
                <span className={`hamburger__line ${sidebarOpen ? "is-bot-open" : ""}`} />
                <span className="hamburger__label" aria-hidden>{t("nav.menu")}</span>
              </button>

              <button
                className="logo-btn"
                onClick={() => goTo("/Home")}
                aria-label="Go to home"
              >
                <img className="site-logo" src={logo.white} alt="Firdaous Store" />
              </button>

              <button
                className="mobile-cart-btn"
                onClick={() => goTo("/Cart")}
                aria-label={`${t("cart.title")}, ${itemCount} items`}
              >
                <FiShoppingBag className="mobile-cart-btn__icon" aria-hidden />
                <span className="mobile-cart-btn__badge">{itemCount}</span>
                <span className="mobile-cart-btn__label">{t("cart.title")}</span>
              </button>
            </div>

            {/* FIX: was a manually-toggled overlay (CSS visibility + a fixed
                translateX(-100%)) that always slid in from the left,
                regardless of language — see the isRtl comment above. Now
                mirrors Dash-F-main's DeliveryPortal sidebar: conditionally
                mounted via AnimatePresence (nothing inert sits in the DOM
                while closed) and slides in from whichever edge actually
                matches the reading direction, with matching spring physics. */}
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden
                  />
                  <motion.nav
                    id="sidebar-nav"
                    className="sidebar"
                    aria-label="Mobile navigation"
                    style={{ [isRtl ? "right" : "left"]: 0 } as React.CSSProperties}
                    initial={{ x: isRtl ? "100%" : "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: isRtl ? "100%" : "-100%" }}
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  >
                <ul className="sidebar__list">
                  {/* Language */}
                  <li className="sidebar__item sidebar__item--lang">
                    <LangSelector currentLang={currentLang} onChange={setCurrentLang} />
                  </li>

                  {/* Account */}
                  <SidebarAccountItem isActive={isActive("/account/signin")} />

                  {/* Cart */}
                  <li className="sidebar__item">
                    <Link
                      to="/YourCart"
                      className="sidebar__link"
                      data-active={isActive("/YourCart") ? "true" : "false"}
                    >
                      <span className="sidebar__link-icon"><FiShoppingBag /></span>
                      <span className="sidebar__link-label">
                        {t("cart.title")}
                        <em className="sidebar__link-count"> ({itemCount})</em>
                      </span>
                      <FiChevronRight className="sidebar__link-arrow" aria-hidden />
                    </Link>
                  </li>

                  {/* Home */}
                  {/* FIX: dropped the icon — the bespoke illustrated category
                      icons (and FiHome alongside them) read as oversized and
                      informal next to the refined typography; a serious/
                      editorial nav reads best as text-only. The label still
                      indents to the same position as the account/cart rows
                      above via the empty reserved-width icon slot. */}
                  <li className="sidebar__item">
                    <Link
                      to="/Home"
                      className="sidebar__link"
                      data-active={isActive("/Home") ? "true" : "false"}
                    >
                      <span className="sidebar__link-icon" aria-hidden />
                      <span className="sidebar__link-label">{t("nav.home")}</span>
                      <FiChevronRight className="sidebar__link-arrow" aria-hidden />
                    </Link>
                  </li>

                  {/* Dynamic product types — skeleton while loading */}
                  {!productTypes || productTypes.length === 0
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <li key={i} className="sidebar__item">
                          <div className="sidebar__link-skeleton" aria-hidden>
                            <span className="sidebar__skeleton-label" />
                          </div>
                        </li>
                      ))
                    : productTypes.map((type) => (
                        <li key={type} className="sidebar__item">
                          <Link
                            to={`/ProductPage/${type}`}
                            className="sidebar__link"
                            data-active={isActive(`/ProductPage/${type}`) ? "true" : "false"}
                          >
                            <span className="sidebar__link-label">
                              {t(`productTypes.${type.toLowerCase()}`)}
                            </span>
                            <FiChevronRight className="sidebar__link-arrow" aria-hidden />
                          </Link>
                        </li>
                      ))
                  }
                </ul>
                  </motion.nav>
                </>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* ══ DESKTOP ════════════════════════════════════════════════════ */
          <div
            className="desktop-bar"
            dir={selectedLang(currentLang) === "ar" ? "rtl" : "ltr"}
          >
            {/* Top row: logo + actions */}
            <div className="desktop-top-row">
              <button
                className="logo-btn"
                onClick={() => goTo("/Home")}
                aria-label="Go to home"
              >
                <img className="site-logo" src={logo.white} alt="Firdaous Store" />
              </button>

              <div className="desktop-actions">
                <AccountBtn />

                <button
                  className="desktop-cart-btn"
                  onClick={() => goTo("/Cart")}
                  aria-label={`${t("cart.title")}, ${itemCount} items`}
                >
                  <FiShoppingBag aria-hidden />
                  <span>{t("cart.title")}</span>
                  <span className="desktop-cart-btn__badge">{itemCount}</span>
                </button>

                <LangSelector
                  currentLang={currentLang}
                  onChange={setCurrentLang}
                  className="lang-selector--desktop"
                />
              </div>
            </div>

            {/* Bottom row: Home + dynamic product types */}
            {/* FIX: dropped the per-category illustrated icons (and the
                Home icon) — blown up at this size next to the refined,
                wide-tracked uppercase type, they read as oversized/informal
                rather than premium. A text-only category row is the
                convention most serious/editorial retail nav bars use. */}
            <nav className="desktop-cat-nav" aria-label="Product categories">
              {/* Home — always first */}
              <button
                onClick={() => goTo("/Home")}
                className="desktop-cat-btn desktop-cat-btn--home"
                data-active={isActive("/Home") ? "true" : "false"}
                aria-current={isActive("/Home") ? "page" : undefined}
              >
                <span>{t("nav.home")}</span>
              </button>

              {/* Dynamic product types — skeleton while loading, real buttons after */}
              {!productTypes || productTypes.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className="desktop-cat-btn-skeleton" aria-hidden />
                  ))
                : productTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => goTo(`/ProductPage/${type}`)}
                      className="desktop-cat-btn"
                      data-active={isActive(`/ProductPage/${type}`) ? "true" : "false"}
                      aria-current={isActive(`/ProductPage/${type}`) ? "page" : undefined}
                    >
                      {t(`productTypes.${type.toLowerCase()}`)}
                    </button>
                  ))
              }
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
