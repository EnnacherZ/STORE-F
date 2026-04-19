import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangContext } from "../contexts/LanguageContext";
import { AnimatePresence, motion } from "framer-motion";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Navigation, Thumbs } from "swiper/modules";
import { type Swiper as SwiperType } from "swiper";
import { FaCartPlus, FaShirt, FaStar } from "react-icons/fa6";
import { TbRosetteDiscount } from "react-icons/tb";
import { MdOutlineRateReview, MdRateReview, MdReviews } from "react-icons/md";
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
import Loading from "./loading";
import ModalBackDrop from "./modalBackdrop";
import ProductCarousel from "./ProductCarousel";
import CommandDetails from "./CommandDetails";
import TextReducer from "./TextReducer";
import { CartItem, useCart } from "../contexts/CartContext";
import { Product, ProductReviews } from "../contexts/ProductsContext";
import { connecter } from "../server/connecter";
import { selectedLang } from "./constants";
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
  const [isMobile,         setIsMobile]         = useState(false);
  const [showReviewModal,  setShowReviewModal]  = useState(false);
  const [reviewsExpanded,  setReviewsExpanded]  = useState(false);

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

  const showSizeError = () =>
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

  /**
   * Single handler for both "add to cart" and "buy now".
   * @param goToCheckout — navigates to /Checkout after adding when true
   */
  const handleAddToCart = (goToCheckout = false) => {
    if (!product) return;
    if (!sizeSelection) { showSizeError(); return; }

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

  const isInStock = () => !sizeSelection || sizeSelection.quantity > 0;

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

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Header />

      {/* ── Main: images + info side by side ────────────────────────────── */}
      <section
        className={`pd-layout ${isMobile ? "pd-layout--mobile" : ""}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Mobile-only preview title */}
        {isMobile && (
          <p className="pd-preview-title">{t("product.preview")}</p>
        )}

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
            style={isMobile
              ? { width: "100%", height: "64px" }
              : { width: "72px",  height: "460px" }
            }
          >
            {productImages.map((src, i) => (
              <SwiperSlide key={i} className="pd-thumb">
                <img src={src} alt="" aria-hidden />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Main image */}
          <Swiper
            className="pd-swiper"
            spaceBetween={10}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            navigation
            modules={[Navigation, FreeMode, Thumbs, Autoplay]}
            autoplay={{ delay: 2500, disableOnInteraction: true }}
            style={{ height: isMobile ? "280px" : "460px" }}
          >
            {productImages.map((src, i) => (
              <SwiperSlide key={i}>
                <img src={src} alt={`${product.name} — view ${i + 1}`} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Info column */}
        <div className={`pd-info ${isMobile ? "pd-info--mobile" : ""}`}>

          {/* Meta row: type pill + ref */}
          <div className="pd-info__meta">
            <span className="pd-info__meta-tag">{t(`productTypes.${product.product_type.toLowerCase()}`)}</span>
            <span className="pd-info__meta-ref">REF: {product.ref}</span>
          </div>

          {/* Name hierarchy */}
          <h1 className="pd-info__title">{product.category.toUpperCase()}</h1>
          <h2 className="pd-info__subtitle">{product.name}</h2>

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
            <span className="pd-info__price--final">{finalPrice} MAD</span>
            {product.promo !== 0 && (
              <span className="pd-info__price--original">
                {origPrice} {t("product.currency")}
              </span>
            )}
          </div>

          {/* Sizes */}
          <p className="pd-info__section-label">{t("product.sizes")}</p>
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
              disabled={!isInStock()}
            >
              <FaCartPlus aria-hidden />
              {isInStock() ? t("product.addToCart") : t("product.soldOut")}
            </button>
            <button
              className="pd-btn pd-btn--checkout"
              onClick={() => handleAddToCart(true)}
              disabled={!isInStock()}
            >
              <FaCartPlus aria-hidden />
              {isInStock() ? t("order.checkoutNow") : t("product.soldOut")}
            </button>
          </div>

          {/* Trust strip */}
          <div className="pd-info__trust">
            <span className="pd-info__trust-icon">🚚</span>
            {t("delivery.cityOnly")}
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
            <MdRateReview aria-hidden /> {t("review.title")}
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
      {typeConfig && (
        <div className="pd-carousel-section">
          <div className="pd-carousel-section__title">
            <typeConfig.Icon aria-hidden />
            {t(typeConfig.labelKey)}
            <typeConfig.Icon aria-hidden />
          </div>
          <ProductCarousel Data={related} productType={product.product_type + "s"} />
        </div>
      )}

      <Footer />
      <ToastContainer style={{ width: "40%", marginLeft: "15%" }} />
    </>
  );
};

export default ProductDetails;