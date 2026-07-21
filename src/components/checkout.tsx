import React, { useLayoutEffect, useState, useEffect } from 'react';
import Header from './Header';
import '../styles/checkout.css';
import { clientData, usePayment, PaymentResponse } from '../contexts/PaymentContext';
import { useForm, Controller } from 'react-hook-form';
import { AiFillAlert } from 'react-icons/ai';
import { IoArrowBackOutline } from 'react-icons/io5';
import { FaCreditCard, FaMoneyBillTransfer, FaPhone } from 'react-icons/fa6';
import { BsGeoAltFill } from 'react-icons/bs';
import { FaCity, FaRegUserCircle, FaUserCircle, FaUserCheck, FaUserSlash } from 'react-icons/fa';
import { MdAlternateEmail, MdRemoveShoppingCart } from 'react-icons/md';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import { useLangContext } from '../contexts/LanguageContext';
import { toast, Zoom } from 'react-toastify';
import { CartItem, useCart } from '../contexts/CartContext';
import Loading from './loading';
import Footer from './Footer';
import { HiOutlineCash } from 'react-icons/hi';
import { MdCheckCircle } from 'react-icons/md';
import {
  cities, goTo, policiesAcceptanceText,
  selectedLang, sendEmail, showToast,
} from './constants';
import createInvoice from '../contexts/CreateInvoice';
import { connecter } from '../server/connecter';
import { useClientAuth } from '../contexts/ClientAuthContext';



import PhoneInput, {
  isValidPhoneNumber,
  isPossiblePhoneNumber,
} from 'react-phone-number-input';

import fr from 'react-phone-number-input/locale/fr';
import ar from 'react-phone-number-input/locale/ar';
import en from 'react-phone-number-input/locale/en';

// ─── Route constants ──────────────────────────────────────────────────────────
// ⚠️ UPDATE THESE to match your actual router paths for the success/failure
// pages. Both online and COD flows now go through the SAME two constants,
// so success/failure always lands on the same page regardless of payment method.
const SUCCESS_ROUTE = '/Transaction/Success';
const FAILURE_ROUTE = '/Transaction/Failed';

// ─── Types ────────────────────────────────────────────────────────────────────

type CheckoutFormValues = {
  firstName: string; lastName: string;
  email: string; phone: string;
  city: string; address: string;
};

type PaymentMethod = 'cod' | 'online' | undefined;

type CheckoutMode = 'choosing' | 'account' | 'guest';

// ─── Constants ────────────────────────────────────────────────────────────────

const IS_ONLINE_PAYMENT_ENABLED: boolean =
  import.meta.env.VITE_ONLINE_PAYMENT === 'true';

