import React from "react";
import { FaRegCopyright } from "react-icons/fa6";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import iconStoreWhite from "../assets/WHITE FIRDAOUS STORE.png";
import "../styles/footer.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangContext } from "../contexts/LanguageContext";
import { selectedLang } from "./constants";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { currentLang } = useLangContext();
  const isRtl = selectedLang(currentLang) === "ar";

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

          {/* Social pills */}
          <div className="footer-socials">
            <div className="footer-sm fb rounded-pill">
              <a
                target="_blank"
                rel="noreferrer"
                href="https://web.facebook.com/profile.php?id=61581025313047"
              >
                <FontAwesomeIcon icon={faFacebook} />
                Facebook
              </a>
            </div>
            <div className="footer-sm ig rounded-pill">
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.instagram.com/store_alfirdaous/"
              >
                <FontAwesomeIcon icon={faInstagram} />
                Instagram
              </a>
            </div>
          </div>
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
          <div style={{ fontSize: 14 }}>
            <p>
              {t("form.phone.label")} :{" "}
              <a href="tel:+212600000000" className="socialLinks">
                +212 600 000 000
              </a>
            </p>
            <p>
              {t("form.email.label")} :{" "}
              <a
                href="mailto:alfirdaousstore.services@gmail.com"
                className="socialLinks"
              >
                alfirdaousstore.services@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="footer-divider" />

      {/* ── Copyright ── */}
      <div className="copyrightTitle fw-bold">
        AL FIRDAOUS STORE&nbsp;
        <FaRegCopyright />
        &nbsp;2025
      </div>
    </footer>
  );
};

export default Footer;
