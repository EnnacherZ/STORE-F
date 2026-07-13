import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useParametersContext } from "../../contexts/ParametersContext";
import { getCategoryIcon } from "../../illustrations/CategoryIcons";

/* A small rotating accent palette so any number of dynamic categories
   still reads as deliberately designed rather than randomly colored.
   All five tones are drawn from / harmonize with the brand blue. */
const ACCENTS = [
  { fg: "#0e92e4", bg: "#e6f3fd" }, // brand blue
  { fg: "#e07b39", bg: "#fdf0e6" }, // warm coral
  { fg: "#1d9e75", bg: "#e3f6ef" }, // teal green
  { fg: "#7f77dd", bg: "#eeedfe" }, // soft purple
  { fg: "#d4537e", bg: "#fbeaf0" }, // pink
  { fg: "#c9a84c", bg: "#faf3e2" }, // gold
];

const CategoryGrid: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { productTypes } = useParametersContext();

  const isLoading = !productTypes || productTypes.length === 0;

  return (
    <section className="category-section">
      <div className="section-header">
        <h2 className="section-title">{t("home.shopByCategory")}</h2>
        <p className="section-sub">{t("home.shopByCategorySub")}</p>
      </div>

      <div className="category-grid">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="category-card category-card--skeleton" aria-hidden>
                <div className="category-card__icon-wrap skeleton-block" />
                <div className="skeleton-line skeleton-line--short" />
                <div className="skeleton-line" />
              </div>
            ))
          : productTypes.map((type, i) => {
              const Icon = getCategoryIcon(type);
              const accent = ACCENTS[i % ACCENTS.length];
              const labelKey = `productTypes.${type.toLowerCase()}`;
              const label = t(labelKey, { defaultValue: type });

              return (
                <motion.button
                  key={type}
                  className="category-card"
                  style={
                    {
                      "--cat-fg": accent.fg,
                      "--cat-bg": accent.bg,
                    } as React.CSSProperties
                  }
                  onClick={() => navigate(`/ProductPage/${type}`)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="category-card__icon-wrap">
                    <Icon size={40} />
                  </div>
                  <h3 className="category-card__name">{label}</h3>
                  <p className="category-card__desc">
                    {t(`home.cat.${type.toLowerCase()}Desc`, {
                      defaultValue: t("home.cat.fallbackDesc"),
                    })}
                  </p>
                  <span className="category-card__arrow" aria-hidden>→</span>
                </motion.button>
              );
            })}
      </div>
    </section>
  );
};

export default CategoryGrid;
