import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "react-phone-number-input/style.css";
import PhoneInput, {
  isValidPhoneNumber,
  isPossiblePhoneNumber,
} from "react-phone-number-input";
import localeFr from "react-phone-number-input/locale/fr";
import localeEn from "react-phone-number-input/locale/en";
import localeAr from "react-phone-number-input/locale/ar";
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaUser, FaMapMarkerAlt, FaCheckCircle, FaGlobe,
} from "react-icons/fa";
import { FaCity } from "react-icons/fa6";
import { useClientAuth, type SignUpPayload } from "../contexts/ClientAuthContext";
import { useLangContext } from "../contexts/LanguageContext";
import { selectedLang } from "./constants";
import { useStoreConfig } from "../config/StoreConfigContext";
import "../styles/auth.css";

// ── Password strength ──────────────────────────────────────────────────────────

interface StrengthResult {
  score:  0 | 1 | 2 | 3 | 4;
  label:  string;
  color:  string;
  width:  string;
  checks: { label: string; ok: boolean }[];
}

function getStrength(password: string, t: (k: string) => string): StrengthResult {
  const checks = [
    { label: t("auth.strengthLength"),    ok: password.length >= 8          },
    { label: t("auth.strengthUppercase"), ok: /[A-Z]/.test(password)        },
    { label: t("auth.strengthNumber"),    ok: /[0-9]/.test(password)        },
    { label: t("auth.strengthSpecial"),   ok: /[^A-Za-z0-9]/.test(password) },
  ];
  if (!password) return { score: 0, label: "", color: "#e5e7eb", width: "0%", checks };
  const passed = checks.filter(c => c.ok).length;
  const map: Record<number, Omit<StrengthResult, "checks" | "width">> = {
    1: { score: 1, label: t("auth.strengthWeak"),   color: "#ef4444" },
    2: { score: 2, label: t("auth.strengthFair"),   color: "#f59e0b" },
    3: { score: 3, label: t("auth.strengthGood"),   color: "#3b82f6" },
    4: { score: 4, label: t("auth.strengthStrong"), color: "#22c55e" },
  };
  const { score, label, color } = map[passed] ?? map[1];
  return { score, label, color, width: `${passed * 25}%`, checks };
}

