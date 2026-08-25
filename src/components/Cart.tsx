import React, { useEffect, useState } from 'react';
import { CartItem, useCart } from '../contexts/CartContext';
import { Zoom, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import '../styles/cart.css';
import Modal from './Modal';
import { AnimatePresence, motion } from 'framer-motion';
import { FaMoneyCheckAlt, FaRegTrashAlt, FaShoppingCart } from 'react-icons/fa';
import {
  MdClose,
  MdKeyboardArrowUp,
  MdLocalShipping,
  MdRemoveShoppingCart,
  MdVerifiedUser,
} from 'react-icons/md';
import { IoArrowBackOutline } from 'react-icons/io5';
import { TbCreditCardPay } from 'react-icons/tb';
import ReactCountryFlag from 'react-country-flag';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { useLangContext } from '../contexts/LanguageContext';
import { usePayment } from '../contexts/PaymentContext';
import { goTo, selectedLang } from './constants';
import PromoCodeField from './PromoCodeField';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_CART_ITEM: CartItem = {
  product_type: '',
  id:           0,
  name:         '',
  ref:          '',
  category:     '',
  price:        0,
  promo:        0,
  image:        '',
  quantity:     0,
  size:         '0',
  maxQuantity:  0,
};

const CURRENCY_TO_COUNTRY_CODE: Record<string, string> = {
  MAD: 'MA',
  EUR: 'EU',
  USD: 'US',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCountryCodeByCurrency = (currency: string): string =>
  CURRENCY_TO_COUNTRY_CODE[currency] ?? '';

const navigateToCheckout = () => goTo('/checkout');

// ─── Component ────────────────────────────────────────────────────────────────

const Cart: React.FC = () => {
  const { t }           = useTranslation();
  const { currentLang } = useLangContext();
  const { setCurrentCurrency, currentCurrency, currencyIsAvailable } = usePayment();
  const {
    cartTotalAmount,
    discountedCartTotalAmount,
    promotionDiscountAmount,
    appliedPromotion,
    cartChecker,
    itemCount,
    allItems,
    removeItem,
    clearCart,
    handleMinusQuantity,
    handlePlusQuantity,
  } = useCart();

  const isRtl = selectedLang(currentLang) === 'ar';

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSummaryDrawerOpen, setIsSummaryDrawerOpen] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 800,
  );
  const [itemToDelete,      setItemToDelete]      = useState<CartItem>(EMPTY_CART_ITEM);
  const [deleteAction,      setDeleteAction]      = useState<'remove' | 'clear-all' | ''>('');

  useEffect(() => {
    const updateViewport = () => setIsCompactViewport(window.innerWidth <= 800);
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!isSummaryDrawerOpen || !cartChecker) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSummaryDrawerOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isSummaryDrawerOpen, cartChecker]);

  // ── Delete handlers ──────────────────────────────────────────────────────────

  const handleRemoveItemClick = (item: CartItem) => {
    setItemToDelete(item);
    setDeleteAction('remove');
    setIsDeleteModalOpen(true);
  };

  const handleClearCartClick = () => {
    setDeleteAction('clear-all');
    setIsDeleteModalOpen(true);
  };

  const confirmRemoveItem = (item: CartItem) => {
    removeItem(item);
    setIsDeleteModalOpen(false);
    toast.info(t('cart.itemRemoved'), {
      position:        'top-center',
      autoClose:       2000,
      hideProgressBar: false,
      closeOnClick:    false,
      pauseOnHover:    false,
      draggable:       true,
      theme:           'colored',
      transition:      Zoom,
    });
  };

  const cancelDelete = () => {
    setItemToDelete(EMPTY_CART_ITEM);
    setDeleteAction('');
    setIsDeleteModalOpen(false);
  };

  const confirmClearCart = () => {
    clearCart();
    setIsDeleteModalOpen(false);
    toast.info(t('cart.cleared'), {
      position:        'top-center',
      autoClose:       2000,
      hideProgressBar: false,
      closeOnClick:    false,
      pauseOnHover:    false,
      draggable:       true,
      theme:           'colored',
      transition:      Zoom,
    });
  };

  // ── Price helpers ────────────────────────────────────────────────────────────

  const getDiscountedPrice = (price: number, promo: number) =>
    (price * (1 - promo * 0.01)).toFixed(2);

  const getLineTotal = (price: number, promo: number, quantity: number) =>
    (price * (1 - 0.01 * promo) * quantity).toFixed(2);

  // ── Sub-renders ──────────────────────────────────────────────────────────────

  const renderEmptyCart = () => (
    <div className="cart__empty">
      <MdRemoveShoppingCart className="cart__empty-icon" size={50} />
      <p className={isRtl ? 'rtl' : ''}>{t('cart.empty')}</p>
      <button
        className={`cart__empty-cta ${isRtl ? 'rtl' : ''}`}
        onClick={() => goTo('/')}
      >
        <b>{t('cart.shopNow')} !</b>
      </button>
    </div>
  );

  /*
    renderCartRow — produces a single row that works at all breakpoints
    via CSS grid-template-areas.

    Desktop (>560px):  [product info] [qty + remove] [line total]
    Mobile  (≤560px):  [image] [details]
                       [image] [qty + remove + total]

    The "bottom zone" on mobile is a separate `.cart-row__bottom` div
    that spans both cells via grid-area. This avoids the broken ::after
    CSS trick from the original (which required a `data-total` attribute
    that was never set by the component).
  */
  const renderCartRow = (item: CartItem) => {
    const lineTotal = getLineTotal(item.price, item.promo, item.quantity);
    const isAtMaximum = !Number.isFinite(item.maxQuantity) || item.quantity >= item.maxQuantity;

    return (
      <div key={`${item.id}-${item.size}`} className="cart-row">

        {/* ── Col 1: image + details (desktop) / image (mobile top-left) ── */}
        <div className="cart-row__product">
          <div className="cart-item-image">
            <img
              src={item.image}
              className="cart-item-image__img"
              alt={item.name}
              loading="lazy"
            />
          </div>
          <div className="cart-item-details" dir={isRtl ? 'rtl' : 'ltr'}>
            <strong className="cart-item-details__ref">
              {item.category} {item.ref}
            </strong>
            <span className="cart-item-details__name">{item.name}</span>
            <div className="cart-item-details__price">
              <span className="price--current">
                {getDiscountedPrice(item.price, item.promo)} {t('product.currency')}
              </span>
              {item.promo > 0 && (
                <span className="price--original">
                  {item.price.toFixed(2)} {t('product.currency')}
                </span>
              )}
              {item.promo > 0 && (
                <span className="cart-item-details__promo">-{item.promo}%</span>
              )}
            </div>
            <span className="cart-item-details__size-pill">
              {t('product.size')}: {item.size}
            </span>
          </div>
        </div>

        {/* ── Col 2 (desktop): quantity stepper + remove ── */}
        {/* ── Merged into bottom zone on mobile via CSS ── */}
        <div className="cart-row__actions">
          <div className="quantity-control">
            <button
              className="quantity-control__btn btn btn-outline-primary btn-sm rounded-0"
              onClick={() => handleMinusQuantity(item)}
              disabled={item.quantity <= 1}
              aria-label={t('cart.decreaseQuantity')}
            >−</button>
            <input
              type="text"
              className="quantity-control__input text-center rounded-0"
              value={item.quantity}
              readOnly
              aria-label="Quantity"
            />
            <button
              className="quantity-control__btn btn btn-outline-success btn-sm rounded-0"
              onClick={() => handlePlusQuantity(item)}
              disabled={isAtMaximum}
              aria-label={t('cart.increaseQuantity')}
              title={isAtMaximum ? t('cart.maxQuantity') : undefined}
            >+</button>
          </div>
          <button
            className="cart-item-remove-btn btn btn-light p-2"
            onClick={() => handleRemoveItemClick(item)}
            aria-label={t('cart.removeItemLabel', { name: item.name })}
          >
            <FaRegTrashAlt />
          </button>
        </div>

        {/* ── Col 3 (desktop): line total ── */}
        <div className="cart-row__total">
          <span className="price--current cart-row__total-price">
            {lineTotal} {t('product.currency')}
          </span>
          {item.promo > 0 && (
            <span className="price--original">
              {(item.price * item.quantity).toFixed(2)} {t('product.currency')}
            </span>
          )}
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Header />
      <div className={`cart-shell${isRtl ? ' cart-shell--rtl' : ''}`}>
        <header className="cart-hero">
          <div>
            <span className="cart-hero__eyebrow">{t('order.details')}</span>
            <div className="cart-hero__title-row">
              <h1 className="cart-hero__title">{t('cart.title')}</h1>
              <span className="cart-hero__count">{t('cart.items', { count: itemCount })}</span>
            </div>
          </div>
          <button className="cart-hero__continue" onClick={() => goTo('/')}>
            <IoArrowBackOutline className={isRtl ? 'cart-hero__continue-icon--rtl' : ''} />
            {t('cart.continueShopping')}
          </button>
        </header>

      <div className={`cart-page${isRtl ? ' cart-page--rtl' : ''}`}>

        {/*
          DOM order: sidebar first, items second.
          On mobile, CSS `order` flips them so items appear above the summary.
          See cart.css: .cart-items-panel { order: 1 } / .cart-sidebar { order: 2 }
        */}

        {/* ── Sidebar: Currency + Order Summary ──────────────────────────── */}
        <aside className="cart-sidebar d-flex">

          {/* Currency bar */}
          <div className="currency-bar">
            <div className="currency-bar__selector">
              <select
                className="currency-bar__select"
                onChange={(e) => setCurrentCurrency(e.target.value)}
                defaultValue={currentCurrency}
                aria-label="Select currency"
              >
                <option value="MAD">MAD</option>
                {currencyIsAvailable && (
                  <>
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                  </>
                )}
              </select>
              <ReactCountryFlag
                className="currency-bar__flag"
                countryCode={getCountryCodeByCurrency(currentCurrency)}
                svg
                style={{ width: 28, height: 28 }}
                title={currentCurrency}
              />
            </div>
            <div className="currency-bar__copy">
              <span>{t('transaction.currency')}</span>
              <strong>{currentCurrency}</strong>
            </div>
          </div>

          {/* Order summary card */}
          <div className="order-summary">
            <div className="order-summary__title">
              <span className="order-summary__title-copy">
                <FaMoneyCheckAlt style={{ marginTop: -3 }} /> {t('order.summary')}
              </span>
              <button
                className="order-summary__drawer-trigger"
                onClick={() => setIsSummaryDrawerOpen(true)}
                aria-expanded={isSummaryDrawerOpen}
                aria-controls="cart-summary-drawer"
              >
                <FaShoppingCart aria-hidden />
                {t('cart.viewSummary')}
              </button>
            </div>

            <ul className="order-summary__list">
              <li className={`order-summary__list-item ${isRtl ? 'rtl' : ''}`}>
                <span>{t('order.subtotal')}</span>
                <b>{cartTotalAmount.toFixed(2)} {t('product.currency')}</b>
              </li>
              <li className={`order-summary__list-item ${isRtl ? 'rtl' : ''}`}>
                <span>{t('order.shipping')}</span>
                <b className="order-summary__free">{t('delivery.free')}</b>
              </li>
              {appliedPromotion && (
                <li className={`order-summary__list-item order-summary__discount ${isRtl ? 'rtl' : ''}`}>
                  <span>{t('promoCode.discount')} ({appliedPromotion.code})</span>
                  <b>−{promotionDiscountAmount.toFixed(2)} {t('product.currency')}</b>
                </li>
              )}
            </ul>

            <PromoCodeField />

            <div className={`order-summary__grand-total ${isRtl ? 'rtl' : ''}`}>
              <span>{t('cart.total')}</span>
              <b>{discountedCartTotalAmount.toFixed(2)} {t('product.currency')}</b>
            </div>

            <button
              className="order-summary__checkout-btn"
              disabled={!cartChecker}
              onClick={navigateToCheckout}
            >
              <TbCreditCardPay style={{ marginTop: -3 }} className="me-2" />
              {t('order.checkoutNow')}
            </button>

            <div className="order-summary__trust">
              <span><MdVerifiedUser /> {t('cart.secureCheckout')}</span>
              <span><MdLocalShipping /> {t('delivery.free')} {t('order.shipping').toLowerCase()}</span>
            </div>

            <div className="payment-logos">
              <div className="payment-logos__grid">
                {[
                  { src: 'https://static4.youcan.shop/store-front/images/visa.png',             alt: 'Visa' },
                  { src: 'https://static4.youcan.shop/store-front/images/master-card.png',      alt: 'Mastercard' },
                  { src: 'https://static4.youcan.shop/store-front/images/american-express.png', alt: 'American Express' },
                  { src: 'https://static4.youcan.shop/store-front/images/discover.png',         alt: 'Discover' },
                ].map(({ src, alt }) => (
                  <img key={alt} src={src} alt={alt} />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main: Cart Items ──────────────────────────────────────────────── */}
        <main className="cart-items-panel">
          <div className="cart-items-panel__inner">
            <div className="cart-items-panel__header">
              <b><FaShoppingCart /> {t('order.reviewItems')}</b>
              <span>{t('cart.items', { count: itemCount })}</span>
            </div>

            {!cartChecker ? renderEmptyCart() : (
              <>
                {/* Column headers — hidden on mobile via CSS */}
                <div className="cart-list-header">
                  <span className="cart-list-header__product">{t('product.info')}</span>
                  <span className="cart-list-header__actions">{t('cart.quantityAction')}</span>
                  <span className="cart-list-header__total">{t('cart.total')}</span>
                </div>
                <div className="cart-list">
                  {allItems.map((item) => renderCartRow(item))}
                </div>

                <div className="cart-items-panel__footer">
                  <button
                    className="cart-clear-btn"
                    onClick={handleClearCartClick}
                  >
                    <FaRegTrashAlt className="me-1" /> {t('cart.clear')}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      </div>

      {/* ── Floating checkout bar (mobile only) ─────────────────────────── */}
      {cartChecker && (
        <div className="cart-float-bar">
          <div className="cart-float-bar__total">
            <span className="cart-float-bar__label">{t('cart.total')}</span>
            <span className="cart-float-bar__amount">
              {discountedCartTotalAmount.toFixed(2)} {t('product.currency')}
            </span>
          </div>
          <div className="cart-float-bar__actions">
            <button
              className="cart-float-bar__summary-btn"
              onClick={() => setIsSummaryDrawerOpen(true)}
              aria-expanded={isSummaryDrawerOpen}
              aria-controls="cart-summary-drawer"
            >
              <MdKeyboardArrowUp size={20} />
              <span>{t('order.summary')}</span>
            </button>
            <button
              className="cart-float-bar__btn"
              onClick={navigateToCheckout}
            >
              <TbCreditCardPay size={18} /> {t('order.checkoutNow')}
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile order-summary drawer ────────────────────────────────── */}
      <AnimatePresence>
        {isSummaryDrawerOpen && cartChecker && (
          <>
            <motion.div
              className="cart-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSummaryDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              id="cart-summary-drawer"
              className={`cart-summary-drawer${isRtl ? ' cart-summary-drawer--rtl' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-summary-drawer-title"
              initial={isCompactViewport
                ? { y: '100%', opacity: 0.5 }
                : { x: isRtl ? '-100%' : '100%', opacity: 0.5 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={isCompactViewport
                ? { y: '100%', opacity: 0 }
                : { x: isRtl ? '-100%' : '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            >
              <div className="cart-summary-drawer__handle" aria-hidden="true" />
              <header className="cart-summary-drawer__header">
                <div>
                  <span className="cart-summary-drawer__eyebrow">{t('cart.items', { count: itemCount })}</span>
                  <h2 id="cart-summary-drawer-title">{t('order.summary')}</h2>
                </div>
                <button
                  className="cart-summary-drawer__close"
                  onClick={() => setIsSummaryDrawerOpen(false)}
                  aria-label={t('cart.closeSummary')}
                  autoFocus
                >
                  <MdClose size={21} />
                </button>
              </header>

              <div className="cart-summary-drawer__items">
                {allItems.map((item) => (
                  <div className="cart-drawer-item" key={`${item.id}-${item.size}`}>
                    <div className="cart-drawer-item__image">
                      <img src={item.image} alt="" aria-hidden loading="lazy" />
                    </div>
                    <div className="cart-drawer-item__copy">
                      <strong>{item.name}</strong>
                      <span>{item.category} · {t('product.size')}: {item.size} · ×{item.quantity}</span>
                    </div>
                    <div className="cart-drawer-item__price">
                      {getLineTotal(item.price, item.promo, item.quantity)} {t('product.currency')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary-drawer__currency">
                <label htmlFor="drawer-currency">{t('cart.selectCurrency')}</label>
                <div>
                  <ReactCountryFlag
                    countryCode={getCountryCodeByCurrency(currentCurrency)}
                    svg
                    style={{ width: 22, height: 22 }}
                    title={currentCurrency}
                  />
                  <select
                    id="drawer-currency"
                    value={currentCurrency}
                    onChange={(event) => setCurrentCurrency(event.target.value)}
                  >
                    <option value="MAD">MAD</option>
                    {currencyIsAvailable && <option value="USD">USD $</option>}
                    {currencyIsAvailable && <option value="EUR">EUR €</option>}
                  </select>
                </div>
              </div>

              <div className="cart-summary-drawer__totals">
                <div>
                  <span>{t('order.subtotal')}</span>
                  <strong>{cartTotalAmount.toFixed(2)} {t('product.currency')}</strong>
                </div>
                <div>
                  <span>{t('order.shipping')}</span>
                  <strong className="cart-summary-drawer__free">{t('delivery.free')}</strong>
                </div>
                {appliedPromotion && <div className="cart-summary-drawer__discount">
                  <span>{t('promoCode.discount')} ({appliedPromotion.code})</span>
                  <strong>−{promotionDiscountAmount.toFixed(2)} {t('product.currency')}</strong>
                </div>}
                <div className="cart-summary-drawer__grand-total">
                  <span>{t('cart.total')}</span>
                  <strong>{discountedCartTotalAmount.toFixed(2)} {t('product.currency')}</strong>
                </div>
              </div>

              <PromoCodeField compact />

              <div className="cart-summary-drawer__footer">
                <div className="cart-summary-drawer__secure">
                  <MdVerifiedUser /> {t('cart.secureCheckout')}
                </div>
                <button className="cart-summary-drawer__checkout" onClick={navigateToCheckout}>
                  <TbCreditCardPay size={19} />
                  {t('order.checkoutNow')}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isDeleteModalOpen && (
          <Modal
            rev_productId={undefined}
            rev_productType={undefined}
            item={itemToDelete}
            action={deleteAction}
            onBack={cancelDelete}
            onRemove={() => confirmRemoveItem(itemToDelete)}
            onClearAll={confirmClearCart}
          />
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default Cart;
