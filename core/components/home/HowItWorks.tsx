import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BrowseIcon, SizeIcon, OrderIcon, DeliveryIcon } from "../../illustrations/StepIcons";

const STEPS = [
  { num: "01", Icon: BrowseIcon,   key: "step1" },
  { num: "02", Icon: SizeIcon,     key: "step2" },
  { num: "03", Icon: OrderIcon,    key: "step3" },
  { num: "04", Icon: DeliveryIcon, key: "step4" },
];

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="hiw-section" id="how-it-works">
      <div className="section-header">
        <h2 className="section-title">{t("hiw.title")}</h2>
        <p className="section-sub">{t("hiw.sub")}</p>
      </div>

      <div className="hiw-steps">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.num}>
            <motion.div
              className="hiw-step"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="hiw-step__top">
                <span className="hiw-step__icon-wrap">
                  <step.Icon />
                </span>
                <span className="hiw-step__num">{step.num}</span>
              </div>
              <h3 className="hiw-step__title">{t(`hiw.${step.key}.title`)}</h3>
              <p className="hiw-step__desc">{t(`hiw.${step.key}.desc`)}</p>
            </motion.div>

            {i < STEPS.length - 1 && <div className="hiw-connector" aria-hidden>→</div>}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
