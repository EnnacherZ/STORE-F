// account/profile/ConfirmSaveModal.tsx
import React from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { EditableProfile } from "../utils/types";

interface ConfirmSaveModalProps {
  draft:     EditableProfile;
  current:   EditableProfile;
  onConfirm: () => void;
  onCancel:  () => void;
  saving:    boolean;
  t:         (key: string) => string;
}

const LABEL_MAP_KEYS: (keyof EditableProfile)[] = [
  "first_name", "last_name", "phone", "address", "city", "country",
];

const ConfirmSaveModal: React.FC<ConfirmSaveModalProps> = ({
  draft, current, onConfirm, onCancel, saving, t,
}) => {
  const labelMap: Record<keyof EditableProfile, string> = {
    first_name: t("form.firstName.label"),
    last_name:  t("form.lastName.label"),
    phone:      t("form.phone.label"),
    address:    t("form.address.label"),
    city:       t("form.city.label"),
    country:    t("form.country.label"),
  };

  const changes = LABEL_MAP_KEYS
    .filter(k => draft[k] !== current[k])
    .map(k => ({ label: labelMap[k], from: current[k] || "—", to: draft[k] || "—" }));

  return (
    <>
      <div className="acc-modal-backdrop" onClick={onCancel} />
      <div className="acc-modal" role="dialog" aria-modal="true">
        <div className="acc-modal__header">
          <span className="acc-modal__icon">✏️</span>
          <h3 className="acc-modal__title">{t("account.confirmSaveTitle")}</h3>
          <button className="acc-modal__close" onClick={onCancel} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <p className="acc-modal__sub">{t("account.confirmSaveSub")}</p>

        {changes.length > 0 ? (
          <div className="acc-modal__changes">
            {changes.map((c, i) => (
              <div key={i} className="acc-modal__change-row">
                <span className="acc-modal__change-label">{c.label}</span>
                <div className="acc-modal__change-values">
                  <span className="acc-modal__change-from">{c.from}</span>
                  <span className="acc-modal__change-arrow">→</span>
                  <span className="acc-modal__change-to">{c.to}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="acc-modal__no-changes">{t("account.noChanges")}</p>
        )}

        <div className="acc-modal__actions">
          <button
            className="acc-modal__btn acc-modal__btn--cancel"
            onClick={onCancel}
            disabled={saving}
          >
            <FaTimes /> {t("confirm.cancelBack")}
          </button>
          <button
            className="acc-modal__btn acc-modal__btn--confirm"
            onClick={onConfirm}
            disabled={saving || changes.length === 0}
          >
            {saving
              ? <><span className="acc-modal__spinner" /> …</>
              : <><FaSave /> {t("form.save")}</>}
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmSaveModal;