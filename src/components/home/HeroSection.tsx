import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import HeroIllustration from "../../illustrations/HeroIllustration";

const SLIDE_KEYS = ["slide1", "slide2", "slide3"] as const;

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDE_KEYS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const key = SLIDE_KEYS[current];

  return (
    <section className="hero-section">
      <div className="hero-inner">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <span className="hero-tag">{t(`home.hero.${key}.tag`)}</span>
            <h1 className="hero-headline">{t(`home.hero.${key}.headline`)}</h1>
            <p className="hero-sub">{t(`home.hero.${key}.sub`)}</p>
            <div className="hero-actions">
              <button className="hero-btn-primary" onClick={() => navigate("/products")}>
                {t("home.hero.cta")}
              </button>
              <button
                className="hero-btn-ghost"
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("home.hero.howItWorks")}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <HeroIllustration className="hero-visual__svg" />
        </motion.div>
      </div>

      <div className="hero-dots">
        {SLIDE_KEYS.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? "hero-dot--active" : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
