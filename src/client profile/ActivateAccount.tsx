import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { connecter } from "../server/connecter";
import icon2 from "../assets/WHITE FIRDAOUS STORE.png";
import "./styles/ActivateAccount.css";
import { goTo } from "../components/constants";

type Status = "loading" | "success" | "already" | "error";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ActivateAccount: React.FC = () => {
  const { activation_code }       = useParams<{ activation_code: string }>();
  const navigate                   = goTo;
  const { t }                     = useTranslation();
  const [status, setStatus]       = useState<Status>("loading");
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    // ── Validate UUID v4 locally before hitting the server ──────────────────
    if (!activation_code || !UUID_V4.test(activation_code)) {
      setStatus("error");
      return;
    }

    connecter
      .get(`api/client/activate/${activation_code}/`)
      .then(res => {
        const msg: string = res.data?.message ?? "";
        const isAlready   = msg.toLowerCase().includes("déjà") || msg.toLowerCase().includes("already");
        setStatus(isAlready ? "already" : "success");
      })
      .catch(() => setStatus("error"));
  }, [activation_code]);

  // Auto-redirect countdown after success / already-active
  useEffect(() => {
    if (status !== "success" && status !== "already") return;
    if (countdown === 0) { navigate("/account/signin"); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="auth-page auth-page--centered">
        <div className="auth-card auth-card--success">
          <div className="activate-spinner" />
          <p className="activate-sub">{t("auth.activating")}</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="auth-page auth-page--centered">
        <div className="auth-card auth-card--success">
          <FaTimesCircle className="activate-icon activate-icon--error" />
          <h1 className="auth-card__title">{t("auth.activateErrorTitle")}</h1>
          <p className="auth-card__sub">{t("auth.activateErrorSub")}</p>
          <button className="auth-btn auth-btn--primary" onClick={() => navigate("/account/signin")}>
            {t("auth.signIn")}
          </button>
        </div>
      </div>
    );
  }

  // ── Success / Already active ───────────────────────────────────────────────
  return (
    <div className="auth-page">
      {/* Brand panel */}
      <div className="auth-panel auth-panel--brand">
        <img src={icon2} alt="Al-Firdaous Store" className="auth-brand-logo" />
        <p className="auth-brand-tagline">{t("auth.brandTagline")}</p>
        <div className="auth-brand-circles" aria-hidden>
          <span /><span /><span />
        </div>
      </div>

      <div className="auth-panel auth-panel--form">
        <div className="auth-card auth-card--success">
          <FaCheckCircle className="activate-icon activate-icon--success" />

          <h1 className="auth-card__title">
            {status === "already" ? t("auth.activateAlreadyTitle") : t("auth.activateSuccessTitle")}
          </h1>

          <p className="auth-card__sub">
            {status === "already" ? t("auth.activateAlreadySub") : t("auth.activateSuccessSub")}
          </p>

          {/* Countdown progress bar */}
          <div className="activate-countdown">
            <div className="activate-countdown__bar" style={{ animationDuration: "4s" }} />
          </div>

          <p className="activate-redirect-note">
            {t("auth.activateRedirect", { seconds: countdown })}
          </p>

          <button className="auth-btn auth-btn--primary" onClick={() => navigate("/account/signin")}>
            {t("auth.signInBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;