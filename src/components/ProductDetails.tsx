import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangContext } from "../contexts/LanguageContext";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { type Swiper as SwiperType } from "swiper";
import { FaCartPlus, FaShirt, FaStar } from "react-icons/fa6";
import { TbRosetteDiscount } from "react-icons/tb";
import {
  MdLocalShipping,
  MdOutlineRateReview,
  MdRateReview,
  MdReviews,
  MdVerifiedUser,
} from "react-icons/md";
import { IoAddCircle, IoClose } from "react-icons/io5";
import { LiaShoePrintsSolid } from "react-icons/lia";
import { GiSandal } from "react-icons/gi";
import { PiPantsBold } from "react-icons/pi";
import "swiper/css";
import "swiper/css/bundle";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

import Header from "./Header";
import Footer from "./Footer";
import Loading from "./Loading";
import ModalBackDrop from "./ModalBackdrop";
import ProductCarousel from "./ProductCarousel";
import CommandDetails from "./CommandDetails";
import TextReducer from "./TextReducer";
import { CartItem, useCart } from "../contexts/CartContext";
import { Product, ProductReviews } from "../contexts/ProductsContext";
import { connecter } from "../server/connecter";
import { selectedLang } from "./constants";
import { getCategoryIcon } from "../illustrations/CategoryIcons";
import reviewGuestImg from "../assets/review-guest.jpg";
import "../styles/ProductDetail.css";
import "../styles/HomePage.css";
import "../styles/reviews.css";

// ─── Constants (outside component — never recreated) ─────────────────────────

const MODAL_VARIANTS = {
  hidden:  { y: "-100vh", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "tween", duration: 0.8, ease: "easeInOut" } },
  exit:    { y: "100vh", opacity: 0 },
} as const;

// Icon component + i18n key per product type
// To add a new type: add one entry here — no other file needs changing.
const PRODUCT_TYPE_MAP: Record<string, { Icon: React.ElementType; labelKey: string }> = {
  Shoe:   { Icon: LiaShoePrintsSolid, labelKey: "home.moreShoes"   },
  Sandal: { Icon: GiSandal,           labelKey: "home.moreSandals"  },
  Shirt:  { Icon: FaShirt,            labelKey: "home.moreShirts"   },
  Pant:   { Icon: PiPantsBold,        labelKey: "home.morePants"    },
};

const REVIEWS_PREVIEW = 3;

// ─── Types ───────────────────────────────────────────────────────────────────

interface SizeSelection {
  size:     string | number;
  quantity: number;
}

// ─── ReviewForm — isolated component ─────────────────────────────────────────
// Keeping form state here means typing doesn't re-render ProductDetails at all.

interface ReviewFormProps {
  onSubmit: (data: { name: string; email: string; text: string; stars: number }) => Promise<void>;
  onClose:  () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onClose }) => {
  const { t } = useTranslation();
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [text,    setText]    = useState("");
  const [stars,   setStars]   = useState(0);
  const [loading, setLoading] = useState(false);

  const toggleStar = (n: number) => setStars((prev) => (prev === n ? n - 1 : n));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !text || stars === 0) {
      toast.error("Please fill in all fields and provide a rating.");
      return;
    }
    setLoading(true);
    await onSubmit({ name, email, text, stars });
    setLoading(false);
  };

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      <label className="review-form__label">{t("review.username")}</label>
      <input
        className="review-form__input"
        type="text"
        minLength={1}
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("review.username")}
      />

      <label className="review-form__label">{t("form.email.label")}</label>
      <input
        className="review-form__input"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("form.email.label")}
      />

      <label className="review-form__label">{t("review.stars")}</label>
      <div className="review-form__stars" role="group" aria-label="Star rating">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`review-form__star ${stars >= i + 1 ? "review-form__star--active" : ""}`}
            onClick={() => toggleStar(i + 1)}
            aria-label={`${i + 1} star${i > 0 ? "s" : ""}`}
            aria-pressed={stars >= i + 1}
          >
            <FaStar />
          </button>
        ))}
      </div>

      <label className="review-form__label">{t("review.yourReview")}</label>
      <textarea
        className="review-form__textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={300}
        required
      />

      <div className="review-form__actions">
        <button type="submit" className="review-form__submit" disabled={loading}>
          {loading ? "…" : t("review.submit")}
        </button>
        <button type="button" className="review-form__cancel" onClick={onClose}>
          {t("ui.cancel") ?? "Cancel"}
        </button>
      </div>
    </form>
  );
};

