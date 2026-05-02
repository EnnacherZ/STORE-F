import React, { useLayoutEffect, useState } from 'react';
import Header from './Header';
import '../styles/checkout.css';
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

type OverlayStage = 'url' | 'cod' | 'redirecting';

const PayNowOverlay: React.FC<{ stage: OverlayStage }> = ({ stage }) => {
  const messages: Record<OverlayStage, { icon: string; title: string; sub: string }> = {
    url:         { icon: '🔐', title: 'Initializing Payment',  sub: 'Setting up your secure session…'   },
    cod:         { icon: '📦', title: 'Placing Your Order',    sub: 'Confirming your order…'             },
    redirecting: { icon: '↪',  title: 'Redirecting to Payment',sub: 'Taking you to the payment page…'   },
  };
  const { icon, title, sub } = messages[stage];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono&display=swap');

        .pno-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pno-in 0.2s ease;
        }
        @keyframes pno-in { from { opacity: 0; } to { opacity: 1; } }

        .pno-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 60px rgba(0,0,0,0.22);
          padding: 2.75rem 2.5rem 2.25rem;
          text-align: center;
          max-width: 360px;
          width: 90%;
          font-family: 'DM Sans', sans-serif;
          animation: pno-rise 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes pno-rise { from { transform: translateY(24px) scale(0.95); opacity: 0; } to { transform: none; opacity: 1; } }

        .pno-icon-wrap {
          position: relative;
          width: 70px;
          height: 70px;
          margin: 0 auto 1.25rem;
        }
        .pno-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid #e8f5e9;
          border-top-color: #2e7d32;
          animation: pno-spin 1s linear infinite;
        }
        @keyframes pno-spin { to { transform: rotate(360deg); } }
        .pno-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          animation: pno-pop 0.3s ease-out;
        }
        @keyframes pno-pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .pno-title { font-size: 1.15rem; font-weight: 700; color: #1b2a1e; margin-bottom: 0.3rem; }
        .pno-sub   { font-size: 0.82rem; color: #6b7c6e; font-family: 'DM Mono', monospace; }

        .pno-dots span {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #2e7d32;
          margin: 1.25rem 3px 0;
          animation: pno-bounce 1.2s ease-in-out infinite;
        }
        .pno-dots span:nth-child(2) { animation-delay: 0.2s; }
        .pno-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pno-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40%            { transform: scale(1.2); opacity: 1;   }
        }
      `}</style>

      <div className="pno-backdrop">
        <div className="pno-card">
          <div className="pno-icon-wrap">
            <div className="pno-ring" />
            <div className="pno-icon" key={stage}>{icon}</div>
          </div>
          <div className="pno-title" key={`t-${stage}`}>{title}</div>
          <div className="pno-sub"   key={`s-${stage}`}>{sub}</div>
          <div className="pno-dots">
            <span /><span /><span />
          </div>
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

  // ─── Handlers ─────────────────────────────────────────────────────────────

  // ── 1. Client info form submission ────────────────────────────────────────

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

  // ── 2. Payment method handlers ────────────────────────────────────────────

  const handleOnlinePaymentSelect = () => setSelectedPaymentMethod('online');
  const handleCodSelect           = () => setSelectedPaymentMethod('cod');

  // ── 3. Pay now ────────────────────────────────────────────────────────────
  const handlePayNowClick = async () => {
    if (selectedPaymentMethod === 'cod') {
      processPayment('COD', orderDate.toUTCString());
      ;
    }

    if (selectedPaymentMethod === 'online') {
      if (!clientForm) return;
      try {
        // Show overlay: fetching payment URL
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
          items: allItems
        });

        // Transition overlay: redirect in progress
        setOverlayStage('redirecting');
        // Small pause so user reads "Redirecting…" before browser navigates
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

  // ── 4. Core payment processing (COD only) ─────────────────────────────────

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

      // Use the freshly-built object to avoid stale paymentResponse state
      const invoicePdf      = (await createInvoice(cashPaymentResponse, clientForm)).doc;
      const invoiceFileName = `${clientForm?.FirstName}_${clientForm?.LastName}`;
      const invoiceFile     = new File(
        [invoicePdf.buffer as ArrayBuffer],
        `${invoiceFileName}.pdf`,
        { type: 'application/pdf' }
      );

      await sendEmail(clientForm, invoiceFile, 'Invoice', 'Here is your Invoice');
      goTo('/Transaction/Success')
      clearCart();
    } catch (error) {
      console.error('Payment processing error:', error);
      showToast('Something went wrong. Please contact support.', 'error');
    } finally {
      setIsLoading(false);
      setOverlayStage(null);
    }
  };

  // ─── Validation ───────────────────────────────────────────────────────────

  const validatePhoneNumber = (value: string): true | string => {
    const parsed = parsePhoneNumberFromString(value, 'MA');
    if (parsed && isValidPhoneNumber(value, 'MA')) return true;
    return t('form.phone.invalidFormat') ?? 'Enter a valid phone number: 06.., 07.. or +212..';
  };

  // ─── UI helpers ───────────────────────────────────────────────────────────

  const renderFieldError = (message: string | undefined) =>
    message ? (
      <span className={`field-error ${isRtl ? 'rtl' : ''}`}>{message}</span>
    ) : null;

  const isFormReady = isClientDataComplete(clientForm) && isFormLocked;

  // ─── Empty cart guard ─────────────────────────────────────────────────────

  if (!cartChecker) {
    return (
      <>
        <Header />
        <div className="checkout-empty-cart">
          <MdRemoveShoppingCart size={50} className="checkout-empty-cart__icon" />
          <p className={isRtl ? 'rtl' : ''}>{t('cart.empty')}</p>
          <button
            className={`btn btn-primary mt-4 ${isRtl ? 'rtl' : ''}`}
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
      {/* Overlay renders above everything */}
      {overlayStage && <PayNowOverlay stage={overlayStage} />}

      <Header />

      {isLoading ? (
        <Loading message={t('ui.loading')} />
      ) : (
        <div className="mt-1">

          {/* ── Top bar ───────────────────────────────────────────────────── */}
          <div className="checkout-topbar shadow rounded d-flex justify-content-between">
            <button
              className="btn btn-primary btn-back my-2 mx-1 p-0"
              style={{ width: 90 }}
              onClick={() => goTo('/cart')}
            >
              <IoArrowBackOutline style={{ marginRight: -3 }} /> {t('cart.toCart')}
            </button>

            <div className="d-flex align-items-center">
              <strong style={{ fontSize: 14, color: 'green' }}>
                {cartTotalAmount.toFixed(2)} {currentCurrency}
              </strong>
            </div>

            <div className="checkout-topbar__currency d-flex align-items-center justify-content-end me-0">
              <ReactCountryFlag
                className="checkout-topbar__flag"
                countryCode={getCountryCodeByCurrency(currentCurrency)}
                svg
                style={{ width: '20%', height: 35, marginRight: 3 }}
                title={currentCurrency}
              />
              <select
                className="form-select align-middle d-inline border-0"
                style={{ width: 95, color: 'green', fontWeight: 500, backgroundColor: '#efecec' }}
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
            </div>
          </div>

          {/* ── Alert banner ──────────────────────────────────────────────── */}
          <div className={`checkout-alert rounded p-2 ${isRtl ? 'rtl' : ''}`}>
            <AiFillAlert size="1.3em" className="mx-2 checkout-alert__icon" />
            {t('payment.checkoutAlert')}
          </div>

          {/* ── Main layout ───────────────────────────────────────────────── */}
          <div className="checkout-layout">

            {/* ── Client info form ────────────────────────────────────────── */}
            <form
              className={`client-info-form card shadow-lg pt-0 mt-2 ${isMobileView ? 'client-info-form--mobile' : ''}`}
              onSubmit={handleSubmit(handleFormSubmit)}
            >
              <div className="text-center my-2 fs-3">
                <b><FaUserCircle style={{ marginTop: -3 }} /> {t('form.clientInfo')}</b>
              </div>
              <hr />

              {/* First + Last name */}
              <div className={`form-row d-flex mb-2 ${isMobileView ? 'flex-column' : ''}`}>
                <div className="form-field input-group flex-column px-1">
                  <label className={`form-label ${isRtl ? 'rtl' : ''}`}>
                    {t('form.firstName.label')}:
                  </label>
                  <div className="input-group">
                    <span className="input-group-text"><FaRegUserCircle /></span>
                    <input
                      {...register('firstName', { required: `${t('form.firstName.required')} !` })}
                      type="text"
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                      placeholder={t('form.firstName.label')}
                      readOnly={isFormLocked}
                      disabled={isFormLocked}
                    />
                  </div>
                  {renderFieldError(errors.firstName?.message)}
                </div>

                <div className="form-field input-group flex-column px-1">
                  <label className={`form-label ${isRtl ? 'rtl' : ''}`}>
                    {t('form.lastName.label')}:
                  </label>
                  <div className="input-group">
                    <span className="input-group-text"><FaRegUserCircle /></span>
                    <input
                      {...register('lastName', { required: `${t('form.lastName.required')} !` })}
                      type="text"
                      className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                      placeholder={t('form.lastName.label')}
                      readOnly={isFormLocked}
                      disabled={isFormLocked}
                    />
                  </div>
                  {renderFieldError(errors.lastName?.message)}
                </div>
              </div>

              {/* Email + Phone */}
              <div className={`form-row d-flex mb-2 ${isMobileView ? 'flex-column' : ''}`}>
                <div className="form-field input-group flex-column px-1">
                  <label className={`form-label ${isRtl ? 'rtl' : ''}`}>
                    {t('form.email.label')}:
                  </label>
                  <div className="input-group">
                    <span className="input-group-text"><MdAlternateEmail /></span>
                    <input
                      {...register('email', { required: `${t('form.email.required')} !` })}
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder={t('form.email.label')}
                      readOnly={isFormLocked}
                      disabled={isFormLocked}
                    />
                  </div>
                  {renderFieldError(errors.email?.message)}
                </div>

                <div className="form-field input-group flex-column px-1">
                  <label className={`form-label ${isRtl ? 'rtl' : ''}`}>
                    {t('form.phone.label')}:
                  </label>
                  <div className="input-group">
                    <span className="input-group-text"><FaPhone /></span>
                    <input
                      {...register('phone', {
                        required : `${t('form.phone.required')} !`,
                        minLength: { value: 10, message: t('form.phone.minLength') ?? 'Min 10 characters' },
                        validate : validatePhoneNumber,
                      })}
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder={t('form.phone.label')}
                      readOnly={isFormLocked}
                      disabled={isFormLocked}
                    />
                  </div>
                  {renderFieldError(errors.phone?.message)}
                </div>
              </div>

              {/* City + Address */}
              <div className={`form-row d-flex mb-2 ${isMobileView ? 'flex-column' : ''}`}>
                <div className="form-field input-group flex-column px-1">
                  <label className={`form-label ${isRtl ? 'rtl' : ''}`}>
                    {t('form.city.label')}:
                  </label>
                  <div className="input-group">
                    <span className="input-group-text"><FaCity /></span>
                    <select
                      {...register('city', { required: `${t('form.city.required')} !` })}
                      className={`form-select ${errors.city ? 'is-invalid' : ''}`}
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

                <div className="form-field input-group flex-column px-1">
                  <label className={`form-label ${isRtl ? 'rtl' : ''}`}>
                    {t('form.address.label')}:
                  </label>
                  <div className="input-group">
                    <span className="input-group-text"><BsGeoAltFill /></span>
                    <input
                      {...register('address', { required: `${t('form.address.required')} !` })}
                      type="text"
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      placeholder={t('form.address.label')}
                      readOnly={isFormLocked}
                      disabled={isFormLocked}
                    />
                  </div>
                  {renderFieldError(errors.address?.message)}
                </div>
              </div>

              {/* Policies checkbox */}
              <div className={`form-check d-flex mx-2 my-3 p-0 ${isRtl ? 'rtl' : ''} ${isFormLocked ? 'is-disabled' : ''}`}>
                <input
                  className={`form-check-input mx-2 ${hasPoliciesError ? 'is-invalid' : ''}`}
                  type="checkbox"
                  id="policies-checkbox"
                  readOnly={isFormLocked}
                  disabled={isFormLocked}
                  checked={arePoliciesAccepted}
                  onChange={() => setArePoliciesAccepted((prev) => !prev)}
                  style={{ width: 20, height: 20 }}
                />
                <label className="form-check-label" htmlFor="policies-checkbox">
                  {policiesAcceptanceText(selectedLang(currentLang))}
                </label>
              </div>

              {/* Submit / Edit buttons */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn btn-success rounded ${isFormLocked ? 'd-none' : ''}`}
              >
                {isClientDataComplete(clientForm) && !isFormLocked
                  ? t('form.saveChanges')
                  : t('form.save')}
              </button>

              <button
                type="button"
                className={`btn btn-danger rounded ${isFormLocked ? '' : 'd-none'}`}
                onClick={() => {
                  setIsFormLocked(false);
                  setSelectedPaymentMethod(undefined);
                }}
                disabled={!isFormLocked}
              >
                {t('form.modify')}
              </button>
            </form>

            {/* ── Payment section ──────────────────────────────────────────── */}
            <div className="checkout-payment-panel d-flex flex-column mb-5">
              <div className="payment-gateway card shadow p-2 mt-2">
                <div className="payment-gateway__title fs-3">
                  <FaMoneyBillTransfer className="mx-3" /> {t('payment.portal')}
                </div>
                <hr />

                {/* Cash on Delivery */}
                <button
                  className={`payment-method-btn payment-method-btn--cod rounded my-3 ${isRtl ? 'rtl' : ''} ${selectedPaymentMethod === 'cod' ? 'is-selected' : ''} ${isFormReady ? '' : 'is-disabled'}`}
                  onClick={handleCodSelect}
                  disabled={!isFormReady}
                >
                  <HiOutlineCash className="mx-2" /> {t('payment.cod')}
                </button>

                {/* Online payment */}
                <button
                  className={`payment-method-btn payment-method-btn--online rounded my-3 ${isRtl ? 'rtl' : ''} ${selectedPaymentMethod === 'online' ? 'is-selected' : ''} ${!IS_ONLINE_PAYMENT_ENABLED || !isFormReady ? 'is-disabled' : ''}`}
                  onClick={handleOnlinePaymentSelect}
                  disabled={!IS_ONLINE_PAYMENT_ENABLED || !isFormReady}
                >
                  <FaCreditCard className="mx-3" /> {t('payment.creditCard')}
                </button>

                {/* Selected method display */}
                <div className={`payment-gateway__selection fw-bold fs-6 ${isRtl ? 'rtl' : ''}`}>
                  {t('payment.chosen')}:{' '}
                  {selectedPaymentMethod === undefined
                    ? t('payment.notChosen')
                    : selectedPaymentMethod === 'online'
                      ? t('payment.creditCard')
                      : t('payment.cod')}
                </div>
              </div>

              {/* Pay now button */}
              <button
                id="pay-now-btn"
                className={`pay-now-btn rounded mt-2 ${isFormReady ? '' : 'is-disabled'}`}
                onClick={handlePayNowClick}
                disabled={!isFormReady || overlayStage !== null}
              >
                {overlayStage
                  ? '⏳ Please wait…'
                  : t('payment.pay')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Checkout;