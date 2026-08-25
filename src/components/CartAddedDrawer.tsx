import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import { MdCheckCircle, MdClose, MdVerifiedUser } from 'react-icons/md';
import { TbCreditCardPay } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';

import { useCart } from '../contexts/CartContext';
import { useLangContext } from '../contexts/LanguageContext';
import { goTo, selectedLang } from './constants';
import '../styles/cart-added-drawer.css';

const CartAddedDrawer: React.FC = () => {
  const { t } = useTranslation();
  const { currentLang } = useLangContext();
  const {
    allItems,
    cartTotalAmount,
    itemCount,
    lastAddedItem,
    isCartDrawerOpen,
    cartDrawerMode,
    closeCartDrawer,
  } = useCart();

  const [isCompactViewport, setIsCompactViewport] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 640,
  );
  const isRtl = selectedLang(currentLang) === 'ar';
  const isSummaryMode = cartDrawerMode === 'summary';

  const cartEntry = lastAddedItem
    ? allItems.find(
        (item) => item.id === lastAddedItem.id && item.size === lastAddedItem.size,
      ) ?? lastAddedItem
    : null;

  useEffect(() => {
    const updateViewport = () => setIsCompactViewport(window.innerWidth <= 640);
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!isCartDrawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCartDrawer();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [closeCartDrawer, isCartDrawerOpen]);

  const navigateFromDrawer = (path: string) => {
    closeCartDrawer();
    goTo(path);
  };

  const lineTotal = cartEntry
    ? cartEntry.price * (1 - cartEntry.promo * 0.01) * cartEntry.quantity
    : 0;

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (isSummaryMode ? allItems.length > 0 : cartEntry) && (
        <>
          <motion.div
            className="cart-added-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartDrawer}
            aria-hidden="true"
          />

          <motion.aside
            className={`cart-added-drawer${isRtl ? ' cart-added-drawer--rtl' : ''}${isSummaryMode ? ' cart-added-drawer--summary' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-added-title"
            aria-describedby="cart-added-description"
            initial={isCompactViewport
              ? { y: '100%', opacity: 0.6 }
              : { x: isRtl ? '-100%' : '100%', opacity: 0.6 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={isCompactViewport
              ? { y: '100%', opacity: 0 }
              : { x: isRtl ? '-100%' : '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="cart-added-drawer__mobile-handle" aria-hidden="true" />

            <header className="cart-added-drawer__header">
              <div className={`cart-added-drawer__success-icon${isSummaryMode ? ' cart-added-drawer__success-icon--summary' : ''}`} aria-hidden="true">
                {isSummaryMode ? <FaShoppingCart /> : <MdCheckCircle />}
              </div>
              <div className="cart-added-drawer__heading">
                <h2 id="cart-added-title">
                  {isSummaryMode ? t('order.summary') : t('cart.addSuccess')}
                </h2>
                <p id="cart-added-description">
                  {isSummaryMode ? t('cart.drawerDescription') : t('cart.addedDrawerDescription')}
                </p>
              </div>
              <button
                className="cart-added-drawer__close"
                onClick={closeCartDrawer}
                aria-label={t('cart.closeSummary')}
                autoFocus
              >
                <MdClose />
              </button>
            </header>

            {isSummaryMode ? (
              <div className="cart-drawer-products">
                {allItems.map((item) => (
                  <div className="cart-drawer-products__item" key={`${item.id}-${item.size}`}>
                    <div className="cart-drawer-products__image">
                      <img src={item.image} alt={item.name} />
                      <span>×{item.quantity}</span>
                    </div>
                    <div className="cart-drawer-products__copy">
                      <strong>{item.name}</strong>
                      <span>{item.category} · {t('product.size')}: {item.size}</span>
                    </div>
                    <b className="cart-drawer-products__price">
                      {(item.price * (1 - item.promo * 0.01) * item.quantity).toFixed(2)} {t('product.currency')}
                    </b>
                  </div>
                ))}
              </div>
            ) : cartEntry ? (
              <div className="cart-added-product">
                <div className="cart-added-product__image">
                  <img src={cartEntry.image} alt={cartEntry.name} />
                  <span className="cart-added-product__quantity">×{cartEntry.quantity}</span>
                </div>
                <div className="cart-added-product__copy">
                  <span className="cart-added-product__meta">
                    {cartEntry.category} {cartEntry.ref}
                  </span>
                  <strong>{cartEntry.name}</strong>
                  <span className="cart-added-product__size">
                    {t('product.size')}: {cartEntry.size}
                  </span>
                  <span className="cart-added-product__price">
                    {lineTotal.toFixed(2)} {t('product.currency')}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="cart-added-summary">
              <div>
                <span>{t('cart.items', { count: itemCount })}</span>
                <FaShoppingCart aria-hidden="true" />
              </div>
              <div className="cart-added-summary__total">
                <span>{t('cart.total')}</span>
                <strong>{cartTotalAmount.toFixed(2)} {t('product.currency')}</strong>
              </div>
            </div>

            <div className="cart-added-drawer__actions">
              <button
                className="cart-added-drawer__cart-btn"
                onClick={() => navigateFromDrawer('/Cart')}
              >
                <FaShoppingCart aria-hidden="true" />
                {t('cart.viewCart')}
              </button>
              <button
                className="cart-added-drawer__checkout-btn"
                onClick={() => navigateFromDrawer('/Checkout')}
              >
                <TbCreditCardPay aria-hidden="true" />
                {t('order.checkoutNow')}
              </button>
            </div>

            <button
              className="cart-added-drawer__continue"
              onClick={closeCartDrawer}
            >
              {t('cart.continueShopping')}
            </button>

            <div className="cart-added-drawer__trust">
              <MdVerifiedUser aria-hidden="true" />
              {t('cart.secureCheckout')}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartAddedDrawer;
