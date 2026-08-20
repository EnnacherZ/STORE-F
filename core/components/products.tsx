import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Bounce, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { FaHeart, FaRegHeart, FaCartPlus } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";

import { CartItem, useCart } from "../contexts/CartContext";
import { Product } from "../contexts/ProductsContext";
import { useLangContext } from "../contexts/LanguageContext";
import { selectedLang } from "./constants";
import FilterSection, { DataToFilter } from "./FilterSection";
import NotFound from "./NotFound";
import Loading from "./loading";
import { getDiscountedPrice as calcDiscountedPrice } from "../utils/pricing";
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
  hidden:  { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Injects Cloudinary auto-format + quality transforms for image URLs that go through /upload/ */
const optimizeImageUrl = (url: string, width = 500): string =>
  url.includes("/upload/")
    ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`)
    : url;

const getDiscountedPrice = (price: number, promo: number): string =>
  calcDiscountedPrice(price, promo).toFixed(2);

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

  const [currentPage, setCurrentPage] = useState(0);

  // Two-step flow: clicking a size only *selects* it (step 1). The actual
  // cart add only happens when the person then clicks the confirm button
  // that appears once a size is chosen (step 2). This replaces the earlier
  // "click a size = instant add" pattern, which made it too easy to add an
  // unwanted item with a single stray tap and gave no chance to reconsider.
  const [sizeSelections, setSizeSelections] = useState<Record<number, SizeSelection>>({});

  // Brief "Added to cart" confirmation state per product, auto-resets.
  const [justAdded, setJustAdded] = useState<Record<number, boolean>>({});

  // Wishlist is a visual-only toggle for now (no backend/persistence yet) —
  // tracked purely in local component state, reset on page reload by design.
  const [wishlisted, setWishlisted] = useState<Record<number, boolean>>({});

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

  // ── Step 1: size selection (toggle) ─────────────────────────────────────────

  const handleSizeSelect = (
    productId: number,
    size: string | number,
    quantity: number
  ) => {
    setSizeSelections((prev) => ({
      ...prev,
      [productId]:
        // Clicking the already-selected size deselects it
        prev[productId]?.size === size
          ? undefined as unknown as SizeSelection
          : { size, quantity },
    }));
  };

  // ── Step 2: confirm add to cart ─────────────────────────────────────────────

  const handleConfirmAdd = (product: Product) => {
    const sel = sizeSelections[product.id];
    if (!sel) return;

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

    // Brief "Added" confirmation, then clear the selection so the card
    // returns to its resting state.
    setJustAdded((prev) => ({ ...prev, [product.id]: true }));
    window.setTimeout(() => {
      setJustAdded((prev) => ({ ...prev, [product.id]: false }));
      setSizeSelections((prev) => ({ ...prev, [product.id]: undefined as unknown as SizeSelection }));
    }, 1100);
  };

  const toggleWishlist = (productId: number) => {
    setWishlisted((prev) => ({ ...prev, [productId]: !prev[productId] }));
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
              const hasPromo     = product.promo > 0;
              const finalPrice   = getDiscountedPrice(product.price, product.promo);
              const origPrice    = product.price.toFixed(2);
              const sel          = sizeSelections[product.id];
              const isWishlisted = !!wishlisted[product.id];
              const wasJustAdded = !!justAdded[product.id];

              return (
                <motion.article
                  key={product.id}
                  className="product-card"
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* ── Image ──────────────────────────────────────── */}
                  <div
                    className={[
                      "product-card__image-wrap",
                      sel && "product-card__image-wrap--selected",
                    ].filter(Boolean).join(" ")}
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

                    {hasPromo ? (
                      <span className="product-card__tag product-card__tag--promo">
                        -{product.promo}%
                      </span>
                    ) : (
                      <span className="product-card__tag">
                        {t("product.label")}
                      </span>
                    )}

                    {/* Wishlist toggle — visual-only state, no persistence yet */}
                    <button
                      className={[
                        "product-card__wishlist-btn",
                        isWishlisted && "product-card__wishlist-btn--active",
                      ].filter(Boolean).join(" ")}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      aria-pressed={isWishlisted}
                      aria-label={
                        isWishlisted
                          ? t("product.removeFromWishlist", { defaultValue: "Remove from wishlist" }) as string
                          : t("product.addToWishlist", { defaultValue: "Add to wishlist" }) as string
                      }
                    >
                      {isWishlisted ? <FaHeart aria-hidden /> : <FaRegHeart aria-hidden />}
                    </button>

                    {/* Quick view — desktop hover reveal, navigates to detail page */}
                    <button
                      className="product-card__quick-view"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToProductDetail(product);
                      }}
                      tabIndex={-1}
                    >
                      {t("product.view")}
                    </button>
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
                      {t(`productTypes.${product.product_type.toLowerCase()}`, {
                        defaultValue: product.product_type,
                      })}
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

                  {/* ── Sizes — step 1: select only, no cart action yet ─ */}
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

                  {/* ── Step 2: confirm button — only appears once a size is picked ── */}
                  <AnimatePresence>
                    {sel && (
                      <motion.button
                        key={wasJustAdded ? "added" : "confirm"}
                        className={[
                          "product-card__confirm-btn",
                          wasJustAdded && "product-card__confirm-btn--added",
                        ].filter(Boolean).join(" ")}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!wasJustAdded) handleConfirmAdd(product);
                        }}
                        disabled={wasJustAdded}
                      >
                        {wasJustAdded ? (
                          <><FaCheck aria-hidden /> {t("cart.addSuccess")}</>
                        ) : (
                          <><FaCartPlus aria-hidden /> {t("product.addToCart")} — {sel.size}</>
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
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