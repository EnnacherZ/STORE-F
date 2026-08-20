import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { connecter } from "../../server/connecter";
import { Product } from "../../contexts/ProductsContext";
import { getDiscountedPrice } from "../../utils/pricing";

const SkeletonCard: React.FC = () => (
  <div className="featured-card featured-card--skeleton" aria-hidden>
    <div className="featured-card__img-wrap skeleton-block" />
    <div className="featured-card__body">
      <div className="skeleton-line skeleton-line--short" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line--medium" />
    </div>
  </div>
);

const FeaturedProducts: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await connecter.get("api/products/get?newest=true");
        setProducts((res.data.products ?? res.data ?? []).slice(0, 8));
      } catch {
        // fail silently — section just won't render cards
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="featured-section">
      <div className="section-header">
        <h2 className="section-title">{t("home.featured")}</h2>
        <p className="section-sub">{t("home.featuredSub")}</p>
      </div>

      <div className="featured-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((p, i) => {
              const finalPrice = getDiscountedPrice(p.price, p.promo).toFixed(2);
              return (
                <motion.div
                  key={p.id}
                  className="featured-card"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() =>
                    navigate(`/product/${p.product_type}/${p.category}/${p.ref}/${p.id}`)
                  }
                >
                  <div className="featured-card__img-wrap">
                    {p.promo > 0 && (
                      <span className="featured-card__promo-badge">-{p.promo}%</span>
                    )}
                    <img src={p.image} alt={p.name} className="featured-card__img" loading="lazy" />
                  </div>
                  <div className="featured-card__body">
                    <span className="featured-card__type">
                      {t(`productTypes.${p.product_type.toLowerCase()}`, { defaultValue: p.product_type })}
                    </span>
                    <h3 className="featured-card__name">{p.name}</h3>
                    <div className="featured-card__footer">
                      <span className="featured-card__price">{finalPrice} {t("product.currency")}</span>
                      {p.promo > 0 && (
                        <span className="featured-card__original">
                          {p.price.toFixed(2)} {t("product.currency")}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>

      <div className="featured-section__more">
        <button className="btn-outline" onClick={() => navigate("/products")}>
          {t("home.viewAll")} →
        </button>
      </div>
    </section>
  );
};

export default FeaturedProducts;