// ─── ProductDetails ───────────────────────────────────────────────────────────

const ProductDetails: React.FC = () => {
  const { productType, category, ref, id } = useParams<{
    productType: string;
    category:    string;
    ref:         string;
    id:          string;
  }>();

  const navigate        = useNavigate();
  const { addItem }     = useCart();
  const { t }           = useTranslation();
  const { currentLang } = useLangContext();
  const isRtl = selectedLang(currentLang) === "ar";

  // ── Data state ──────────────────────────────────────────────────────────
  const [product,  setProduct]  = useState<Product | null>(null);
  const [related,  setRelated]  = useState<Product[]>([]);
  const [reviews,  setReviews]  = useState<ProductReviews[]>([]);

  // ── UI state ────────────────────────────────────────────────────────────
  const [sizeSelection,    setSizeSelection]    = useState<SizeSelection | null>(null);
  const [thumbsSwiper,     setThumbsSwiper]     = useState<SwiperType | null>(null);
  const [mainSwiper,       setMainSwiper]       = useState<SwiperType | null>(null);
  const [isMobile,         setIsMobile]         = useState(false);
  const [showReviewModal,  setShowReviewModal]  = useState(false);
  const [reviewsExpanded,  setReviewsExpanded]  = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // ── Fetch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await connecter.get(
          `api/product/search/get?productType=${productType}&category=${category}&ref=${ref}&id=${id}`
        );
        // No need to await already-resolved object properties
        setProduct(res.data.product);
        setRelated(res.data.products);
        setReviews(res.data.reviews ?? []);
        setActiveImageIndex(0);
        setSizeSelection(null);
      } catch {
        // Handle fetch error gracefully — e.g. show error state
      }
    };
    load();
  }, [productType, category, ref, id]);

  // ── Responsive ──────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 800);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Memoised image list (filter out null/undefined images) ──────────────
  const productImages = useMemo(
    () =>
      product
        ? [product.image, product.image1, product.image2, product.image3, product.image4]
            .filter(Boolean) as string[]
        : [],
    [product]
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  /**
   * Single handler for both "add to cart" and "buy now".
   * @param goToCheckout — navigates to /Checkout after adding when true
   */
  const handleAddToCart = (goToCheckout = false) => {
    if (!product) return;
    if (!sizeSelection) return;

    const item: CartItem = {
      product_type: product.product_type,
      id:           product.id,
      category:     product.category,
      ref:          product.ref,
      name:         product.name,
      price:        product.price,
      size:         sizeSelection.size,
      quantity:     1,
      image:        product.image,
      promo:        product.promo,
      maxQuantity:  sizeSelection.quantity,
    };

    addItem(item, { showConfirmation: !goToCheckout });

    if (goToCheckout) navigate("/Checkout");
  };

  const handleSubmitReview = async (data: {
    name: string; email: string; text: string; stars: number;
  }) => {
    await connecter.post("api/reviews/add/", {
      name:    data.name,
      email:   data.email,
      date:    new Date().toISOString(),   // captured at submission time
      review:  data.text,
      stars:   data.stars,
      product: product?.id,
    });
    // Update local state — no page reload needed
    setReviews((prev) => [
      ...prev,
      { name: data.name, email: data.email,
        date: new Date().toISOString(), review: data.text, stars: data.stars } as ProductReviews,
    ]);
    setShowReviewModal(false);
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (!product) {
    return (
      <>
        <Header />
        <Loading message={t("ui.loading")} />
        <Footer />
      </>
    );
  }

  const finalPrice = (product.price * (1 - product.promo * 0.01)).toFixed(2);
  const origPrice  = product.price.toFixed(2);
  const typeConfig = PRODUCT_TYPE_MAP[product.product_type];
  const RelatedIcon = typeConfig?.Icon ?? getCategoryIcon(product.product_type);
  const isSoldOut = product.stock.every((stockItem) => stockItem.quantity === 0);
  const canPurchase = Boolean(sizeSelection && sizeSelection.quantity > 0);
  const savings = (product.price - Number(finalPrice)).toFixed(2);
  const localizedProductType = t(`productTypes.${product.product_type.toLowerCase()}`, {
    defaultValue: product.product_type,
  });

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Header />

      <nav className={`pd-breadcrumb${isRtl ? " pd-breadcrumb--rtl" : ""}`} aria-label="Breadcrumb">
        <Link to="/Home">{t("nav.home")}</Link>
        <span aria-hidden>/</span>
        <Link to={`/ProductPage/${product.product_type}`}>{localizedProductType}</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      {/* ── Main: images + info side by side ────────────────────────────── */}
      <section
        className={`pd-layout ${isMobile ? "pd-layout--mobile" : ""}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Images column — vertical thumb strip (left) + main image (right) */}
        <div className={`pd-images ${isMobile ? "pd-images--mobile" : ""}`}>

          {/* Thumbnail strip — vertical on desktop, horizontal on mobile */}
          <Swiper
            onSwiper={setThumbsSwiper}
            direction={isMobile ? "horizontal" : "vertical"}
            spaceBetween={8}
            slidesPerView="auto"
            freeMode
            watchSlidesProgress
            modules={[FreeMode, Thumbs]}
            className={`pd-thumbs${isMobile ? " pd-thumbs--mobile" : ""}`}
          >
            {productImages.map((src, i) => (
              <SwiperSlide
                key={i}
                className="pd-thumb"
                role="button"
                tabIndex={0}
                aria-label={`${t("product.preview")} ${i + 1}`}
                aria-current={activeImageIndex === i ? "true" : undefined}
                onClick={() => mainSwiper?.slideTo(i)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    mainSwiper?.slideTo(i);
                  }
                }}
              >
                <img src={src} alt="" aria-hidden loading="lazy" />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Main image */}
          <div className="pd-main-image">
            <Swiper
              className="pd-swiper"
              onSwiper={setMainSwiper}
              spaceBetween={10}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              navigation={productImages.length > 1}
              rewind={productImages.length > 1}
              modules={[Navigation, FreeMode, Thumbs]}
              onSlideChange={(swiper) => setActiveImageIndex(swiper.realIndex)}
            >
              {productImages.map((src, i) => (
                <SwiperSlide key={i}>
                  <img src={src} alt={`${product.name} — view ${i + 1}`} />
                </SwiperSlide>
              ))}
            </Swiper>
            <span className="pd-main-image__count" aria-label={`${productImages.length} images`}>
              {activeImageIndex + 1} / {productImages.length}
            </span>
          </div>
        </div>

        {/* Info column */}
        <div className={`pd-info ${isMobile ? "pd-info--mobile" : ""}`}>

          {/* Meta row: type pill + ref */}
          <div className="pd-info__meta">
            <span className="pd-info__meta-tag">{localizedProductType}</span>
            <span className="pd-info__meta-ref">REF: {product.ref}</span>
            <span className={`pd-info__stock${isSoldOut ? " pd-info__stock--sold-out" : ""}`}>
              <span aria-hidden />
              {isSoldOut ? t("product.soldOut") : t("product.inStock")}
            </span>
          </div>

          {/* Name hierarchy */}
          <h1 className="pd-info__title">{product.name}</h1>
          <p className="pd-info__subtitle">{product.category}</p>

          <hr className="pd-info__divider" />

          {/* Promo badge */}
          {product.promo !== 0 && (
            <div className="pd-info__promo-badge">
              <TbRosetteDiscount aria-hidden />
              -{product.promo}% {t("product.promotion")}
            </div>
          )}

          {/* Price */}
          <div className="pd-info__prices">
            <span className="pd-info__price--final">{finalPrice} {t("product.currency")}</span>
            {product.promo !== 0 && (
              <>
                <span className="pd-info__price--original">
                  {origPrice} {t("product.currency")}
                </span>
                <span className="pd-info__savings">
                  {t("product.youSave", { amount: savings })} {t("product.currency")}
                </span>
              </>
            )}
          </div>

          {/* Sizes */}
          <div className="pd-info__size-header">
            <p className="pd-info__section-label">{t("product.sizes")}</p>
            <span>{sizeSelection
              ? `${t("product.selectedSize")}: ${sizeSelection.size}`
              : t("product.chooseSizeHint")}
            </span>
          </div>
          <div className="pd-info__sizes">
            {product.stock?.map((s, i) => {
              const outOfStock = s.quantity === 0;
              const isSelected = sizeSelection?.size === s.size;
              return (
                <button
                  key={i}
                  className={[
                    "pd-size-btn",
                    isSelected  ? "pd-size-btn--selected"     : "",
                    outOfStock  ? "pd-size-btn--out-of-stock" : "",
                  ].join(" ")}
                  onClick={() => !outOfStock && setSizeSelection({ size: s.size, quantity: s.quantity })}
                  aria-pressed={isSelected}
                  aria-label={`Size ${s.size}${outOfStock ? ", out of stock" : ""}`}
                  disabled={outOfStock}
                >
                  {s.size}
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="pd-btn-group">
            <button
              className="pd-btn pd-btn--cart"
              onClick={() => handleAddToCart(false)}
              disabled={!canPurchase}
            >
              <FaCartPlus aria-hidden />
              {isSoldOut ? t("product.soldOut") : t("product.addToCart")}
            </button>
            <button
              className="pd-btn pd-btn--checkout"
              onClick={() => handleAddToCart(true)}
              disabled={!canPurchase}
            >
              <FaCartPlus aria-hidden />
              {isSoldOut ? t("product.soldOut") : t("order.checkoutNow")}
            </button>
          </div>

          {/* Purchase reassurance */}
          <div className="pd-info__benefits">
            <div>
              <MdLocalShipping aria-hidden />
              <span>{t("delivery.label")}<strong>{t("delivery.free")}</strong></span>
            </div>
            <div>
              <MdVerifiedUser aria-hidden />
              <span>{t("cart.secureCheckout")}<strong>{t("payment.methods")}</strong></span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Delivery info card ───────────────────────────────────────────── */}
      <div className={`pd-secondary ${isMobile ? "pd-secondary--mobile" : ""}`}>
        <div className="pd-command-card card shadow">
          <CommandDetails />
        </div>
      </div>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <div className={`pd-reviews ${isRtl ? "rtl" : ""}`}>
        <div className="pd-reviews__card card shadow">
          <h3 className="pd-reviews__title">
            <span><MdRateReview aria-hidden /> {t("review.title")}</span>
            <b>{reviews.length}</b>
          </h3>

          {reviews.length === 0 && (
            <div className="pd-reviews__empty">
              <MdOutlineRateReview size={48} aria-hidden />
              <p>{t("review.firstReview")}</p>
            </div>
          )}

          {reviews.length > 0 && (
            <>
              {reviews
                .slice(0, reviewsExpanded ? reviews.length : REVIEWS_PREVIEW)
                .map((review, i) => (
                  <div key={i} className="review-card card shadow-sm">
                    <div className="review-card__header">
                      <img
                        className="review-card__avatar"
                        src={reviewGuestImg}
                        alt=""
                        aria-hidden
                      />
                      <span className="review-card__name">{review.name}</span>
                      <div className="review-card__stars" aria-label={`${review.stars} out of 5 stars`}>
                        {Array.from({ length: 5 }, (_, j) => (
                          <FaStar key={j} color={j < review.stars ? "#ffd700" : "#ddd"} aria-hidden />
                        ))}
                      </div>
                      <span className="review-card__date">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <TextReducer text={review.review} maxLength={100} />
                  </div>
                ))}

              {reviews.length > REVIEWS_PREVIEW && (
                <button
                  className="pd-reviews__expand-btn"
                  onClick={() => setReviewsExpanded((v) => !v)}
                >
                  {reviewsExpanded ? t("product.readLess") : t("product.readMore")}
                </button>
              )}
            </>
          )}

          {/* Single "Add review" button — not duplicated per case */}
          <button
            className="pd-reviews__add-btn"
            onClick={() => setShowReviewModal(true)}
          >
            <IoAddCircle aria-hidden /> {t("review.add")}
          </button>
        </div>

        {/* Single modal instance — not duplicated for empty vs non-empty */}
        <AnimatePresence mode="wait">
          {showReviewModal && (
            <ModalBackDrop onClose={() => setShowReviewModal(false)} onOpen>
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="review-modal card shadow"
                variants={MODAL_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="review-modal__header">
                  <h3><MdReviews aria-hidden /> {t("review.add")}</h3>
                  <button
                    className="review-modal__close"
                    onClick={() => setShowReviewModal(false)}
                    aria-label="Close review form"
                  >
                    <IoClose />
                  </button>
                </div>
                <hr />
                <ReviewForm
                  onSubmit={handleSubmitReview}
                  onClose={() => setShowReviewModal(false)}
                />
              </motion.div>
            </ModalBackDrop>
          )}
        </AnimatePresence>
      </div>

      {/* ── Related products carousel ────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="pd-carousel-section">
          <div className="pd-carousel-section__title">
            <RelatedIcon aria-hidden />
            {typeConfig ? t(typeConfig.labelKey) : t("product.relatedProducts")}
            <RelatedIcon aria-hidden />
          </div>
          <ProductCarousel Data={related} productType={product.product_type + "s"} />
        </div>
      )}

      <Footer />
    </>
  );
};

export default ProductDetails;
