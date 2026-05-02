import React, { useEffect, useLayoutEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useLangContext } from "../contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import Marquee from "react-fast-marquee";
import { FaHome, FaShoppingCart } from "react-icons/fa";
import { GiSandal } from "react-icons/gi";
import { PiPantsBold } from "react-icons/pi";
import { LiaShoePrintsSolid } from "react-icons/lia";
import { FaAngleRight, FaShirt } from "react-icons/fa6";
import { MdLanguage } from "react-icons/md";
import { goTo, selectedLang } from "./constants";
import icon2 from "../assets/WHITE FIRDAOUS STORE.png";
import "../styles/header.css";

// ── Static data (outside component — never recreated on render) ─────────────
const NAV_ITEMS = [
  { path: "/Home",               icon: <FaHome />,             labelKey: "nav.home"            },
  { path: "/ProductPage/Shoe",   icon: <LiaShoePrintsSolid />, labelKey: "productTypes.shoe"   },
  { path: "/ProductPage/Sandal", icon: <GiSandal />,           labelKey: "productTypes.sandal" },
  { path: "/ProductPage/Shirt",  icon: <FaShirt />,            labelKey: "productTypes.shirt"  },
  { path: "/ProductPage/Pant",   icon: <PiPantsBold />,        labelKey: "productTypes.pant"   },
];

const LANGUAGES = ["Français", "العربية", "English"];

// ── Shared language selector ─────────────────────────────────────────────────
const LangSelector: React.FC<{
  currentLang: string;
  onChange: (lang: string) => void;
  className?: string;
}> = ({ currentLang, onChange, className = "" }) => (
  <div className={`lang-selector ${className}`}>
    <MdLanguage size={20} aria-hidden />
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

// ── Main component ───────────────────────────────────────────────────────────
const Header: React.FC = () => {
  const isPub = import.meta.env.VITE_IS_HEADER_PUB === "true";

  const { itemCount }                   = useCart();
  const { setCurrentLang, currentLang } = useLangContext();
  const { t }                           = useTranslation();
  const location                        = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);

  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 800);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close sidebar on route or language change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, currentLang]);

  // Lock body scroll when sidebar is open
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
      <header className="site-header" dir="ltr">
        {isMobile ? (
          /* ════════════════════════════════════════════════════════════════
             MOBILE
             The header is ONE fixed row (mobile-bar).
             The sidebar slides in BELOW the header using
             position:fixed + top: var(--mobile-bar-height).
             Nothing overlaps the bar itself.
             ════════════════════════════════════════════════════════════════ */
          <>
            <div className="mobile-bar">
              {/* ── Hamburger — far left ─────────────────────────── */}
              <button
                className="hamburger"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-expanded={sidebarOpen}
                aria-controls="sidebar-nav"
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              >
                <span className={`hamburger__line ${sidebarOpen ? "is-top-open"    : ""}`} />
                <span className={`hamburger__line ${sidebarOpen ? "is-mid-open"    : ""}`} />
                <span className={`hamburger__line ${sidebarOpen ? "is-bot-open"    : ""}`} />
                <span className="hamburger__label" aria-hidden>{t("nav.menu")}</span>
              </button>

              {/* ── Logo — absolute center ───────────────────────── */}
              <button
                className="logo-btn"
                onClick={() => goTo("/Home")}
                aria-label="Go to home"
              >
                <img className="site-logo" src={icon2} alt="Firdaous Store" />
              </button>

              {/* ── Cart — far right ─────────────────────────────── */}
              <button
                className="mobile-cart-btn"
                onClick={() => goTo("/Cart")}
                aria-label={`${t("cart.title")}, ${itemCount} items`}
              >
                <FaShoppingCart className="mobile-cart-btn__icon" aria-hidden />
                <span className="mobile-cart-btn__badge">{itemCount}</span>
                <span className="mobile-cart-btn__label">{t("cart.title")}</span>
              </button>
            </div>

            {/* ── Sidebar — fixed, starts below the header bar ───── */}
            <div
              className={`sidebar-overlay ${sidebarOpen ? "sidebar-overlay--open" : ""}`}
              aria-hidden={!sidebarOpen}
            >
              <nav
                id="sidebar-nav"
                className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}
                aria-label="Mobile navigation"
                //inert={!sidebarOpen}
              >
                <ul className="sidebar__list">
                  {/* Language */}
                  <li className="sidebar__item sidebar__item--lang">
                    <LangSelector currentLang={currentLang} onChange={setCurrentLang} />
                  </li>

                  {/* Cart */}
                  <li className="sidebar__item">
                    <Link
                      to="/YourCart"
                      className="sidebar__link"
                      data-active={isActive("/YourCart") ? "true" : "false"}
                    >
                      <span className="sidebar__link-icon"><FaShoppingCart /></span>
                      <span className="sidebar__link-label">
                        {t("cart.title")}
                        <em className="sidebar__link-count"> ({itemCount})</em>
                      </span>
                      <FaAngleRight className="sidebar__link-arrow" aria-hidden />
                    </Link>
                  </li>

                  {/* Pages */}
                  {NAV_ITEMS.map((item) => (
                    <li key={item.path} className="sidebar__item">
                      <Link
                        to={item.path}
                        className="sidebar__link"
                        data-active={isActive(item.path) ? "true" : "false"}
                      >
                        <span className="sidebar__link-icon">{item.icon}</span>
                        <span className="sidebar__link-label">{t(item.labelKey)}</span>
                        <FaAngleRight className="sidebar__link-arrow" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Click-away closes sidebar */}
              <div
                className="sidebar-backdrop"
                onClick={() => setSidebarOpen(false)}
                aria-hidden
              />
            </div>
          </>
        ) : (
          /* ════════════════════════════════════════════════════════════════
             DESKTOP
             Single flex row: [logo] [nav — centered] [cart + lang — right]
             ════════════════════════════════════════════════════════════════ */
          <div
            className="desktop-bar"
            dir={selectedLang(currentLang) === "ar" ? "rtl" : "ltr"}
          >
            {/* Logo */}
            <button
              className="logo-btn"
              onClick={() => goTo("/Home")}
              aria-label="Go to home"
            >
              <img className="site-logo" src={icon2} alt="Firdaous Store" />
            </button>

            {/* Nav */}
            <nav className="desktop-nav" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  className="desktop-nav__btn"
                  data-active={isActive(item.path) ? "true" : "false"}
                  aria-current={isActive(item.path) ? "page" : undefined}
                >
                  <span className="desktop-nav__btn-icon" aria-hidden>{item.icon}</span>
                  {t(item.labelKey)}
                </button>
              ))}
            </nav>

            {/* Right-side actions */}
            <div className="desktop-actions">
              <button
                className="desktop-cart-btn"
                onClick={() => goTo("/Cart")}
                aria-label={`${t("cart.title")}, ${itemCount} items`}
              >
                <FaShoppingCart aria-hidden />
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
        )}
      </header>
    </>
  );
};

export default Header;