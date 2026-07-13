import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const NewsletterSection: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error(t("newsletter.invalid"));
      return;
    }
    setSubmitted(true);
    toast.success(t("newsletter.success"));
  };

  return (
    <section className="newsletter-section">
      <motion.div
        className="newsletter-inner"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="newsletter-eyebrow">{t("newsletter.eyebrow")}</span>
        <h2 className="newsletter-title">{t("newsletter.title")}</h2>
        <p className="newsletter-sub">{t("newsletter.sub")}</p>

        {submitted ? (
          <p className="newsletter-thanks">{t("newsletter.thanks")}</p>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              className="newsletter-input"
              placeholder={t("form.email.label")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">
              {t("newsletter.cta")}
            </button>
          </form>
        )}
      </motion.div>
    </section>
  );
};

export default NewsletterSection;
