import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa6";

const REVIEWS = [
  { name: "F.Z.", city: "review.city1", stars: 5, key: "r1" },
  { name: "Y.M.", city: "review.city2", stars: 5, key: "r2" },
  { name: "A.B.", city: "review.city3", stars: 4, key: "r3" },
];

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div className="testimonial-stars" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} color={i < count ? "#0e92e4" : "#ddd"} aria-hidden />
    ))}
  </div>
);

const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="testimonials-section">
      <div className="section-header">
        <h2 className="section-title">{t("testimonials.title")}</h2>
        <p className="section-sub">{t("testimonials.sub")}</p>
      </div>

      <div className="testimonials-grid">
        {REVIEWS.map((r, i) => (
          <motion.div
            key={i}
            className="testimonial-card"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Stars count={r.stars} />
            <p className="testimonial-text">"{t(`testimonials.${r.key}`)}"</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{r.name.charAt(0)}</div>
              <p className="testimonial-name">{r.name}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
