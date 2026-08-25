import React from "react";
import { FaRegCopyright } from "react-icons/fa6";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faTiktok,
  faWhatsapp,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import iconStoreWhite from "../assets/WHITE FIRDAOUS STORE.png";
import "../styles/footer.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangContext } from "../contexts/LanguageContext";
import { selectedLang } from "./constants";
import { useSiteSettings } from "../server/siteSettings";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { currentLang } = useLangContext();
  const isRtl = selectedLang(currentLang) === "ar";
  const siteSettings = useSiteSettings();
  const phoneHref = `tel:${siteSettings.phone_number.replace(/[^\d+]/g, "")}`;
  const socialLinks = [
    { key: "facebook", label: "Facebook", url: siteSettings.facebook_url, icon: faFacebook, className: "fb" },
    { key: "instagram", label: "Instagram", url: siteSettings.instagram_url, icon: faInstagram, className: "ig" },
    { key: "whatsapp", label: "WhatsApp", url: siteSettings.whatsapp_url, icon: faWhatsapp, className: "wa" },
    { key: "tiktok", label: "TikTok", url: siteSettings.tiktok_url, icon: faTiktok, className: "tt" },
    { key: "youtube", label: "YouTube", url: siteSettings.youtube_url, icon: faYoutube, className: "yt" },
  ].filter((social) => social.url);

  return (
    <footer
      className={`footerX${isRtl ? " rtl" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ── Three-column grid ── */}
      <div className="footer-inner">

        {/* ── Brand column ── */}
        <div className="footer-brand">
          <div className="iconStoreWDiv">
            <img src={iconStoreWhite} alt="AL FIRDAOUS STORE" />
          </div>

          <p className="footer-brand-desc">
            {t("footer.brandDesc", {
              defaultValue:
                "Premium footwear crafted for comfort and style. Serving Morocco with quality since 2018.",
            })}
          </p>

          {/* Dashboard-configured social channels */}
          {socialLinks.length > 0 && (
            <nav className="footer-social-section" aria-label={t("footer.followUs")}>
              <span className="footer-social-title">{t("footer.followUs")}</span>
              <div className="footer-socials">
                {socialLinks.map((social) => (
                  <a
                    className={`footer-social-link footer-social-link--${social.className}`}
                    key={social.key}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={social.url}
                    aria-label={`${t("footer.followUs")}: ${social.label}`}
                    title={social.label}
                  >
                    <FontAwesomeIcon icon={social.icon} aria-hidden="true" />
                    <span className="visually-hidden">{social.label}</span>
                  </a>
                ))}
              </div>
            </nav>
          )}
        </div>

        {/* ── Policies column ── */}
        <div className="footer-col">
          <p className="fw-bold text-center fs-4">{t("footer.policies")}</p>
          <ul>
            <li>
              <Link
                to="/Policies/General-terms-of-use"
                className="socialLinks privacy-policy"
              >
                {t("footer.usePolicy")}
              </Link>
            </li>
            <li>
              <Link
                to="/Policies/Privacy-policy"
                className="socialLinks privacy-policy"
              >
                {t("footer.privacyPolicy")}
              </Link>
            </li>
          </ul>
        </div>

        {/* ── Contact column ── */}
        <div className="footer-col">
          <p className="fw-bold text-center fs-4">{t("footer.contactUs")}</p>
          <div className="footer-contact">
            {siteSettings.phone_number && <p>
              {t("form.phone.label")} :{" "}
              <a href={phoneHref} className="socialLinks">
                {siteSettings.phone_number}
              </a>
            </p>}
            {siteSettings.contact_email && <p>
              {t("form.email.label")} :{" "}
              <a
                href={`mailto:${siteSettings.contact_email}`}
                className="socialLinks"
              >
                {siteSettings.contact_email}
              </a>
            </p>}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="footer-divider" />

      {/* ── Copyright ── */}
      <div className="copyrightTitle fw-bold">
        AL FIRDAOUS STORE&nbsp;
        <FaRegCopyright />
        &nbsp;2026
      </div>
    </footer>
  );
};

export default Footer;
