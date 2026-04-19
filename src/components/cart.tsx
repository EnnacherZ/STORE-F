import React, { useLayoutEffect, useState } from 'react';
import { CartItem, useCart } from '../contexts/CartContext';
import { Zoom, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import '../styles/cart.css';
import Modal from './Modal';
import { AnimatePresence } from 'framer-motion';
import { FaMoneyCheckAlt, FaRegTrashAlt, FaShoppingCart } from 'react-icons/fa';
import { MdRemoveShoppingCart } from 'react-icons/md';
import { TbCreditCardPay } from 'react-icons/tb';
import ReactCountryFlag from 'react-country-flag';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { useLangContext } from '../contexts/LanguageContext';
import { usePayment } from '../contexts/PaymentContext';
import { goTo, selectedLang } from './constants';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_CART_ITEM: CartItem = {
  product_type: '',
  id: 0,
  name: '',
  ref: '',
  category: '',
  price: 0,
  promo: 0,
  image: '',
  quantity: 0,
  size: '0',
  maxQuantity: 0,
};

const CURRENCY_TO_COUNTRY_CODE: Record<string, string> = {
  MAD: 'MA',
  EUR: 'EU',
  USD: 'US',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCountryCodeByCurrency = (currency: string): string =>
  CURRENCY_TO_COUNTRY_CODE[currency] ?? '';

const navigateToCheckout = () => {
  goTo('/checkout');
};

// ─── Component ────────────────────────────────────────────────────────────────

const Cart: React.FC = () => {
  const { t } = useTranslation();
  const { currentLang } = useLangContext();
  const { setCurrentCurrency, currentCurrency, currencyIsAvailable } = usePayment();
  const { cartTotalAmount, cartChecker, allItems, removeItem, clearCart, handleMinusQuantity, handlePlusQuantity } = useCart();

  const isRtl = selectedLang(currentLang) === 'ar';

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem>(EMPTY_CART_ITEM);
  const [deleteAction, setDeleteAction] = useState<'remove' | 'clear-all' | ''>('');
  const [isMobileView, setIsMobileView] = useState<boolean>();


    // ── Responsive layout detection ─────────────────────────────────────────────

  useLayoutEffect(() => {
    const checkMobileBreakpoint = () => {
      setIsMobileView(window.innerWidth < 540);
    };

    checkMobileBreakpoint();
    window.addEventListener('resize', checkMobileBreakpoint);
    return () => window.removeEventListener('resize', checkMobileBreakpoint);
  }, [])

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
    toast.error(t('cart.itemRemoved'), {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      theme: 'colored',
      transition: Zoom,
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
    toast.error(t('cart.cleared'), {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      theme: 'colored',
      transition: Zoom,
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
        className={`btn btn-primary mt-4 ${isRtl ? 'rtl' : ''}`}
        onClick={() => goTo('/')}
      >
        <b>{t('cart.shopNow')} !</b>
      </button>
    </div>
  );

  const renderCartRow = (item: CartItem, index: number) => (
    <div key={index} className="cart-row">

      {/* ── Col 1: Product info ─────────────────────── */}
      <div className="cart-row__product">
        <div className="cart-item-image">
          <img
            src={item.image}
            className="cart-item-image__img rounded"
            alt={item.name}
          />
        </div>
        <div className="cart-item-details">
          <strong className="cart-item-details__ref">
            {item.category} {item.ref}
          </strong>
          <span>{item.name}</span>
          <div className="cart-item-details__price">
            <span className="price--current">
              {getDiscountedPrice(item.price, item.promo)} {t('product.currency')}
            </span>
            {item.promo > 0 && (
              <span className="price--original">
                {item.price.toFixed(2)} {t('product.currency')}
              </span>
            )}
          </div>
          <span className="text-muted cart-item-details__size">
            {t('product.size')}: {item.size}
          </span>
        </div>
      </div>

      {/* ── Col 2: Quantity + remove ────────────────── */}
      <div className="cart-row__actions">
        <div className="quantity-control">
          <button
            className="quantity-control__btn btn btn-outline-primary btn-sm rounded-0"
            onClick={() => handleMinusQuantity(item)}
            aria-label="Decrease quantity"
          >−</button>
          <input
            type="text"
            className="quantity-control__input text-center border border-secondary rounded-0"
            value={item.quantity}
            readOnly
            aria-label="Quantity"
          />
          <button
            className="quantity-control__btn btn btn-outline-success btn-sm rounded-0"
            onClick={() => handlePlusQuantity(item)}
            aria-label="Increase quantity"
          >+</button>
        </div>
        <button
          className="cart-item-remove-btn btn btn-light mt-2 p-2"
          onClick={() => handleRemoveItemClick(item)}
          aria-label={`Remove ${item.name} from cart`}
        >
          <FaRegTrashAlt />
        </button>
      </div>

      {/* ── Col 3: Line total ───────────────────────── */}
      <div className="cart-row__total">
        <span className="price--current cart-row__total-price">
          {getLineTotal(item.price, item.promo, item.quantity)} {t('product.currency')}
        </span>
        {item.promo > 0 && (
          <span className="price--original">
            {(item.price * item.quantity).toFixed(2)} {t('product.currency')}
          </span>
        )}
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Header />
      <div className="cart-page">

        {/* ── Sidebar: Currency + Order Summary ── */}
        <aside className="cart-sidebar d-flex">

          {/* Currency bar */}
          <div className="currency-bar shadow d-flex justify-content-between rounded border border-secondary">
            <div className="currency-bar__selector d-flex align-items-center">
              <select
                className="form-select shadow-none border-0"
                style={{ width: 95, color: 'green', backgroundColor: '#efecec', fontWeight: 500 }}
                onChange={(e) => setCurrentCurrency(e.target.value)}
                defaultValue={currentCurrency}
                aria-label="Select currency"
              >
                <option value="MAD" style={{ fontWeight: 500 }}>MAD</option>
                {currencyIsAvailable && (
                  <>
                    <option value="USD" style={{ fontWeight: 500 }}>USD $</option>
                    <option value="EUR" style={{ fontWeight: 500 }}>EUR €</option>
                  </>
                )}
              </select>
              <ReactCountryFlag
                className="currency-bar__flag"
                countryCode={getCountryCodeByCurrency(currentCurrency)}
                svg
                style={{ width: '20%', height: 35, marginLeft: 2 }}
                title={currentCurrency}
              />
            </div>
            <div className="d-flex align-items-center me-1">
              <strong style={{ fontSize: 13 }}>
                {t('cart.total')}: <span style={{ color: 'green' }}>{cartTotalAmount.toFixed(2)}</span>
              </strong>
            </div>
          </div>

          {/* Order summary card */}
          <div className="order-summary card shadow" style={{ backgroundColor: '#efeded' }}>
            <div className="order-summary__title text-center fs-4 fw-bold my-3">
              <FaMoneyCheckAlt style={{ marginTop: -3 }} /> {t('order.summary')}
            </div>
            <hr className="m-2" />
            <ul className="order-summary__list list-group px-1">
              <li className={`order-summary__list-item py-3 px-2 border-0 d-flex justify-content-between ${isRtl ? 'rtl' : ''}`}>
                {t('order.totalAmount')}:
                <b style={{ color: 'green' }}>{cartTotalAmount} {t('product.currency')}</b>
              </li>
              <li className={`order-summary__list-item py-3 px-2 border-0 d-flex justify-content-between ${isRtl ? 'rtl text-end' : ''}`}>
                {t('order.shipping')}:
                <b style={{ color: 'green' }}>0 {t('product.currency')}</b>
              </li>
            </ul>
            <hr className="m-2" />
            <div className={`order-summary__grand-total px-3 d-flex justify-content-between ${isRtl ? 'rtl text-end' : ''}`}>
              {t('cart.total')}:
              <b style={{ color: 'green' }}>{cartTotalAmount} {t('product.currency')}</b>
            </div>
            <button
              className="btn btn-dark mx-1 mt-3"
              style={{ height: 50 }}
              disabled={!cartChecker}
              onClick={navigateToCheckout}
            >
              <TbCreditCardPay style={{ marginTop: -3 }} className="me-2" /> {t('order.checkoutNow')}
            </button>
            <div className="payment-logos d-flex justify-content-center">
              <div className="payment-logos__grid row">
                {[
                  { src: 'https://static4.youcan.shop/store-front/images/visa.png', alt: 'Visa' },
                  { src: 'https://static4.youcan.shop/store-front/images/master-card.png', alt: 'Mastercard' },
                  { src: 'https://static4.youcan.shop/store-front/images/american-express.png', alt: 'American Express' },
                  { src: 'https://static4.youcan.shop/store-front/images/discover.png', alt: 'Discover' },
                ].map(({ src, alt }) => (
                  <div key={alt} className="col p-0" style={{ width: '25%' }}>
                    <img src={src} alt={alt} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main: Cart Items ── */}
        <main className={`cart-items-panel card shadow ${isMobileView ? 'mt-3' : ''}`}>
          <div className="text-center card cart-items-panel__inner">
            <div className="cart-items-panel__header text-center my-2 fs-3">
              <b><FaShoppingCart style={{ marginTop: -3 }} /> {t('cart.title')}</b>
            </div>

            {!cartChecker ? renderEmptyCart() : (
              <>
                {/* ── Column headers (desktop only) ── */}
                <div className="cart-list-header">
                  <span className="cart-list-header__product">{t('product.info')}</span>
                  <span className="cart-list-header__actions">{t('cart.quantityAction')}</span>
                  <span className="cart-list-header__total">{t('cart.total')}</span>
                </div>
                <hr className="mt-0" />

                {/* ── Cart rows — one renderer, CSS handles desktop/mobile layout ── */}
                <div className="cart-list">
                  {allItems.map((item, index) => renderCartRow(item, index))}
                </div>

                <div className="cart-items-panel__footer d-flex justify-content-center mb-2 mt-2">
                  <button
                    className="cart-item-remove-btn btn btn-light"
                    style={{ fontSize: 17 }}
                    onClick={handleClearCartClick}
                  >
                    <FaRegTrashAlt /> {t('cart.clear')}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* ── Delete confirmation modal ── */}
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