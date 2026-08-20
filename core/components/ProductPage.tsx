import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Marquee from "react-fast-marquee";
import Header from "./Header";
import Footer from "./Footer";
import Products from "./products";
import Loading from "./loading";
import NoProduct from "./NoProduct";
import { DataToFilter } from "./FilterSection";
import { filterData } from "./constants";
import { useStoreConfig } from "../config/StoreConfigContext";
import { useProductsHandler } from "../server/productsHandler";
import { useParametersContext } from "../contexts/ParametersContext";
import { getCategoryIcon } from "../illustrations/CategoryIcons";
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

  const { products, isLoading } = useProductsHandler(productType ?? "");
  const { categories } = useParametersContext();
  const { taxonomy } = useStoreConfig();
  const [selectedCriteria, setSelectedCriteria] = useState<DataToFilter>(DEFAULT_FILTER);

  // Derived — no useEffect needed, useMemo keeps it in sync with both deps
  const filteredProducts = useMemo(
    () => filterData(products, selectedCriteria),
    [products, selectedCriteria]
  );

  const handleFilter = (criteria: DataToFilter) => setSelectedCriteria(criteria);
  const handleReset  = () => setSelectedCriteria(DEFAULT_FILTER);

  if (!productType) return <Loading message={t("ui.loading")} />;

  // Backend product types may differ in case or may be newly configured.
  // Never pass an undefined component type to React.
  const normalizedType = productType.trim().toLowerCase();
  const configuredType = Object.keys(taxonomy.title).find(
    (type) => type.toLowerCase() === normalizedType
  ) ?? productType;
  const TitleIcon = taxonomy.icon[configuredType] ?? getCategoryIcon(productType);
  const banner    = taxonomy.banner[configuredType];
  const title     = taxonomy.title[configuredType] ?? productType;
  const cats      = (categories?.[productType as string] as string[] | undefined) ?? [];

  return (
    <>
      <Header />

      {/* ── Banner ──────────────────────────────────────────────────────── */}
      {banner && (
        <div className="product-banner">
          <img src={banner} alt={`${title} banner`} />
        </div>
      )}

      {/* ── Title ───────────────────────────────────────────────────────── */}
      <div className="product-page-title" role="heading" aria-level={1}>
        <TitleIcon className="product-page-title__icon" aria-hidden />
        <span>{title}</span>
        <TitleIcon className="product-page-title__icon" aria-hidden />
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
      {/* isLoading is a real flag from the hook now — no more inferring
          "still fetching" from array identity, which used to flash
          NoProduct on every page load before data arrived. */}
      {isLoading ? (
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
