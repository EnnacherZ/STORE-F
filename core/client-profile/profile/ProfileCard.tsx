// account/profile/ProfileCard.tsx
import React, { useEffect, useState } from "react";
import "react-phone-number-input/style.css";
import PhoneInput, {
  isValidPhoneNumber,
  isPossiblePhoneNumber,
} from "react-phone-number-input";
import fr from "react-phone-number-input/locale/fr";
import en from "react-phone-number-input/locale/en";
import ar from "react-phone-number-input/locale/ar";

import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaGlobe, FaCity, FaEdit, FaSave, FaTimes,
} from "react-icons/fa";

import { ClientProfile } from "../../contexts/ClientAuthContext";
import { selectedLang } from "../../components/constants";
import { useLangContext } from "../../contexts/LanguageContext";
import { EditableProfile } from "../utils/types";
import AvatarEditor from "./AvatarEditor";
import ConfirmSaveModal from "./ConfirmSaveModal";
import { connecter } from "../../server/connecter";

interface ProfileCardProps {
  client:  ClientProfile;
  t:       (key: string) => string;
  onSaved: () => void;           // triggers ctx.refresh() in parent
}

const ProfileCard: React.FC<ProfileCardProps> = ({ client, t, onSaved }) => {
  const { currentLang } = useLangContext();
  const labels = selectedLang(currentLang) === "fr" ? fr
               : selectedLang(currentLang) === "ar" ? ar
               : en;

  const toEditable = (): EditableProfile => ({
    first_name: client.first_name,
    last_name:  client.last_name,
    phone:      client.phone    ?? "",
    address:    client.address  ?? "",
    city:       client.city     ?? "",
    country:    client.country  ?? "",
  });

  const [editing,    setEditing]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [saveOk,     setSaveOk]     = useState(false);
  const [saveErr,    setSaveErr]    = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [current,    setCurrent]    = useState<EditableProfile>(toEditable);
  const [draft,      setDraft]      = useState<EditableProfile>(toEditable);
  // Local avatar URL — updated immediately after a successful upload
  const [avatarUrl,  setAvatarUrl]  = useState<string | undefined>(client.image);

  // Keep in sync when parent refreshes the client object
  useEffect(() => {
    const e = toEditable();
    setCurrent(e);
    setDraft(e);
    setAvatarUrl(client.image);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.first_name, client.last_name, client.phone, client.address, client.city, client.country, client.image]);

  // ── Field updaters ───────────────────────────────────────────────────────

  const set = (key: keyof EditableProfile) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft(prev => ({ ...prev, [key]: e.target.value }));

  const updatePhone = (value?: string) => {
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
    setDraft(prev => ({ ...prev, phone }));
  };

  const canSave = !phoneError || !draft.phone;

  // ── Save flow ────────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    setSaving(true);
    setSaveErr(null);
    try {
      await connecter.patch("api/client/me/update/", draft);
      setSaveOk(true);
      setEditing(false);
      setShowModal(false);
      setCurrent(draft);
      onSaved();
      setTimeout(() => setSaveOk(false), 3000);
    } catch {
      setSaveErr(t("account.saveError"));
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft(current);
    setPhoneError(null);
  };

  // ── Field definitions ────────────────────────────────────────────────────

  type FieldDef = {
    key:      keyof EditableProfile;
    icon:     React.ReactNode;
    labelKey: string;
    isPhone?: boolean;
  };

  const fields: FieldDef[] = [
    { key: "first_name", icon: <FaUser />,        labelKey: "form.firstName.label" },
    { key: "last_name",  icon: <FaUser />,        labelKey: "form.lastName.label"  },
    { key: "phone",      icon: <FaPhone />,       labelKey: "form.phone.label",    isPhone: true },
    { key: "address",    icon: <FaMapMarkerAlt />, labelKey: "form.address.label"  },
    { key: "city",       icon: <FaCity />,        labelKey: "form.city.label"      },
    { key: "country",    icon: <FaGlobe />,       labelKey: "form.country.label"   },
  ];

  const initials = `${client.first_name[0] ?? ""}${client.last_name[0] ?? ""}`.toUpperCase();

  return (
    <>
      {showModal && (
        <ConfirmSaveModal
          draft={draft}
          current={current}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          saving={saving}
          t={t}
        />
      )}

      {saveOk && (
        <div className="acc-toast acc-toast--ok">✓ {t("account.saveSuccess")}</div>
      )}
      {saveErr && (
        <div className="acc-toast acc-toast--err">✕ {saveErr}</div>
      )}

      <div className="acc-profile-card">
        {/* ── Header ── */}
        <div className="acc-profile-card__header">
          <span className="acc-profile-card__title">{t("account.profileTitle")}</span>
          {!editing ? (
            <button className="acc-profile-edit-btn" onClick={() => setEditing(true)}>
              <FaEdit /> {t("form.modify")}
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="acc-profile-save-btn"
                onClick={() => canSave && setShowModal(true)}
                disabled={saving || !canSave}
              >
                <FaSave /> {t("form.save")}
              </button>
              <button className="acc-profile-cancel-btn" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>
          )}
        </div>

        {/* ── Avatar (always editable, independent of edit mode) ── */}
        <div className="acc-profile-avatar-section">
          <AvatarEditor
            currentUrl={avatarUrl}
            initials={initials}
            t={t}
            onUploaded={url => {
              setAvatarUrl(url);
              onSaved();           // re-fetch so header avatar also updates
            }}
          />
        </div>

        {/* ── Email (read-only) ── */}
        <div className="acc-profile-field">
          <FaEnvelope className="acc-profile-field__icon" />
          <div className="acc-profile-field__content">
            <p className="acc-profile-field__label">{t("auth.emailLabel")}</p>
            <p className="acc-profile-field__val">{client.email}</p>
          </div>
        </div>

        {/* ── Editable fields ── */}
        {fields.map(({ key, icon, labelKey, isPhone }) => (
          <div key={key} className="acc-profile-field">
            <span className="acc-profile-field__icon">{icon}</span>
            <div className="acc-profile-field__content">
              <p className="acc-profile-field__label">{t(labelKey)}</p>

              {editing ? (
                isPhone ? (
                  <>
                    <PhoneInput
                      labels={labels}
                      className="acc-profile-field__input"
                      defaultCountry="MA"
                      international={false}
                      value={draft.phone}
                      onChange={updatePhone}
                    />
                    {phoneError && (
                      <small style={{ color: "#ef4444", marginTop: 4, display: "block" }}>
                        {phoneError}
                      </small>
                    )}
                  </>
                ) : (
                  <input
                    className="acc-profile-field__input"
                    value={draft[key]}
                    onChange={set(key)}
                  />
                )
              ) : (
                <p className="acc-profile-field__val">
                  {current[key] || <em style={{ color: "#cbd5e1" }}>—</em>}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProfileCard;