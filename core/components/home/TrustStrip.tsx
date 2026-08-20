import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { TruckIcon, ShieldCheckIcon, LockIcon, ChatIcon } from "../../illustrations/TrustIcons";

const BADGES = [
  { Icon: TruckIcon,       labelKey: "trust.delivery", subKey: "trust.deliverySub" },
  { Icon: ShieldCheckIcon, labelKey: "trust.quality",  subKey: "trust.qualitySub"  },
  { Icon: LockIcon,        labelKey: "trust.secure",   subKey: "trust.secureSub"   },
  { Icon: ChatIcon,        labelKey: "trust.support",  subKey: "trust.supportSub"  },
];

const TrustStrip: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="trust-strip">
      {BADGES.map((b, i) => (
        <motion.div
          key={i}
          className="trust-badge"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07, duration: 0.4 }}
        >
          <span className="trust-badge__icon">
            <b.Icon />
          </span>
          <div>
            <p className="trust-badge__label">{t(b.labelKey)}</p>
            <p className="trust-badge__sub">{t(b.subKey)}</p>
          </div>
        </motion.div>
      ))}
    </section>
  );
};

export default TrustStrip;
