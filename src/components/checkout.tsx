import React, { useLayoutEffect, useState } from 'react';
import Header from './Header';
import '../styles/checkout.css';   // ← replace the contents of this file with the new checkout.css
import { clientData, usePayment, PaymentResponse } from '../contexts/PaymentContext';
import { useForm } from 'react-hook-form';
import { AiFillAlert } from 'react-icons/ai';
import { IoArrowBackOutline } from 'react-icons/io5';
import { FaCreditCard, FaMoneyBillTransfer, FaPhone } from 'react-icons/fa6';
import { BsGeoAltFill } from 'react-icons/bs';
import { FaCity, FaRegUserCircle, FaUserCircle } from 'react-icons/fa';
import { MdAlternateEmail, MdRemoveShoppingCart } from 'react-icons/md';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import { useLangContext } from '../contexts/LanguageContext';
import { toast, Zoom } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import Loading from './loading';
import Footer from './Footer';
import { HiOutlineCash } from 'react-icons/hi';
import { MdCheckCircle } from 'react-icons/md';
import {
  cities,
  goTo,
  policiesAcceptanceText,
  selectedLang,
  sendEmail,
  showToast,
} from './constants';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import createInvoice from '../contexts/CreateInvoice';
import { connecter } from '../server/connecter';

// ─── Types ────────────────────────────────────────────────────────────────────

type CheckoutFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
};

type PaymentMethod = 'cod' | 'online' | undefined;

// ─── Constants ────────────────────────────────────────────────────────────────

const IS_ONLINE_PAYMENT_ENABLED: boolean =
  import.meta.env.VITE_ONLINE_PAYMENT === 'true';

