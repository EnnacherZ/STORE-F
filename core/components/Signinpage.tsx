import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useClientAuth } from "../contexts/ClientAuthContext";
import { useStoreConfig } from "../config/StoreConfigContext";
import "../styles/auth.css";
import Header from "./Header";

const SignInPage: React.FC = () => {
  const { t }      = useTranslation();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { signIn } = useClientAuth();
  const { logo, name: STORE_NAME } = useStoreConfig();

  // Redirect to where the user came from, or /Home
  const from = (location.state as any)?.from?.pathname ?? "/Home";

  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? t("auth.genericError");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header/>
    <div className="auth-page">
      {/* ── Decorative side panel ── */}
      <div className="auth-panel auth-panel--brand">
        <img src={logo.white} alt={STORE_NAME} className="auth-brand-logo" />
        <p className="auth-brand-tagline">{t("auth.brandTagline")}</p>
        <div className="auth-brand-circles" aria-hidden>
          <span /><span /><span />
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-card">
          <h1 className="auth-card__title">{t("auth.signInTitle")}</h1>
          <p className="auth-card__sub">
            {t("auth.noAccount")}{" "}
            <Link to="/signup" className="auth-link">{t("auth.createOne")}</Link>
          </p>

          {error && (
            <div className="auth-alert auth-alert--error" role="alert">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="signin-email" className="auth-field__label">
                {t("auth.emailLabel")}
              </label>
              <div className="auth-field__input-wrap">
                <FaEnvelope className="auth-field__icon" aria-hidden />
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
                  className="auth-field__input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="signin-password" className="auth-field__label">
                {t("auth.passwordLabel")}
              </label>
              <div className="auth-field__input-wrap">
                <FaLock className="auth-field__icon" aria-hidden />
                <input
                  id="signin-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-field__input"
                />
                <button
                  type="button"
                  className="auth-field__toggle"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn auth-btn--primary"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-btn__spinner" aria-hidden />
              ) : (
                t("auth.signInBtn")
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  </>);
};

export default SignInPage;