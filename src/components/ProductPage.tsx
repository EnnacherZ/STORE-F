import React, { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import Footer from "./Footer";
import Products from "./Products";
import Loading from "./Loading";
import NoProduct from "./NoProduct";
import { DataToFilter } from "./FilterSection";
import {
  filterData,
  categories as fallbackCategories,
} from "./constants";
import { productBanner, productTitle } from "../config/taxonomy.config";
import { useProductsHandler } from "../server/productsHandler";
import { useParametersContext } from "../contexts/ParametersContext";
import "../styles/ProductPage.css";
import CapDuoOffer from "./CapDuoOffer";

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
  const { categories } = useParametersContext();
  const [searchParams] = useSearchParams();

  const { products, isLoading } = useProductsHandler(productType ?? "");
  const [selectedCriteria, setSelectedCriteria] = useState<DataToFilter>(DEFAULT_FILTER);
  const isCapPage = productType?.trim().toLowerCase() === "cap";
  const [capPurchaseOption, setCapPurchaseOption] = useState<"single" | "duo">(
    isCapPage && searchParams.get("offer") === "cap-duo" ? "duo" : "single"
  );

  // Derived — no useEffect needed, useMemo keeps it in sync with both deps
  const filteredProducts = useMemo(
    () => filterData(products, selectedCriteria),
    [products, selectedCriteria]
  );

  const handleFilter = (criteria: DataToFilter) => setSelectedCriteria(criteria);
  const handleReset  = () => setSelectedCriteria(DEFAULT_FILTER);

  if (!productType) return <Loading message={t("ui.loading")} />;

  // Product types come from the backend and are not limited to the four
  // original exact spellings. Resolve known banner assets case-insensitively.
  const normalizedType = productType.trim().toLowerCase();
  const configuredType = Object.keys(productTitle).find((type) => {
    const normalizedConfiguredType = type.toLowerCase();
    return normalizedType === normalizedConfiguredType
      || normalizedType === `${normalizedConfiguredType}s`;
  });
  const banner = configuredType ? productBanner[configuredType as keyof typeof productBanner] : undefined;
  const fallbackTitle = configuredType ? productTitle[configuredType as keyof typeof productTitle] : productType;
  const translationType = configuredType?.toLowerCase() ?? normalizedType.replace(/s$/, '');
  const title = t(`productTypes.${translationType}`, { defaultValue: fallbackTitle });
  const cats = (categories?.[productType] as string[] | undefined)
    ?? (configuredType ? fallbackCategories[configuredType as keyof typeof fallbackCategories] : [])
    ?? [];

  return (
    <>
      <Header />

      {/* ── Collection hero ──────────────────────────────────────────────── */}
      <section className={`product-collection-hero${banner ? '' : ' product-collection-hero--fallback'}`}>
        {banner && <img className="product-collection-hero__image" src={banner} alt="" aria-hidden />}
        <div className="product-collection-hero__overlay" />
        <div className="product-collection-hero__content">
          <nav className="product-collection-hero__breadcrumb" aria-label="Breadcrumb">
            <Link to="/Home">{t('nav.home')}</Link>
            <span aria-hidden>/</span>
            <span aria-current="page">{title}</span>
          </nav>

          <div className="product-collection-hero__heading-row">
            <div>
              <p className="product-collection-hero__eyebrow">{t('product.collection')}</p>
              <h1>{title}</h1>
            </div>
          </div>

          <p className="product-collection-hero__description">
            {t('product.collectionDescription', { type: title.toLowerCase() })}
          </p>

          {!isLoading && (
            <div className="product-collection-hero__stats">
              <strong>{t('product.productsCount', { count: products.length })}</strong>
              {cats.length > 0 && (
                <span>{t('product.categoriesCount', { count: cats.length })}</span>
              )}
            </div>
          )}
        </div>
      </section>

      {cats.length > 0 && (
        <div className="product-category-overview" aria-label={t('product.category') as string}>
          <span className="product-category-overview__label">{t('product.category')}</span>
          <div className="product-category-overview__list">
            {cats.map((cat) => (
              <span key={cat} className="product-category-overview__chip">{cat}</span>
            ))}
          </div>
        </div>
      )}

      {isCapPage && !isLoading && products.length > 0 && (
        <div className="cap-options" dir="rtl">
          <button
            type="button"
            className={capPurchaseOption === "single" ? "cap-options__active" : ""}
            onClick={() => setCapPurchaseOption("single")}
          >
            كاسكيطة وحدة <strong>90 DH</strong>
          </button>
          <button
            type="button"
            className={capPurchaseOption === "duo" ? "cap-options__active" : ""}
            onClick={() => setCapPurchaseOption("duo")}
          >
            جوج كاسكيطات من اختيارك <strong>155 DH</strong>
          </button>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {/* isLoading is a real flag from the hook now — no more inferring
          "still fetching" from array identity, which used to flash
          NoProduct on every page load before data arrived. */}
      {isLoading ? (
        <Loading message={t("product.loading")} />
      ) : products.length === 0 ? (
        <NoProduct />
      ) : isCapPage && capPurchaseOption === "duo" ? (
        <CapDuoOffer products={products} />
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
