// account/loyalty/LoyaltyCard.tsx
import React from "react";
import { FaGift, FaStar } from "react-icons/fa";

interface Tier {
  label: string;
  color: string;
  next:  number;
  icon:  string;
}

export function getLoyaltyTier(points: number): Tier {
  if (points >= 500) return { label: "Platinum", color: "#8b5cf6", next: Infinity, icon: "💎" };
  if (points >= 200) return { label: "Gold",     color: "#f59e0b", next: 500,      icon: "🏆" };
  if (points >= 50)  return { label: "Silver",   color: "#64748b", next: 200,      icon: "⭐" };
  return               { label: "Bronze",  color: "#c2855d", next: 50,       icon: "🎖️" };
}

interface LoyaltyCardProps {
  points: number;
  t: (key: string) => string;
}

const LoyaltyCard: React.FC<LoyaltyCardProps> = ({ points, t }) => {
  const tier = getLoyaltyTier(points);
  const pct  = tier.next === Infinity ? 100 : Math.min(100, (points / tier.next) * 100);

  return (
    <div className="acc-loyalty" style={{ "--tier-color": tier.color } as React.CSSProperties}>
      <div className="acc-loyalty__header">
        <span className="acc-loyalty__icon">{tier.icon}</span>
        <div>
          <p className="acc-loyalty__tier">{tier.label}</p>
          <p className="acc-loyalty__label">{t("account.loyaltyLabel")}</p>
        </div>
        <div className="acc-loyalty__pts">
          <span className="acc-loyalty__pts-val">{points}</span>
          <span className="acc-loyalty__pts-lbl">
            <FaStar style={{ color: tier.color, marginRight: 3 }} />
            {t("account.loyaltyPoints")}
          </span>
        </div>
      </div>

      <div className="acc-loyalty__bar-wrap">
        <div className="acc-loyalty__bar">
          <div className="acc-loyalty__bar-fill" style={{ width: `${pct}%` }} />
        </div>
        {tier.next !== Infinity ? (
          <p className="acc-loyalty__bar-hint">
            {tier.next - points} {t("account.loyaltyToNext")} {getLoyaltyTier(tier.next).label}
          </p>
        ) : (
          <p className="acc-loyalty__bar-hint acc-loyalty__bar-hint--max">
            {t("account.loyaltyMax")}
          </p>
        )}
      </div>

      <div className="acc-loyalty__perks">
        <FaGift className="acc-loyalty__perks-icon" />
        <span>{t("account.loyaltyPerks")}</span>
      </div>
    </div>
  );
};

export default LoyaltyCard;