const CURRENCY_TO_COUNTRY_CODE: Record<string, string> = {
  MAD: 'MA',
  EUR: 'EU',
  USD: 'US',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCountryCodeByCurrency = (currency: string): string =>
  CURRENCY_TO_COUNTRY_CODE[currency] ?? '';

const isClientDataComplete = (data: clientData | undefined): boolean => {
  if (!data) return false;
  return Object.values(data).every((value) => value !== '');
};

// ─── Pay-now overlay ──────────────────────────────────────────────────────────
// (unchanged — kept exactly as original)

type OverlayStage = 'url' | 'cod' | 'redirecting';

const PayNowOverlay: React.FC<{ stage: OverlayStage }> = ({ stage }) => {
  const { t } = useTranslation();
  const messages: Record<OverlayStage, { icon: string; title: string; sub: string }> = {
    url:         { icon: '🔐', title: t('payment.overlayUrlTitle'),      sub: t('payment.overlayUrlSub')      },
    cod:         { icon: '📦', title: t('payment.overlayCodTitle'),      sub: t('payment.overlayCodSub')      },
    redirecting: { icon: '↪',  title: t('payment.overlayRedirectTitle'), sub: t('payment.overlayRedirectSub') },
  };
  const { icon, title, sub } = messages[stage];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono&display=swap');
        .pno-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:pno-in 0.2s ease}
        @keyframes pno-in{from{opacity:0}to{opacity:1}}
        .pno-card{background:#fff;border-radius:20px;box-shadow:0 8px 60px rgba(0,0,0,0.22);padding:2.75rem 2.5rem 2.25rem;text-align:center;max-width:360px;width:90%;font-family:'DM Sans',sans-serif;animation:pno-rise 0.3s cubic-bezier(0.34,1.56,0.64,1)}
        @keyframes pno-rise{from{transform:translateY(24px) scale(0.95);opacity:0}to{transform:none;opacity:1}}
        .pno-icon-wrap{position:relative;width:70px;height:70px;margin:0 auto 1.25rem}
        .pno-ring{position:absolute;inset:0;border-radius:50%;border:3px solid #e8f5e9;border-top-color:#1e7fff;animation:pno-spin 1s linear infinite}
        @keyframes pno-spin{to{transform:rotate(360deg)}}
        .pno-icon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.6rem;animation:pno-pop 0.3s ease-out}
        @keyframes pno-pop{from{transform:scale(0.6);opacity:0}to{transform:scale(1);opacity:1}}
        .pno-title{font-size:1.15rem;font-weight:700;color:#0f1c35;margin-bottom:0.3rem}
        .pno-sub{font-size:0.82rem;color:#6b7c6e;font-family:'DM Mono',monospace}
        .pno-dots span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#1e7fff;margin:1.25rem 3px 0;animation:pno-bounce 1.2s ease-in-out infinite}
        .pno-dots span:nth-child(2){animation-delay:0.2s}
        .pno-dots span:nth-child(3){animation-delay:0.4s}
        @keyframes pno-bounce{0%,80%,100%{transform:scale(0.7);opacity:0.5}40%{transform:scale(1.2);opacity:1}}
      `}</style>
      <div className="pno-backdrop">
        <div className="pno-card">
          <div className="pno-icon-wrap">
            <div className="pno-ring" />
            <div className="pno-icon" key={stage}>{icon}</div>
          </div>
          <div className="pno-title" key={`t-${stage}`}>{title}</div>
          <div className="pno-sub"   key={`s-${stage}`}>{sub}</div>
          <div className="pno-dots"><span /><span /><span /></div>
        </div>
      </div>
    </>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const Checkout: React.FC = () => {
  const orderDate = new Date();
  const { t } = useTranslation();
  const { currentLang } = useLangContext();
  const { cartTotalAmount, cartChecker, clearCart, allItems, setSuccessTransItems } = useCart();
  const {
    setClientForm,
    clientForm,
    setPaymentResponse,
    setCurrentCurrency,
    currentCurrency,
    currencyIsAvailable,
  } = usePayment();

  // ── State ──────────────────────────────────────────────────────────────────

  const [isMobileView, setIsMobileView]                   = useState<boolean>(false);
  const [isFormLocked, setIsFormLocked]                   = useState<boolean>(false);
  const [isLoading, setIsLoading]                         = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(undefined);
  const [arePoliciesAccepted, setArePoliciesAccepted]     = useState<boolean>(false);
  const [hasPoliciesError, setHasPoliciesError]           = useState<boolean>(false);
  const [overlayStage, setOverlayStage]                   = useState<OverlayStage | null>(null);

  const isRtl = selectedLang(currentLang) === 'ar';

  // ── Form setup ─────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      firstName : clientForm?.FirstName ?? '',
      lastName  : clientForm?.LastName  ?? '',
      email     : clientForm?.Email     ?? '',
      phone     : clientForm?.Phone     ?? '',
      city      : clientForm?.City      ?? '',
      address   : clientForm?.Address   ?? '',
    },
  });

  // ── Responsive breakpoint ──────────────────────────────────────────────────

  useLayoutEffect(() => {
    const check = () => setIsMobileView(window.innerWidth <= 800);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ─── Handlers (ALL UNCHANGED) ─────────────────────────────────────────────

  const handleFormSubmit = async () => {
    if (!arePoliciesAccepted) {
      setHasPoliciesError(true);
      toast.error(t('footer.policiesNotAccepted'), {
        position    : 'top-center',
        autoClose   : 2000,
        closeOnClick: false,
        pauseOnHover: false,
        draggable   : true,
        theme       : 'colored',
        transition  : Zoom,
      });
      return;
    }
    setHasPoliciesError(false);
    const clientCoords: clientData = {
      FirstName: getValues('firstName'),
      LastName : getValues('lastName'),
      Email    : getValues('email'),
      Phone    : getValues('phone'),
      City     : getValues('city'),
      Address  : getValues('address'),
      Amount   : cartTotalAmount,
      Currency : 'MAD',
    };
    setClientForm(clientCoords);
    setIsFormLocked(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleOnlinePaymentSelect = () => setSelectedPaymentMethod('online');
  const handleCodSelect           = () => setSelectedPaymentMethod('cod');

  const handlePayNowClick = async () => {
    if (selectedPaymentMethod === 'cod') {
      processPayment('COD', orderDate.toUTCString());
      return;
    }
    if (selectedPaymentMethod === 'online') {
      if (!clientForm) return;
      try {
        setOverlayStage('url');
        const response = await connecter.post('api/payment/url/get', {
          tokenParams: {
            amount      : Number(clientForm.Amount),
            currency    : 'MAD',
            success_url : `${window.location.origin}/payment/success`,
            error_url   : `${window.location.origin}/payment/error`,
            lang        : selectedLang(currentLang),
          },
          customer: {
            first_name  : clientForm.FirstName,
            last_name   : clientForm.LastName,
            address     : clientForm.Address,
            zip_code    : '',
            city        : clientForm.City,
            state       : '',
            country_code: 'MA',
            phone       : clientForm.Phone,
            email       : clientForm.Email,
          },
          items: allItems,
        });
        setOverlayStage('redirecting');
        await new Promise(r => setTimeout(r, 600));
        window.location.href = response.data.payment_url;
      } catch (err) {
        console.error('Payment URL fetch failed:', err);
        setOverlayStage(null);
        showToast('Failed to initialize payment. Please try again.', 'error');
      }
      return;
    }
    showToast(t('payment.choose'), 'error');
  };

  const processPayment = async (transactionId: string, date: string) => {
    try {
      setIsLoading(true);
      setOverlayStage('cod');
      window.scrollTo(0, 0);
      const payload = {
        items         : allItems,
        date,
        onlinePayment : false,
        transaction_id: transactionId,
        client        : clientForm,
      };
      const response = await connecter.post('api/payment/handle/', payload);
      setSuccessTransItems(response.data.ordered_products ?? []);
      const cashPaymentResponse: PaymentResponse = {
        order_id       : response.data.paymentResponse.order_id,
        success        : true,
        transaction_id : transactionId,
        amount         : response.data.paymentResponse.amount,
        currency       : response.data.paymentResponse.currency,
        date,
        isOnlinePayment: false,
        code           : '',
        message        : '',
      };
      setPaymentResponse(cashPaymentResponse);
      const invoicePdf      = (await createInvoice(cashPaymentResponse, clientForm)).doc;
      const invoiceFileName = `${clientForm?.FirstName}_${clientForm?.LastName}`;
      const invoiceFile     = new File(
        [invoicePdf.buffer as ArrayBuffer],
        `${invoiceFileName}.pdf`,
        { type: 'application/pdf' }
      );
      await sendEmail(clientForm, invoiceFile, 'Invoice', 'Here is your Invoice');
      goTo('/Transaction/Success');
      clearCart();
    } catch (error) {
      console.error('Payment processing error:', error);
      showToast('Something went wrong. Please contact support.', 'error');
    } finally {
      setIsLoading(false);
      setOverlayStage(null);
    }
  };

  const validatePhoneNumber = (value: string): true | string => {
    const parsed = parsePhoneNumberFromString(value, 'MA');
    if (parsed && isValidPhoneNumber(value, 'MA')) return true;
    return t('form.phone.invalidFormat') ?? 'Enter a valid phone number: 06.., 07.. or +212..';
  };

  const renderFieldError = (message: string | undefined) =>
    message ? (
      <span className={`co-field__error ${isRtl ? 'rtl' : ''}`}>{message}</span>
    ) : null;

  const isFormReady = isClientDataComplete(clientForm) && isFormLocked;

  // ─── Empty cart guard ─────────────────────────────────────────────────────

  if (!cartChecker) {
    return (
      <>
        <Header />
        <div className="co-empty-cart">
          <MdRemoveShoppingCart size={50} color="#7a8599" />
          <p className={isRtl ? 'rtl' : ''}>{t('cart.empty')}</p>
          <button
            className="co-save-btn"
            style={{ width: 'auto', padding: '10px 28px' }}
            onClick={() => goTo('/')}
          >
            <b>{t('cart.shopNow')} !</b>
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <>
      {overlayStage && <PayNowOverlay stage={overlayStage} />}

      <Header />

      {isLoading ? (
        <Loading message={t('ui.loading')} />
      ) : (
        <div className="co-page">

          {/* ── Topbar ────────────────────────────────────────────────────── */}
          <div className="co-topbar">
            {/* Logo */}
            <div className="co-topbar__logo">
              <div className="co-topbar__logo-icon">
                <FaMoneyBillTransfer size={18} />
              </div>
              <div>
                <div className="co-topbar__logo-name">AL-FIRDAOUS</div>
                <div className="co-topbar__logo-sub">STORE</div>
              </div>
            </div>

            {/* Steps */}
            <div className="co-topbar__steps">
              {/* Step 1 */}
              <div className="co-step">
                <div className={`co-step__circle ${isFormLocked ? 'co-step__circle--done' : 'co-step__circle--active'}`}>
                  {isFormLocked
                    ? <MdCheckCircle size={16} />
                    : 1}
                </div>
                <span className={`co-step__label ${!isFormLocked ? 'co-step__label--active' : 'co-step__label--done'}`}>
                  {t('form.clientInfo')}
                </span>
              </div>

              <div className={`co-topbar__step-connector ${isFormLocked ? 'co-topbar__step-connector--done' : ''}`} />

              {/* Step 2 */}
              <div className="co-step">
                <div className={`co-step__circle ${isFormLocked ? 'co-step__circle--active' : ''}`}>
                  2
                </div>
                <span className={`co-step__label ${isFormLocked ? 'co-step__label--active' : ''}`}>
                  {t('payment.portal')}
                </span>
              </div>
            </div>

            {/* Total + currency + back */}
            <div className="co-topbar__actions">
              <div className="co-topbar__total">
                <strong style={{ color: '#fff' }}>
                  {cartTotalAmount.toFixed(2)}&nbsp;
                </strong>
                <select
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                  onChange={(e) => setCurrentCurrency(e.target.value)}
                  defaultValue={currentCurrency}
                  aria-label="Select currency"
                >
                  <option value="MAD" style={{ color: '#0f1c35' }}>MAD</option>
                  {currencyIsAvailable && (
                    <>
                      <option value="USD" style={{ color: '#0f1c35' }}>USD $</option>
                      <option value="EUR" style={{ color: '#0f1c35' }}>EUR €</option>
                    </>
                  )}
                </select>
                <ReactCountryFlag
                  countryCode={getCountryCodeByCurrency(currentCurrency)}
                  svg
                  style={{ width: 20, height: 20, marginLeft: 4 }}
                  title={currentCurrency}
                />
              </div>

              <button
                className="co-topbar__back-btn"
                onClick={() => goTo('/cart')}
              >
                <IoArrowBackOutline /> {t('cart.toCart')}
              </button>
            </div>
          </div>

          {/* ── Alert banner ──────────────────────────────────────────────── */}
          <div className={`co-alert ${isRtl ? 'rtl' : ''}`}>
            <AiFillAlert size={16} className="co-alert__icon" />
            {t('payment.checkoutAlert')}
          </div>

          {/* ── Main layout ───────────────────────────────────────────────── */}
          <div className="co-layout">

            {/* ── Shipping form ───────────────────────────────────────────── */}
            <form
              className="co-card co-form-panel"
              onSubmit={handleSubmit(handleFormSubmit)}
            >
              <div className="co-card__header">
                <div>
                  <div className="co-card__header-step">Step 1</div>
                  <div className="co-card__header-title">
                    <FaUserCircle style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    {t('form.clientInfo')}
                  </div>
                </div>
                {isFormLocked && (
                  <button
                    type="button"
                    className="co-card__edit-btn"
                    onClick={() => { setIsFormLocked(false); setSelectedPaymentMethod(undefined); }}
                  >
                    {t('form.modify')}
                  </button>
                )}
              </div>

              <div className="co-form-body">
                {/* Row: First + Last name */}
                <div className={`co-form-row ${isMobileView ? 'flex-column' : ''}`}>
                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.firstName.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.firstName ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><FaRegUserCircle size={15} /></span>
                      <input
                        {...register('firstName', { required: `${t('form.firstName.required')} !` })}
                        type="text"
                        className={`co-field__input ${isFormLocked ? 'co-field__input--locked' : ''}`}
                        placeholder={t('form.firstName.label')}
                        readOnly={isFormLocked}
                        disabled={isFormLocked}
                      />
                    </div>
                    {renderFieldError(errors.firstName?.message)}
                  </div>

                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.lastName.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.lastName ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><FaRegUserCircle size={15} /></span>
                      <input
                        {...register('lastName', { required: `${t('form.lastName.required')} !` })}
                        type="text"
                        className={`co-field__input ${isFormLocked ? 'co-field__input--locked' : ''}`}
                        placeholder={t('form.lastName.label')}
                        readOnly={isFormLocked}
                        disabled={isFormLocked}
                      />
                    </div>
                    {renderFieldError(errors.lastName?.message)}
                  </div>
                </div>

                {/* Row: Email + Phone */}
                <div className={`co-form-row ${isMobileView ? 'flex-column' : ''}`}>
                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.email.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.email ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><MdAlternateEmail size={15} /></span>
                      <input
                        {...register('email', { required: `${t('form.email.required')} !` })}
                        type="email"
                        className={`co-field__input ${isFormLocked ? 'co-field__input--locked' : ''}`}
                        placeholder={t('form.email.label')}
                        readOnly={isFormLocked}
                        disabled={isFormLocked}
                      />
                    </div>
                    {renderFieldError(errors.email?.message)}
                  </div>

                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.phone.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.phone ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><FaPhone size={15} /></span>
                      <input
                        {...register('phone', {
                          required : `${t('form.phone.required')} !`,
                          minLength: { value: 10, message: t('form.phone.minLength') ?? 'Min 10 characters' },
                          validate : validatePhoneNumber,
                        })}
                        type="tel"
                        className={`co-field__input ${isFormLocked ? 'co-field__input--locked' : ''}`}
                        placeholder={t('form.phone.label')}
                        readOnly={isFormLocked}
                        disabled={isFormLocked}
                      />
                    </div>
                    {renderFieldError(errors.phone?.message)}
                  </div>
                </div>

                {/* Row: City + Address */}
                <div className={`co-form-row ${isMobileView ? 'flex-column' : ''}`}>
                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.city.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.city ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><FaCity size={15} /></span>
                      <select
                        {...register('city', { required: `${t('form.city.required')} !` })}
                        className={`co-field__select ${isFormLocked ? 'co-field__select--locked' : ''}`}
                        disabled={isFormLocked}
                        id="city-select"
                      >
                        <option value="">{t('form.selectCity')}</option>
                        {cities.map((city, index) => (
                          <option value={city} key={index}>{city}</option>
                        ))}
                      </select>
                    </div>
                    {renderFieldError(errors.city?.message)}
                  </div>

                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.address.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.address ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><BsGeoAltFill size={15} /></span>
                      <input
                        {...register('address', { required: `${t('form.address.required')} !` })}
                        type="text"
                        className={`co-field__input ${isFormLocked ? 'co-field__input--locked' : ''}`}
                        placeholder={t('form.address.label')}
                        readOnly={isFormLocked}
                        disabled={isFormLocked}
                      />
                    </div>
                    {renderFieldError(errors.address?.message)}
                  </div>
                </div>

                {/* Policies */}
                {!isFormLocked && (
                  <div
                    className={`co-policies ${isRtl ? 'rtl' : ''}`}
                    onClick={() => setArePoliciesAccepted((prev) => !prev)}
                  >
                    <div className={`co-policies__box ${arePoliciesAccepted ? 'co-policies__box--checked' : ''} ${hasPoliciesError ? 'co-policies__box--error' : ''}`}>
                      {arePoliciesAccepted && <MdCheckCircle size={13} />}
                    </div>
                    <span className={`co-policies__text ${hasPoliciesError ? 'co-policies__text--error' : ''}`}>
                      {policiesAcceptanceText(selectedLang(currentLang))}
                    </span>
                  </div>
                )}

                {/* Submit */}
                {!isFormLocked && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="co-save-btn"
                  >
                    {isClientDataComplete(clientForm) && !isFormLocked
                      ? t('form.saveChanges')
                      : t('form.save')}
                  </button>
                )}

                {/* Confirmed state */}
                {isFormLocked && (
                  <div className="co-saved-confirm">
                    <div className="co-saved-confirm__icon">
                      <MdCheckCircle size={16} />
                    </div>
                    {t('form.save')} — {t('payment.portal')}
                  </div>
                )}
              </div>
            </form>

            {/* ── Right column ──────────────────────────────────────────────── */}
            <div className="co-right-col">

              {/* Payment methods */}
              <div className="co-card">
                <div className="co-card__header">
                  <div>
                    <div className="co-card__header-step">Step 2</div>
                    <div className="co-card__header-title">
                      <FaMoneyBillTransfer style={{ marginRight: 8, verticalAlign: 'middle' }} />
                      {t('payment.portal')}
                    </div>
                  </div>
                </div>

                <div className="co-payment-body">
                  {/* Cash on Delivery */}
                  <button
                    type="button"
                    className={`co-pay-method co-pay-method--cod ${selectedPaymentMethod === 'cod' ? 'co-pay-method--selected' : ''}`}
                    onClick={handleCodSelect}
                    disabled={!isFormReady}
                  >
                    <div className="co-pay-method__icon">
                      <HiOutlineCash size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="co-pay-method__label">{t('payment.cod')}</div>
                      <div className="co-pay-method__sublabel">Pay when your order arrives</div>
                    </div>
                    <div className="co-pay-method__radio">
                      {selectedPaymentMethod === 'cod' && <div className="co-pay-method__radio-dot" />}
                    </div>
                  </button>

                  {/* Online payment */}
                  <button
                    type="button"
                    className={`co-pay-method co-pay-method--online ${selectedPaymentMethod === 'online' ? 'co-pay-method--selected' : ''}`}
                    onClick={handleOnlinePaymentSelect}
                    disabled={!IS_ONLINE_PAYMENT_ENABLED || !isFormReady}
                  >
                    <div className="co-pay-method__icon">
                      <FaCreditCard size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="co-pay-method__label">{t('payment.creditCard')}</div>
                      <div className="co-pay-method__sublabel">Secure online payment</div>
                    </div>
                    <div className="co-pay-method__radio">
                      {selectedPaymentMethod === 'online' && <div className="co-pay-method__radio-dot" />}
                    </div>
                  </button>

                  <div className={`co-payment-status ${selectedPaymentMethod ? 'co-payment-status--chosen' : ''}`}>
                    {selectedPaymentMethod === undefined
                      ? t('payment.notChosen')
                      : selectedPaymentMethod === 'online'
                        ? `✓ ${t('payment.creditCard')}`
                        : `✓ ${t('payment.cod')}`}
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="co-card co-summary">
                <div className="co-summary__title">
                  <span className="co-summary__accent" />
                  Order Summary
                </div>
                <div className="co-summary__row">
                  <span>Subtotal</span>
                  <span>{(cartTotalAmount - 20).toFixed(2)} {currentCurrency}</span>
                </div>
                <div className="co-summary__row">
                  <span>Shipping</span>
                  <span>20.00 {currentCurrency}</span>
                </div>
                <div className="co-summary__divider" />
                <div className="co-summary__total">
                  <span className="co-summary__total-label">Total</span>
                  <span className="co-summary__total-value">{cartTotalAmount.toFixed(2)} {currentCurrency}</span>
                </div>
              </div>

              {/* Pay now */}
              <button
                id="pay-now-btn"
                type="button"
                className={`co-pay-now-btn ${isFormReady && selectedPaymentMethod ? 'co-pay-now-btn--ready' : ''}`}
                onClick={handlePayNowClick}
                disabled={!isFormReady || !selectedPaymentMethod || overlayStage !== null}
              >
                <IoArrowBackOutline style={{ transform: 'rotate(180deg)' }} />
                {overlayStage
                  ? '⏳ Please wait…'
                  : `${t('payment.pay')} ${cartTotalAmount.toFixed(2)} ${currentCurrency}`}
              </button>

              <div className="co-ssl-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                SSL encrypted · Secure Checkout
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Checkout;