const PasswordStrengthMeter: React.FC<{ password: string; t: (k: string) => string }> = ({ password, t }) => {
  const s = useMemo(() => getStrength(password, t), [password, t]);
  if (!password) return null;
  return (
    <div className="auth-strength">
      <div className="auth-strength__bar-track">
        <div className="auth-strength__bar-fill" style={{ width: s.width, background: s.color }} />
      </div>
      <span className="auth-strength__label" style={{ color: s.color }}>{s.label}</span>
      <ul className="auth-strength__checks">
        {s.checks.map((c, i) => (
          <li key={i} className={`auth-strength__check ${c.ok ? "auth-strength__check--ok" : ""}`}>
            <span className="auth-strength__check-dot" aria-hidden />{c.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

const PasswordMatchIndicator: React.FC<{ password: string; confirm: string; t: (k: string) => string }> = ({ password, confirm, t }) => {
  if (!confirm) return null;
  const ok = password === confirm;
  return (
    <p className={`auth-match-indicator ${ok ? "auth-match-indicator--ok" : "auth-match-indicator--err"}`} aria-live="polite">
      <span className="auth-match-indicator__dot" aria-hidden />
      {ok ? t("auth.passwordsMatch") : t("auth.passwordMismatch")}
    </p>
  );
};

// ── Form types ─────────────────────────────────────────────────────────────────

interface FormState extends SignUpPayload {
  confirmPassword: string;
  city:    string;
  country: string;
}

const INITIAL: FormState = {
  email: "", password: "", confirmPassword: "",
  first_name: "", last_name: "",
  phone: "", address: "",
  city: "", country: "",
};

// ── Page ───────────────────────────────────────────────────────────────────────

const SignUpPage: React.FC = () => {
  const { t }           = useTranslation();
  const navigate        = useNavigate();
  const { signUp }      = useClientAuth();
  const { currentLang } = useLangContext();
  const { logo, name: STORE_NAME, serviceableCities: cities } = useStoreConfig();

  const lang        = selectedLang(currentLang);
  const phoneLabels = lang === "fr" ? localeFr : lang === "ar" ? localeAr : localeEn;

  const [form,       setForm]       = useState<FormState>(INITIAL);
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);

  const strength = useMemo(() => getStrength(form.password, t), [form.password, t]);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handlePhoneChange = (value?: string) => {
    const phone = value ?? "";
    if (!phone) {
      setPhoneError(null);
    } else if (!isPossiblePhoneNumber(phone)) {
      setPhoneError(t("form.phone.invalidLength"));
    } else if (!isValidPhoneNumber(phone)) {
      setPhoneError(t("form.phone.invalidFormat"));
    } else {
      setPhoneError(null);
    }
    setForm(prev => ({ ...prev, phone }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.phone) { setError(t("form.phone.required")); return; }
    if (phoneError)  return;
    if (!form.address.trim()) { setError(t("form.address.required")); return; }
    if (!form.city)  { setError(t("form.city.required")); return; }
    if (form.password !== form.confirmPassword) { setError(t("auth.passwordMismatch")); return; }
    if (form.password.length < 8) { setError(t("auth.passwordTooShort")); return; }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await signUp(payload);
      setSuccess(true);
    } catch (err: any) {
      const data = err?.response?.data;
      setError(data?.error ?? data?.email?.[0] ?? t("auth.genericError"));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !loading &&
    strength.score >= 2 &&
    form.password === form.confirmPassword &&
    !phoneError &&
    !!form.phone;

  // ── Success ────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="auth-page auth-page--centered">
        <div className="auth-card auth-card--success">
          <FaCheckCircle className="auth-success-icon" aria-hidden />
          <h1 className="auth-card__title">{t("auth.successTitle")}</h1>
          <p className="auth-card__sub">{t("auth.successSub", { email: form.email })}</p>
          <button className="auth-btn auth-btn--primary" onClick={() => navigate("/signin")}>
            {t("auth.goToSignIn")}
          </button>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <div className="auth-page">

      {/* Brand panel */}
      <div className="auth-panel auth-panel--brand">
        <img src={logo.white} alt={STORE_NAME} className="auth-brand-logo" />
        <p className="auth-brand-tagline">{t("auth.brandTagline")}</p>
        <div className="auth-brand-circles" aria-hidden><span /><span /><span /></div>
      </div>

      {/* Form panel */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-card">
          <h1 className="auth-card__title">{t("auth.signUpTitle")}</h1>
          <p className="auth-card__sub">
            {t("auth.haveAccount")}{" "}
            <Link to="/signin" className="auth-link">{t("auth.signInLink")}</Link>
          </p>

          {error && <div className="auth-alert auth-alert--error" role="alert">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* Name row */}
            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="su-firstname" className="auth-field__label">
                  {t("auth.firstNameLabel")} *
                </label>
                <div className="auth-field__input-wrap">
                  <FaUser className="auth-field__icon" aria-hidden />
                  <input id="su-firstname" type="text" autoComplete="given-name" required
                    value={form.first_name} onChange={set("first_name")}
                    placeholder={t("auth.firstNamePlaceholder")}
                    className="auth-field__input" />
                </div>
              </div>
              <div className="auth-field">
                <label htmlFor="su-lastname" className="auth-field__label">
                  {t("auth.lastNameLabel")} *
                </label>
                <div className="auth-field__input-wrap">
                  <FaUser className="auth-field__icon" aria-hidden />
                  <input id="su-lastname" type="text" autoComplete="family-name" required
                    value={form.last_name} onChange={set("last_name")}
                    placeholder={t("auth.lastNamePlaceholder")}
                    className="auth-field__input" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="su-email" className="auth-field__label">
                {t("auth.emailLabel")} *
              </label>
              <div className="auth-field__input-wrap">
                <FaEnvelope className="auth-field__icon" aria-hidden />
                <input id="su-email" type="email" autoComplete="email" required
                  value={form.email} onChange={set("email")}
                  placeholder={t("auth.emailPlaceholder")}
                  className="auth-field__input" />
              </div>
            </div>

            {/* Phone — PhoneInput, required */}
            <div className="auth-field">
              <label className="auth-field__label">
                {t("auth.phoneLabel")} *
              </label>
              <div className="auth-phone-wrap">
                <PhoneInput
                  labels={phoneLabels}
                  defaultCountry="MA"
                  international={false}
                  value={form.phone}
                  onChange={handlePhoneChange}
                />
              </div>
              {phoneError && (
                <small className="auth-field__error">{phoneError}</small>
              )}
            </div>

            {/* Address — required */}
            <div className="auth-field">
              <label htmlFor="su-address" className="auth-field__label">
                {t("auth.addressLabel")} *
              </label>
              <div className="auth-field__input-wrap auth-field__input-wrap--textarea">
                <FaMapMarkerAlt className="auth-field__icon auth-field__icon--top" aria-hidden />
                <textarea id="su-address" autoComplete="street-address" required
                  value={form.address} onChange={set("address")}
                  placeholder={t("auth.addressPlaceholder")}
                  className="auth-field__input auth-field__input--textarea"
                  rows={2} />
              </div>
            </div>

            {/* City / Country row */}
            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="su-city" className="auth-field__label">
                  {t("form.city.label")} *
                </label>
                <div className="auth-field__input-wrap">
                  <FaCity className="auth-field__icon" aria-hidden />
                  <select id="su-city" required
                    value={form.city} onChange={set("city")}
                    className="auth-field__input auth-field__input--select">
                    <option value="">{t("form.selectCity")}</option>
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="auth-field">
                <label htmlFor="su-country" className="auth-field__label">
                  {t("form.country.label")}
                </label>
                <div className="auth-field__input-wrap">
                  <FaGlobe className="auth-field__icon" aria-hidden />
                  <input id="su-country" type="text" autoComplete="country-name"
                    value={form.country} onChange={set("country")}
                    placeholder={t("auth.countryPlaceholder")}
                    className="auth-field__input" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="su-password" className="auth-field__label">
                {t("auth.passwordLabel")} *
              </label>
              <div className="auth-field__input-wrap">
                <FaLock className="auth-field__icon" aria-hidden />
                <input id="su-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password" required minLength={8}
                  value={form.password} onChange={set("password")}
                  placeholder="••••••••"
                  className="auth-field__input" />
                <button type="button" className="auth-field__toggle"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? t("auth.hidePassword") : t("auth.showPassword")}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <PasswordStrengthMeter password={form.password} t={t} />
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label htmlFor="su-confirm" className="auth-field__label">
                {t("auth.confirmPasswordLabel")} *
              </label>
              <div className="auth-field__input-wrap">
                <FaLock className="auth-field__icon" aria-hidden />
                <input id="su-confirm"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password" required
                  value={form.confirmPassword} onChange={set("confirmPassword")}
                  placeholder="••••••••"
                  className={`auth-field__input ${
                    form.confirmPassword && form.confirmPassword !== form.password
                      ? "auth-field__input--error"
                      : form.confirmPassword && form.confirmPassword === form.password
                      ? "auth-field__input--success"
                      : ""
                  }`} />
                <button type="button" className="auth-field__toggle"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? t("auth.hidePassword") : t("auth.showPassword")}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <PasswordMatchIndicator password={form.password} confirm={form.confirmPassword} t={t} />
            </div>

            <button type="submit" className="auth-btn auth-btn--primary" disabled={!canSubmit}>
              {loading
                ? <span className="auth-btn__spinner" aria-hidden />
                : t("auth.signUpBtn")}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;