const CURRENCY_TO_COUNTRY_CODE: Record<string, string> = {
  MAD: 'MA', EUR: 'EU', USD: 'US',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCountryCodeByCurrency = (c: string) => CURRENCY_TO_COUNTRY_CODE[c] ?? '';

const isClientDataComplete = (data: clientData | undefined): boolean => {
  if (!data) return false;
  return Object.values(data).every(v => v !== '');
};

const itemsPayload = (items: CartItem[]) =>
  items.map(item => ({ id: item.id, size: item.size, quantity: item.quantity }));

// ─── Pay overlay ──────────────────────────────────────────────────────────────

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
        .pno-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center}
        .pno-card{background:#fff;border-radius:20px;box-shadow:0 8px 60px rgba(0,0,0,0.22);padding:2.75rem 2.5rem 2.25rem;text-align:center;max-width:360px;width:90%}
        .pno-icon-wrap{position:relative;width:70px;height:70px;margin:0 auto 1.25rem}
        .pno-ring{position:absolute;inset:0;border-radius:50%;border:3px solid #e8f5e9;border-top-color:#1e7fff;animation:pno-spin 1s linear infinite}
        @keyframes pno-spin{to{transform:rotate(360deg)}}
        .pno-icon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.6rem}
        .pno-title{font-size:1.15rem;font-weight:700;color:#0f1c35;margin-bottom:0.3rem}
        .pno-sub{font-size:0.82rem;color:#6b7c6e}
        .pno-dots span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#1e7fff;margin:1.25rem 3px 0;animation:pno-bounce 1.2s ease-in-out infinite}
        .pno-dots span:nth-child(2){animation-delay:0.2s}.pno-dots span:nth-child(3){animation-delay:0.4s}
        @keyframes pno-bounce{0%,80%,100%{transform:scale(0.7);opacity:0.5}40%{transform:scale(1.2);opacity:1}}
      `}</style>
      <div className="pno-backdrop">
        <div className="pno-card">
          <div className="pno-icon-wrap">
            <div className="pno-ring" />
            <div className="pno-icon">{icon}</div>
          </div>
          <div className="pno-title">{title}</div>
          <div className="pno-sub">{sub}</div>
          <div className="pno-dots"><span /><span /><span /></div>
        </div>
      </div>
    </>
  );
};

// ─── Auth mode chooser screen ─────────────────────────────────────────────────

const ModeChooser: React.FC<{
  onAccount: () => void;
  onGuest:   () => void;
}> = ({ onAccount, onGuest }) => {
  const { t } = useTranslation();
  return (
    <div className="co-mode-chooser">
      <h2 className="co-mode-chooser__title">{t('auth.checkoutHowToContinue')}</h2>
      <p className="co-mode-chooser__sub">{t('auth.checkoutSub')}</p>

      <div className="co-mode-chooser__cards">
        <button className="co-mode-card co-mode-card--account" onClick={onAccount}>
          <FaUserCheck className="co-mode-card__icon" />
          <div>
            <p className="co-mode-card__title">{t('auth.checkoutWithAccount')}</p>
            <p className="co-mode-card__sub">{t('auth.checkoutWithAccountSub')}</p>
          </div>
          <IoArrowBackOutline className="co-mode-card__arrow" style={{ transform: 'rotate(180deg)' }} />
        </button>

        <button className="co-mode-card co-mode-card--guest" onClick={onGuest}>
          <FaUserSlash className="co-mode-card__icon" />
          <div>
            <p className="co-mode-card__title">{t('auth.checkoutAsGuest')}</p>
            <p className="co-mode-card__sub">{t('auth.checkoutAsGuestSub')}</p>
          </div>
          <IoArrowBackOutline className="co-mode-card__arrow" style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </div>
  );
};

// ─── "Ordering as" banner (shown when authenticated) ─────────────────────────

const AuthBanner: React.FC<{ firstName: string; lastName: string; email: string; onSwitch: () => void }> = ({
  firstName, lastName, email, onSwitch,
}) => {
  const { t } = useTranslation();
  return (
    <div className="co-auth-banner">
      <FaUserCheck className="co-auth-banner__icon" />
      <div className="co-auth-banner__text">
        <span className="co-auth-banner__name">{firstName} {lastName}</span>
        <span className="co-auth-banner__email">{email}</span>
      </div>
      <button className="co-auth-banner__switch" onClick={onSwitch}>
        {t('auth.continueAsGuest')}
      </button>
    </div>
  );
};

// ─── Guest nudge (soft sign-in prompt shown on guest form) ────────────────────

const GuestNudge: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="co-guest-nudge">
      <span>{t('auth.guestNudge')}</span>
      <button className="co-guest-nudge__btn" onClick={() => goTo('/signin')}>
        {t('auth.signIn')}
      </button>
      <span>{t('auth.or')}</span>
      <button className="co-guest-nudge__btn co-guest-nudge__btn--secondary" onClick={() => goTo('/signup')}>
        {t('auth.createOne')}
      </button>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const Checkout: React.FC = () => {
  const orderDate = new Date();
  const { t } = useTranslation();
  const { currentLang } = useLangContext();
  const { cartTotalAmount, cartChecker, clearCart, allItems, setSuccessTransItems, successTransItems } = useCart();
  const {
    setClientForm, clientForm, setPaymentResponse, clearPaymentResponse,
    setCurrentCurrency, currentCurrency, currencyIsAvailable,
  } = usePayment();
  const { client, isAuthenticated, isLoading: authLoading } = useClientAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [isMobileView,          setIsMobileView]          = useState(false);
  const [isFormLocked,          setIsFormLocked]          = useState(false);
  const [isLoading,             setIsLoading]             = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(undefined);
  const [arePoliciesAccepted,   setArePoliciesAccepted]   = useState(false);
  const [hasPoliciesError,      setHasPoliciesError]      = useState(false);
  const [overlayStage,          setOverlayStage]          = useState<OverlayStage | null>(null);
  const [confirmedAmount,       setConfirmedAmount]       = useState<number | null>(null);

  const [mode, setMode] = useState<CheckoutMode>('choosing');

  const isRtl        = selectedLang(currentLang) === 'ar';
  const displayTotal = confirmedAmount ?? cartTotalAmount;
  const labels = selectedLang(currentLang) == 'fr'?fr: selectedLang(currentLang) == 'ar'?ar:en

  // Clear any leftover payment result from a previous transaction the
  // moment the user lands back on Checkout — this is the main defense
  // against stale success/failure data leaking into a new attempt.
  useEffect(() => {
    clearPaymentResponse();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-detect mode once auth resolves ───────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && client) {
      setMode('account');
    }
  }, [authLoading, isAuthenticated, client]);

  // ── Form setup ─────────────────────────────────────────────────────────────
  const {
    register, control, handleSubmit,
    formState: { errors, isSubmitting },
    getValues, reset,
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      firstName: clientForm?.FirstName ?? '',
      lastName:  clientForm?.LastName  ?? '',
      email:     clientForm?.Email     ?? '',
      phone:     clientForm?.Phone     ?? '',
      city:      clientForm?.City      ?? '',
      address:   clientForm?.Address   ?? '',
    },
  });

  useEffect(() => {
    if (isAuthenticated && client && mode === 'account') {
      reset({
        firstName: client.first_name,
        lastName:  client.last_name,
        email:     client.email,
        phone:     client.phone     ?? '',
        city:      client.city      ?? '',
        address:   client.address   ?? '',
      });
    }
  }, [isAuthenticated, client, mode, reset, clientForm?.City]);

  // ── Responsive ─────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const check = () => setIsMobileView(window.innerWidth <= 800);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleFormSubmit = async () => {
    if (!arePoliciesAccepted) {
      setHasPoliciesError(true);
      toast.error(t('footer.policiesNotAccepted'), {
        position: 'top-center', autoClose: 2000,
        closeOnClick: false, pauseOnHover: false,
        draggable: true, theme: 'colored', transition: Zoom,
      });
      return;
    }
    setHasPoliciesError(false);

    const clientCoords: clientData = {
      FirstName: getValues('firstName'),
      LastName:  getValues('lastName'),
      Email:     getValues('email'),
      Phone:     getValues('phone'),
      City:      getValues('city'),
      Address:   getValues('address'),
      Currency:  'MAD',
      Amount:    cartTotalAmount,
    };
    setClientForm(clientCoords);
    setIsFormLocked(true);
    await new Promise(r => setTimeout(r, 1000));
  };

  const handlePayNowClick = async () => {
    // Defensive: clear any stale result before starting a fresh payment attempt.
    clearPaymentResponse();

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
            currency:    'MAD',
            success_url: `${window.location.origin}${SUCCESS_ROUTE}`,
            error_url:   `${window.location.origin}${FAILURE_ROUTE}`,
            lang:        selectedLang(currentLang),
          },
          customer: {
            first_name:   clientForm.FirstName,
            last_name:    clientForm.LastName,
            address:      clientForm.Address,
            zip_code:     '',
            city:         clientForm.City,
            state:        '',
            country_code: 'MA',
            phone:        clientForm.Phone,
            email:        clientForm.Email,
          },
          items: itemsPayload(allItems),
        });
        setConfirmedAmount(response.data.amount);
        setOverlayStage('redirecting');
        await new Promise(r => setTimeout(r, 600));
        window.location.href = response.data.payment_url;
      } catch (err) {
        console.error(err);
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
        items:          itemsPayload(allItems),
        date,
        onlinePayment:  false,
        transaction_id: transactionId,
        client:         clientForm,
      };

      const response = await connecter.post('api/payment/handle/', payload);
      setSuccessTransItems(response.data.ordered_products ?? []);

      const serverAmount = response.data.paymentResponse.amount;
      setConfirmedAmount(serverAmount);

      const cashPaymentResponse: PaymentResponse = {
        order_id:        response.data.paymentResponse.order_id,
        success:         true,
        transaction_id:  transactionId,
        amount:          serverAmount,
        currency:        response.data.paymentResponse.currency,
        date,
        isOnlinePayment: false,
        code:            '',
        message:         '',
      };

      setPaymentResponse(cashPaymentResponse);

      const invoicePdf      = (await createInvoice(cashPaymentResponse, clientForm, successTransItems)).doc;
      const invoiceFileName = `${clientForm?.FirstName}_${clientForm?.LastName}`;
      const invoiceFile     = new File(
        [invoicePdf.buffer as ArrayBuffer],
        `${invoiceFileName}.pdf`,
        { type: 'application/pdf' }
      );

      await sendEmail(clientForm, invoiceFile, 'Invoice', 'Here is your Invoice');

      // Clear cart BEFORE navigating away, so we don't touch cart state
      // on an unmounted component after the route change.
      clearCart();
      goTo(SUCCESS_ROUTE);
    } catch (error) {
      console.error(error);
      showToast('Something went wrong. Please contact support.', 'error');
    } finally {
      setIsLoading(false);
      setOverlayStage(null);
    }
  };



  const renderFieldError = (message: string | undefined) =>
    message ? <span className={`co-field__error ${isRtl ? 'rtl' : ''}`}>{message}</span> : null;

  const isFormReady = isClientDataComplete(clientForm) && isFormLocked;

  // ── Empty cart guard ───────────────────────────────────────────────────────
  if (!cartChecker) {
    return (
      <>
        <Header />
        <div className="co-empty-cart">
          <MdRemoveShoppingCart size={50} color="#7a8599" />
          <p className={isRtl ? 'rtl' : ''}>{t('cart.empty')}</p>
          <button className="co-save-btn" style={{ width: 'auto', padding: '10px 28px' }} onClick={() => goTo('/')}>
            <b>{t('cart.shopNow')} !</b>
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // ── Auth loading guard ─────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <>
        <Header />
        <Loading message={t('ui.loading')} />
        <Footer />
      </>
    );
  }

  // ── Mode chooser screen ────────────────────────────────────────────────────
  if (mode === 'choosing') {
    return (
      <>
        <Header />
        <div className="co-page">
          <ModeChooser
            onAccount={() => goTo('/signin')}
            onGuest={() => setMode('guest')}
          />
        </div>
        <Footer />
      </>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <>
      {overlayStage && <PayNowOverlay stage={overlayStage} />}
      <Header />

      {isLoading ? (
        <Loading message={t('ui.loading')} />
      ) : (
        <div className="co-page">

          {/* ── Topbar ──────────────────────────────────────────────────── */}
          <div className="co-topbar">
            <div className="co-topbar__steps">
              <div className="co-step">
                <div className={`co-step__circle ${isFormLocked ? 'co-step__circle--done' : 'co-step__circle--active'}`}>
                  {isFormLocked ? <MdCheckCircle size={16} /> : 1}
                </div>
                <span className={`co-step__label ${!isFormLocked ? 'co-step__label--active' : 'co-step__label--done'}`}>
                  {t('form.clientInfo')}
                </span>
              </div>
              <div className={`co-topbar__step-connector ${isFormLocked ? 'co-topbar__step-connector--done' : ''}`} />
              <div className="co-step">
                <div className={`co-step__circle ${isFormLocked ? 'co-step__circle--active' : ''}`}>2</div>
                <span className={`co-step__label ${isFormLocked ? 'co-step__label--active' : ''}`}>
                  {t('payment.portal')}
                </span>
              </div>
            </div>

            <div className="co-topbar__actions">
              <div className="co-topbar__total">
                <strong style={{ color: '#fff' }}>{displayTotal.toFixed(2)}&nbsp;</strong>
                <select
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
                  onChange={e => setCurrentCurrency(e.target.value)}
                  defaultValue={currentCurrency}
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
                  svg style={{ width: 20, height: 20, marginLeft: 4 }}
                />
              </div>
              <button className="co-topbar__back-btn" onClick={() => goTo('/cart')}>
                <IoArrowBackOutline /> {t('cart.toCart')}
              </button>
            </div>
          </div>

          {/* ── Alert ───────────────────────────────────────────────────── */}
          <div className={`co-alert ${isRtl ? 'rtl' : ''}`}>
            <AiFillAlert size={16} className="co-alert__icon" />
            {t('payment.checkoutAlert')}
          </div>

          <div className="co-layout">

            {/* ── Form panel ────────────────────────────────────────────── */}
            <form className="co-card co-form-panel" onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="co-card__header">
                <div>
                  <div className="co-card__header-step">Step 1</div>
                  <div className="co-card__header-title">
                    <FaUserCircle style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    {t('form.clientInfo')}
                  </div>
                </div>
                {isFormLocked && (
                  <button type="button" className="co-card__edit-btn"
                    onClick={() => { setIsFormLocked(false); setSelectedPaymentMethod(undefined); }}>
                    {t('form.modify')}
                  </button>
                )}
              </div>

              {mode === 'account' && isAuthenticated && client && !isFormLocked && (
                <AuthBanner
                  firstName={client.first_name}
                  lastName={client.last_name}
                  email={client.email}
                  onSwitch={() => { setClientForm(undefined as any); setMode('guest'); }}
                />
              )}

              {mode === 'guest' && !isFormLocked && <GuestNudge />}

              <div className="co-form-body">
                <div className={`co-form-row ${isMobileView ? 'flex-column' : ''}`}>
                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.firstName.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.firstName ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><FaRegUserCircle size={15} /></span>
                      <input {...register('firstName', { required: `${t('form.firstName.required')} !` })}
                        type="text" placeholder={t('form.firstName.label')}
                        readOnly={isFormLocked} disabled={isFormLocked}
                        className={`co-field__input ${isFormLocked ? 'co-field__input--locked' : ''}`} />
                    </div>
                    {renderFieldError(errors.firstName?.message)}
                  </div>
                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.lastName.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.lastName ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><FaRegUserCircle size={15} /></span>
                      <input {...register('lastName', { required: `${t('form.lastName.required')} !` })}
                        type="text" placeholder={t('form.lastName.label')}
                        readOnly={isFormLocked} disabled={isFormLocked}
                        className={`co-field__input ${isFormLocked ? 'co-field__input--locked' : ''}`} />
                    </div>
                    {renderFieldError(errors.lastName?.message)}
                  </div>
                </div>

                <div className={`co-form-row ${isMobileView ? 'flex-column' : ''}`}>
                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.email.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.email ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><MdAlternateEmail size={15} /></span>
                      <input {...register('email', { required: `${t('form.email.required')} !` })}
                        type="email" placeholder={t('form.email.label')}
                        readOnly={isFormLocked || (mode === 'account' && isAuthenticated)}
                        disabled={isFormLocked || (mode === 'account' && isAuthenticated)}
                        className={`co-field__input ${isFormLocked ? 'co-field__input--locked' : ''}`} />
                    </div>
                    {renderFieldError(errors.email?.message)}
                  </div>
                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.phone.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.phone ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><FaPhone size={15} /></span>
                        <Controller
                          name="phone"
                          control={control}
                          rules={{
                            required: `${t('form.phone.required')} !`,
                            validate: (value) => {
                              if (!value) {
                                return t('form.phone.required');
                              }

                              if (!isPossiblePhoneNumber(value)) {
                                return t('form.phone.invalidLength');
                              }

                              if (!isValidPhoneNumber(value)) {
                                return t('form.phone.invalidFormat');
                              }

                              return true;
                            },
                          }}
                          render={({ field }) => (!isFormLocked?
                            <PhoneInput
                              labels={labels}
                              defaultCountry="MA"
                              country={field.value ? undefined : "MA"}
                              international={true}
                              placeholder={t('form.phone.label')}
                              value={field.value}
                              onChange={field.onChange}
                              className={`co-phone `}
                            />:
                      <input {...register('phone', { required: `${t('form.phone.required')} !` })}
                        type="tel" placeholder={t('form.phone.label')}
                        readOnly={isFormLocked || (mode === 'account' && isAuthenticated)}
                        disabled={isFormLocked || (mode === 'account' && isAuthenticated)}
                        className={`co-field__input ${isFormLocked ? 'co-field__input--locked' : ''}`} />
                          )}
                        />
                    </div>
                    {renderFieldError(errors.phone?.message)}
                  </div>
                </div>

                <div className={`co-form-row ${isMobileView ? 'flex-column' : ''}`}>
                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.city.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.city ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><FaCity size={15} /></span>
                      <select {...register('city', { required: `${t('form.city.required')} !` })}
                        disabled={isFormLocked}
                        className={`co-field__select ${isFormLocked ? 'co-field__select--locked' : ''}`}>
                        <option value="">{t('form.selectCity')}</option>
                        {cities.map((city, i) => <option key={i} value={city}>{city}</option>)}
                      </select>
                    </div>
                    {renderFieldError(errors.city?.message)}
                  </div>
                  <div className="co-field">
                    <label className={`co-field__label ${isRtl ? 'rtl' : ''}`}>{t('form.address.label')}</label>
                    <div className={`co-field__input-wrap ${isFormLocked ? 'co-field__input-wrap--locked' : ''} ${errors.address ? 'co-field__input-wrap--error' : ''}`}>
                      <span className="co-field__icon"><BsGeoAltFill size={15} /></span>
                      <input {...register('address', { required: `${t('form.address.required')} !` })}
                        type="text" placeholder={t('form.address.label')}
                        readOnly={isFormLocked} disabled={isFormLocked}
                        className={`co-field__input ${isFormLocked ? 'co-field__input--locked' : ''}`} />
                    </div>
                    {renderFieldError(errors.address?.message)}
                  </div>
                </div>

                {!isFormLocked && (
                  <div className={`co-policies ${isRtl ? 'rtl' : ''}`}
                    onClick={() => setArePoliciesAccepted(p => !p)}>
                    <div className={`co-policies__box ${arePoliciesAccepted ? 'co-policies__box--checked' : ''} ${hasPoliciesError ? 'co-policies__box--error' : ''}`}>
                      {arePoliciesAccepted && <MdCheckCircle size={13} />}
                    </div>
                    <span className={`co-policies__text ${hasPoliciesError ? 'co-policies__text--error' : ''}`}>
                      {policiesAcceptanceText(selectedLang(currentLang))}
                    </span>
                  </div>
                )}

                {!isFormLocked && (
                  <button type="submit" disabled={isSubmitting} className="co-save-btn">
                    {isClientDataComplete(clientForm) && !isFormLocked ? t('form.saveChanges') : t('form.save')}
                  </button>
                )}
                {isFormLocked && (
                  <div className="co-saved-confirm">
                    <div className="co-saved-confirm__icon"><MdCheckCircle size={16} /></div>
                    {t('form.save')} — {t('payment.portal')}
                  </div>
                )}
              </div>
            </form>

            {/* ── Right column ──────────────────────────────────────────── */}
            <div className="co-right-col">
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
                  <button type="button"
                    className={`co-pay-method co-pay-method--cod ${selectedPaymentMethod === 'cod' ? 'co-pay-method--selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod('cod')}
                    disabled={!isFormReady}>
                    <div className="co-pay-method__icon"><HiOutlineCash size={22} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="co-pay-method__label">{t('payment.cod')}</div>
                      <div className="co-pay-method__sublabel">Pay when your order arrives</div>
                    </div>
                    <div className="co-pay-method__radio">
                      {selectedPaymentMethod === 'cod' && <div className="co-pay-method__radio-dot" />}
                    </div>
                  </button>

                  <button type="button"
                    className={`co-pay-method co-pay-method--online ${selectedPaymentMethod === 'online' ? 'co-pay-method--selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod('online')}
                    disabled={!IS_ONLINE_PAYMENT_ENABLED || !isFormReady}>
                    <div className="co-pay-method__icon"><FaCreditCard size={22} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="co-pay-method__label">{t('payment.creditCard')}</div>
                      <div className="co-pay-method__sublabel">Secure online payment</div>
                    </div>
                    <div className="co-pay-method__radio">
                      {selectedPaymentMethod === 'online' && <div className="co-pay-method__radio-dot" />}
                    </div>
                  </button>

                  <div className={`co-payment-status ${selectedPaymentMethod ? 'co-payment-status--chosen' : ''}`}>
                    {selectedPaymentMethod === undefined ? t('payment.notChosen')
                      : selectedPaymentMethod === 'online' ? `✓ ${t('payment.creditCard')}`
                      : `✓ ${t('payment.cod')}`}
                  </div>
                </div>
              </div>

              <div className="co-card co-summary">
                <div className="co-summary__title">
                  <span className="co-summary__accent" />Order Summary
                </div>
                <div className="co-summary__row">
                  <span>Subtotal</span>
                  <span>{displayTotal.toFixed(2)} {currentCurrency}</span>
                </div>
                <div className="co-summary__row">
                  <span>Shipping</span>
                  <span style={{ color: '#2e7d32', fontWeight: 600 }}>FREE</span>
                </div>
                <div className="co-summary__divider" />
                <div className="co-summary__total">
                  <span className="co-summary__total-label">Total</span>
                  <span className="co-summary__total-value">{displayTotal.toFixed(2)} {currentCurrency}</span>
                </div>
              </div>

              <button
                type="button"
                className={`co-pay-now-btn ${isFormReady && selectedPaymentMethod ? 'co-pay-now-btn--ready' : ''}`}
                onClick={handlePayNowClick}
                disabled={!isFormReady || !selectedPaymentMethod || overlayStage !== null}>
                <IoArrowBackOutline style={{ transform: 'rotate(180deg)' }} />
                {overlayStage ? '⏳ Please wait…' : `${t('payment.pay')} ${displayTotal.toFixed(2)} ${currentCurrency}`}
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