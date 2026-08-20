import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { TbRosetteDiscount } from "react-icons/tb";
import { homePagePromotion } from "../constants";

const PromoSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="promo-section">
      <motion.div
        className="promo-inner"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <div className="promo-icon-wrap">
          <TbRosetteDiscount size={44} aria-hidden />
        </div>
        <h2 className="promo-title">{t("promo.title")} {`%${homePagePromotion}`}</h2>
        <p className="promo-sub">{t("promo.sub")}</p>
        <button className="promo-btn" onClick={() => navigate("/products?promo=true")}>
          {t("promo.cta")}
        </button>
      </motion.div>
    </section>
  );
};

export default PromoSection;
