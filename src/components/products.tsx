import React, { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Bounce, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { FaCartPlus } from "react-icons/fa6";
import { RiErrorWarningLine } from "react-icons/ri";
import { useState } from "react";

import { CartItem, useCart } from "../contexts/CartContext";
import { Product } from "../contexts/ProductsContext";
import { useLangContext } from "../contexts/LanguageContext";
import { selectedLang } from "./constants";
import FilterSection, { DataToFilter } from "./FilterSection";
import NotFound from "./NotFound";
import Loading from "./loading";
import "../styles/products.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SizeSelection {
  size:     string | number;
  quantity: number;
}

interface ProductsProps {
  productsData: Product[];
  productType:  string;
  handleFilter: (criteria: DataToFilter) => void;
  handleReset:  () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = Number(import.meta.env.VITE_PAGINATION) || 12;

// ─── Animation variants ───────────────────────────────────────────────────────

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Injects Cloudinary auto-format + quality transforms for image URLs that go through /upload/ */
const optimizeImageUrl = (url: string, width = 400): string =>
  url.includes("/upload/")
    ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`)
    : url;

const getDiscountedPrice = (price: number, promo: number): string =>
  (price * (1 - promo * 0.01)).toFixed(2);

// ─── Component ────────────────────────────────────────────────────────────────

const Products: React.FC<ProductsProps> = ({
  productsData,
  productType,
  handleFilter,
  handleReset,
}) => {
  const navigate        = useNavigate();
  const { addItem }     = useCart();
  const { t }           = useTranslation();
  const { currentLang } = useLangContext();
  const isRtl = selectedLang(currentLang) === "ar";

  const [sizeSelections, setSizeSelections] = useState<Record<number, SizeSelection>>({});
  const [currentPage,    setCurrentPage]    = useState(0);

  // ── Pagination ───────────────────────────────────────────────────────────────

  const pageCount = Math.ceil(productsData.length / ITEMS_PER_PAGE);

  const displayedProducts = useMemo(
    () =>
      productsData.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
      ),
    [productsData, currentPage]
  );

  // Reset to page 0 on filter change
  const prevDataRef = useRef(productsData);
  if (prevDataRef.current !== productsData) {
    prevDataRef.current = productsData;
    if (currentPage !== 0) setCurrentPage(0);
  }

  // ── Size selection ────────────────────────────────────────────────────────────

  const handleSizeSelect = (
    productId: number,
    size: string | number,
    quantity: number
  ) => {
    setSizeSelections((prev) => ({
      ...prev,
      [productId]:
        // Toggle: clicking the already-selected size deselects it
        prev[productId]?.size === size
          ? undefined as unknown as SizeSelection
          : { size, quantity },
    }));
  };

  const isSelectedSizeInStock = (productId: number): boolean => {
    const sel = sizeSelections[productId];
    return !sel || sel.quantity > 0;
  };

  // ── Cart action ───────────────────────────────────────────────────────────────

  const handleAddToCart = (product: Product) => {
    const sel = sizeSelections[product.id];

    if (!sel) {
      toast.error(t("cart.sizeNotSelected"), {
        position:        "top-center",
        autoClose:       2000,
        hideProgressBar: false,
        closeOnClick:    false,
        pauseOnHover:    false,
        draggable:       true,
        theme:           "colored",
        transition:      Bounce,
      });
      return;
    }

    const item: CartItem = {
      product_type: product.product_type,
      id:           product.id,
      category:     product.category,
      ref:          product.ref,
      name:         product.name,
      price:        product.price,
      size:         sel.size,
      quantity:     1,
      image:        product.image,
      promo:        product.promo,
      maxQuantity:  sel.quantity,
    };

    addItem(item);

    toast.success(t("cart.addSuccess"), {
      autoClose:       2000,
      hideProgressBar: false,
      closeOnClick:    false,
      pauseOnHover:    false,
      draggable:       true,
      theme:           "colored",
      transition:      Bounce,
    });
  };

  // ── Navigation helper ─────────────────────────────────────────────────────────

  const goToProductDetail = (product: Product) => {
    navigate(
      `/productDetails/${product.product_type}/${product.category}/${product.ref}/${product.id}`
    );
  };

  // ── Guard ─────────────────────────────────────────────────────────────────────

  if (!productsData) return <Loading message={t("product.loading")} />;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="products-layout" dir={isRtl ? "rtl" : "ltr"}>
        <FilterSection
          handleFilter={handleFilter}
          productType={productType}
          handleReset={handleReset}
        />

        {productsData.length > 0 ? (
          <div className="products-grid">
            {displayedProducts.map((product, index) => {
              const sel         = sizeSelections[product.id];
              const inStock     = isSelectedSizeInStock(product.id);
              const hasPromo    = product.promo > 0;
              const finalPrice  = getDiscountedPrice(product.price, product.promo);
              const origPrice   = product.price.toFixed(2);

              return (
                <motion.article
                  key={product.id}
                  className="product-card"
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  {/* ── Image ──────────────────────────────────────── */}
                  <div
                    className="product-card__image-wrap"
                    onClick={() => goToProductDetail(product)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${t("product.view")} ${product.name}`}
                    onKeyDown={(e) => e.key === "Enter" && goToProductDetail(product)}
                  >
                    <img
                      src={optimizeImageUrl(product.image)}
                      alt={product.name}
                      loading="lazy"
                      className="product-card__img"
                    />

                    {/* Promo badge */}
                    {hasPromo && (
                      <span className="product-card__promo-badge" aria-label={`${product.promo}% off`}>
                        -{product.promo}%
                      </span>
                    )}
                  </div>

                  {/* ── Info ───────────────────────────────────────── */}
                  <div
                    className="product-card__body"
                    onClick={() => goToProductDetail(product)}
                    role="button"
                    tabIndex={-1}
                    aria-hidden
                  >
                    <p className="product-card__meta">
                      {product.category} · {product.ref}
                    </p>
                    <p className="product-card__name">{product.name}</p>

                    <div className="product-card__price-row">
                      <span className="product-card__price--final">
                        {finalPrice} {t("product.currency")}
                      </span>
                      {hasPromo && (
                        <span className="product-card__price--original">
                          {origPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Sizes ──────────────────────────────────────── */}
                  <div className="product-card__sizes-section">
                    <span className="product-card__sizes-label">
                      {t("product.sizes")}
                    </span>
                    <div className="product-card__size-grid" role="group" aria-label="Available sizes">
                      {product.stock.map((stockItem, si) => {
                        const outOfStock = stockItem.quantity === 0;
                        const isSelected = sel?.size === stockItem.size;
                        return (
                          <button
                            key={si}
                            className={[
                              "size-chip",
                              isSelected  && "size-chip--selected",
                              outOfStock  && "size-chip--out-of-stock",
                            ].filter(Boolean).join(" ")}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!outOfStock) handleSizeSelect(product.id, stockItem.size, stockItem.quantity);
                            }}
                            disabled={outOfStock}
                            aria-pressed={isSelected}
                            aria-label={`${t("product.size")} ${stockItem.size}${outOfStock ? `, ${t("product.soldOut")}` : ""}`}
                          >
                            {stockItem.size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Add to cart ─────────────────────────────────── */}
                  <button
                    className={[
                      "product-card__cta-btn",
                      !inStock && "product-card__cta-btn--sold-out",
                    ].filter(Boolean).join(" ")}
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                    disabled={!inStock}
                    aria-disabled={!inStock}
                  >
                    {inStock ? (
                      <><FaCartPlus aria-hidden /> {t("product.addToCart")}</>
                    ) : (
                      <><RiErrorWarningLine aria-hidden /> {t("product.soldOut")}</>
                    )}
                  </button>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <NotFound onReset={handleReset} />
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────── */}
      {pageCount > 1 && (
        <ReactPaginate
          previousLabel={`‹ ${t("pagination.previous")}`}
          nextLabel={`${t("pagination.next")} ›`}
          breakLabel="…"
          pageCount={pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={({ selected }) => {
            setCurrentPage(selected);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          forcePage={currentPage}
          containerClassName="pagination"
          activeClassName="pagination__page--active"
          previousClassName="pagination__prev"
          nextClassName="pagination__next"
          pageClassName="pagination__page"
          breakClassName="pagination__break"
          disabledClassName="pagination__item--disabled"
        />
      )}
    </>
  );
};

export default Products;