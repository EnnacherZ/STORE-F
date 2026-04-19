import React, { useMemo, useState } from "react";
import { useParams} from "react-router-dom";
import { useTranslation } from "react-i18next";
import Marquee from "react-fast-marquee";
import Header from "./Header";
import Footer from "./Footer";
import Products from "./products";
import Loading from "./loading";
import NoProduct from "./NoProduct";
import { DataToFilter } from "./FilterSection";
import { filterData, categories, productTitle, productBanner, productIcon
 } from "./constants";
import { useProductsHandler } from "../server/productsHandler";
import "../styles/ProductPage.css";

// ── Default filter state (stable reference — defined outside component) ──────
const DEFAULT_FILTER: DataToFilter = {
  product: "",
  category: "",
  ref: "",
  name: "",
};

const ProductPage: React.FC = () => {
  const { productType } = useParams<{ productType: string }>();
  const { t } = useTranslation();

  const { products } = useProductsHandler(productType ?? "");
  const [selectedCriteria, setSelectedCriteria] = useState<DataToFilter>(DEFAULT_FILTER);

  // Derived — no useEffect needed, useMemo keeps it in sync with both deps
  const filteredProducts = useMemo(
    () => filterData(products ?? [], selectedCriteria),
    [products, selectedCriteria]
  );

  const handleFilter = (criteria: DataToFilter) => setSelectedCriteria(criteria);
  const handleReset  = () => setSelectedCriteria(DEFAULT_FILTER);

  if (!productType) return <Loading message={t("ui.loading")} />;

  // Icon and title for this product type
  const TitleIcon = productIcon[productType as keyof typeof productIcon];
  const banner    = productBanner[productType as keyof typeof productBanner];
  const title     = productTitle[productType as keyof typeof productTitle];
  const cats      = categories[productType as keyof typeof categories] ?? [];

  return (
    <>
      <Header />

      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <div className="product-banner">
        <img src={banner} alt={`${title} banner`} />
      </div>

      {/* ── Title ───────────────────────────────────────────────────────── */}
      <div className="product-page-title" role="heading" aria-level={1}>
        {<TitleIcon className="product-page-title__icon" aria-hidden />}
        <span>{title}</span>
        {<TitleIcon className="product-page-title__icon" aria-hidden />}
      </div>

      {/* ── Category marquee ────────────────────────────────────────────── */}
      <div className="product-page-marquee" aria-hidden>
        <Marquee speed={50} gradient={false}>
          {cats.map((cat, i) => (
            <span key={i} className="product-page-marquee__item">
              ● {cat}
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {products === null ? (
        <Loading message={t("product.loading")} />
      ) : products.length === 0 ? (
        <NoProduct />
      ) : (
        <Products
          productsData={filteredProducts}
          productType={productType}
          handleFilter={handleFilter}
          handleReset={handleReset}
        />
      )}

      <Footer />
    </>
  );
};

export default ProductPage;