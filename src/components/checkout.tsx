import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  FirstNameInput,
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
  customerId: string;
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

// ─── Component ────────────────────────────────────────────────────────────────

const Checkout: React.FC = () => {
  const orderDate = new Date();
  const { t } = useTranslation();
  const { currentLang } = useLangContext();
  const { cartTotalAmount, cartChecker, clearCart, allItems, setSuccessTransItems } = useCart();
  const {
    setClientForm,
    clientForm,
    paymentResponse,
    setPaymentResponse,
    setCurrentCurrency,
    currentCurrency,
    currencyIsAvailable,
  } = usePayment();

  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [isPaymentScriptLoaded, setIsPaymentScriptLoaded] = useState<boolean>(false);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [isFormLocked, setIsFormLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(undefined);
  const [arePoliciesAccepted, setArePoliciesAccepted] = useState<boolean>(false);
  const [hasPoliciesError, setHasPoliciesError] = useState<boolean>(false);

  const onlinePaymentContainerRef = useRef<HTMLDivElement>(null);

  const isRtl = selectedLang(currentLang) === 'ar';

  const checkoutForm = useForm<CheckoutFormValues>({
    defaultValues: {
      firstName: clientForm?.FirstName ?? '',
      lastName: clientForm?.LastName ?? '',
      email: clientForm?.Email ?? '',
      phone: clientForm?.Phone ?? '',
      city: clientForm?.City ?? '',
      address: clientForm?.Address ?? '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = checkoutForm;

  // ── Responsive breakpoint ────────────────────────────────────────────────────

  useLayoutEffect(() => {
    const checkMobileBreakpoint = () => {
      setIsMobileView(window.innerWidth <= 800);
    };
    checkMobileBreakpoint();
    window.addEventListener('resize', checkMobileBreakpoint);
    return () => window.removeEventListener('resize', checkMobileBreakpoint);
  }, []);

  // ── Load YouCan Pay script ────────────────────────────────────────────────────

  useEffect(() => {
    if (isPaymentScriptLoaded) return;
    const script = document.createElement('script');
    script.src = 'https://youcanpay.com/js/ycpay.js';
    script.async = true;
    script.onload = () => setIsPaymentScriptLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ── Render YouCan Pay form once token is available ───────────────────────────

  useEffect(() => {
    if (!isPaymentScriptLoaded || !paymentToken) return;

    const ycPay = new YCPay('pub_sandbox_1bfc0387-7aea-49ab-b51e-930e5', {
      locale: selectedLang(currentLang),
      isSandbox: true,
      errorContainer: '#payment-error-container',
      formContainer: '#payment-form-container',
      token: paymentToken,
    });

    ycPay.renderCreditCardForm('default');
    setIsPaymentScriptLoaded(false);

    const payButton = document.getElementById('pay-now-btn');
    if (payButton && selectedPaymentMethod === 'online') {
      payButton.addEventListener('click', () => {
        ycPay.pay(paymentToken).then(handlePaymentSuccess).catch(handlePaymentError);
      });
    }
  }, [paymentToken]);

  // ── Form submission: save client info ────────────────────────────────────────

  const handleFormSubmit = async () => {
    if (!arePoliciesAccepted) {
      setHasPoliciesError(true);
      toast.error(t('footer.policiesNotAccepted'), {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: true,
        theme: 'colored',
        transition: Zoom,
      });
      return;
    }

    setHasPoliciesError(false);

    const clientCoords: clientData = {
      FirstName: getValues('firstName'),
      LastName: getValues('lastName'),
      Email: getValues('email'),
      Phone: getValues('phone'),
      City: getValues('city'),
      Address: getValues('address'),
      Amount: cartTotalAmount,
      Currency: 'MAD',
    };

    setClientForm(clientCoords);
    setIsFormLocked(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // ── Online payment: fetch token ───────────────────────────────────────────────

  const handleOnlinePaymentSelect = async () => {
    showOnlinePaymentForm();

    if (!clientForm || paymentToken) return;

    try {
      const tokenParams = {
        amount: clientForm.Amount,
        currency: 'MAD',
        customer_ip: '10.25.28.35',
        success_url: 'https://google.com/',
        error_url: 'https://youtube.com/',
      };
      const customer = {
        first_name: clientForm.FirstName,
        last_name: clientForm.LastName,
        address: clientForm.Address,
        zip_code: '',
        city: clientForm.City,
        state: '',
        country_code: 'MA',
        phone: clientForm.Phone,
        email: clientForm.Email,
      };

      const response = await connecter.post('api/payment/token/get', { tokenParams, customer });
      setOrderId(response.data.order_id);
      setPaymentToken(response.data.token);
    } catch (err) {
      console.error('Token fetch failed:', err);
    }
  };

  // ── YouCan Pay callbacks ──────────────────────────────────────────────────────

  const handlePaymentSuccess = async (response: any) => {
    setPaymentToken(null);
    const res = response.response;
    setPaymentResponse({
      code: res.code,
      amount: clientForm?.Amount,
      currency: clientForm?.Currency,
      transaction_id: res.transaction_id,
      message: res.message,
      success: res.success,
      order_id: res.order_id,
      date: orderDate.toUTCString(),
      isOnlinePayment: true,
    });
    await processPayment(res.transaction_id, orderDate.toUTCString());
  };

  const handlePaymentError = (response: any) => {
    console.error('Payment error:', response);
    showToast(response, 'error');
    window.location.reload();
  };

  // ── Core payment processing ───────────────────────────────────────────────────

  const processPayment = async (transactionId: string, date: string) => {
    try {
      setIsLoading(true);
      window.scrollTo(0, 0);

      const isOnlinePayment = selectedPaymentMethod === 'online';

      const payload = isOnlinePayment
        ? { items: allItems, orderId, transaction_id: transactionId, date, onlinePayment: true }
        : { items: allItems, date, onlinePayment: false, transaction_id: transactionId, client: clientForm };

      const response = await connecter.post('api/payment/handle/', payload);
      setSuccessTransItems(response.data.ordered_products ?? []);

      if (!isOnlinePayment) {
        const cashPaymentResponse: PaymentResponse = {
          order_id: response.data.paymentResponse.order_id,
          success: true,
          transaction_id: transactionId,
          amount: response.data.paymentResponse.amount,
          currency: response.data.paymentResponse.currency,
          date,
          isOnlinePayment: false,
          code: '',
          message: '',
        };
        setPaymentResponse(cashPaymentResponse);
      }

      const invoicePdf = (await createInvoice(paymentResponse, clientForm)).doc;
      const invoiceFileName = `${clientForm?.FirstName}_${clientForm?.LastName}`;
      const invoiceFile = new File(
        [invoicePdf.buffer as ArrayBuffer],
        `${invoiceFileName}.pdf`,
        { type: 'application/pdf' }
      );

      await sendEmail(clientForm, invoiceFile, 'Invoice', 'Here is your Invoice');
      clearCart();
      goTo('/TransactionSuccess');
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Payment method UI toggles ─────────────────────────────────────────────────

  const showOnlinePaymentForm = () => {
    if (onlinePaymentContainerRef.current) {
      onlinePaymentContainerRef.current.style.display = 'block';
    }
    setSelectedPaymentMethod('online');
    window.scrollBy({ top: 300, behavior: 'smooth' });
  };

  const selectCashOnDelivery = () => {
    if (onlinePaymentContainerRef.current) {
      onlinePaymentContainerRef.current.style.display = 'none';
    }
    setSelectedPaymentMethod('cod');
    setPaymentToken(null);
  };

  const handlePayNowClick = () => {
    if (selectedPaymentMethod === 'cod') {
      processPayment('COD', orderDate.toUTCString());
    } else if (!selectedPaymentMethod) {
      toast.error(t('payment.choose'), {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: true,
        theme: 'colored',
        transition: Zoom,
      });
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────────

  const validatePhoneNumber = (value: string): true | string => {
    const parsed = parsePhoneNumberFromString(value, 'MA');
    if (parsed && isValidPhoneNumber(value, 'MA')) return true;
    return t('form.phone.invalidFormat') ?? 'Enter a valid phone number: 06.., 07.. or +212..';
  };

  // ── Shared form field error renderer ─────────────────────────────────────────

  const renderFieldError = (message: string | undefined) =>
    message ? (
      <span className={`field-error ${isRtl ? 'rtl' : ''}`}>{message}</span>
    ) : null;

  // ── Empty cart guard ──────────────────────────────────────────────────────────

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

  // ── Main render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Header />
      {isLoading ? (
        <Loading message={t('ui.loading')} />
      ) : (
        <div className="mt-1">
          {/* Top bar */}
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

          {/* Alert banner */}
          <div className={`checkout-alert rounded p-2 ${isRtl ? 'rtl' : ''}`}>
            <AiFillAlert size="1.3em" className="mx-2 checkout-alert__icon" />
            {t('payment.checkoutAlert')}
          </div>

          {/* Form + Payment layout */}
          <div className="checkout-layout">
            {/* Client info form */}
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
                {/* FirstName — uses shared component from constants */}
                <FirstNameInput
                  register={register}
                  errors={errors}
                  isModify={isFormLocked}
                  selectedLang={selectedLang}
                  currentLang={currentLang}
                  t={t}
                />
                <div className="form-field input-group flex-column px-1">
                  <label className={`form-label ${isRtl ? 'rtl' : ''}`}>{t('form.lastName.label')}:</label>
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
                  <label className={`form-label ${isRtl ? 'rtl' : ''}`}>{t('form.email.label')}:</label>
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
                  <label className={`form-label ${isRtl ? 'rtl' : ''}`}>{t('form.phone.label')}:</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaPhone /></span>
                    <input
                      {...register('phone', {
                        required: `${t('form.phone.required')} !`,
                        minLength: { value: 10, message: t('form.phone.minLength') ?? 'Min 10 characters' },
                        validate: validatePhoneNumber,
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
                  <label className={`form-label ${isRtl ? 'rtl' : ''}`}>{t('form.city.label')}:</label>
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
                  <label className={`form-label ${isRtl ? 'rtl' : ''}`}>{t('form.address.label')}:</label>
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
                onClick={() => setIsFormLocked(false)}
                disabled={!isFormLocked}
              >
                {t('form.modify')}
              </button>
            </form>

            {/* Payment section */}
            <div className="checkout-payment-panel d-flex flex-column mb-5">
              <div
                className={`payment-gateway card shadow p-2 mt-2 ${isClientDataComplete(clientForm) && isFormLocked ? '' : 'is-disabled'}`}
              >
                <div className="payment-gateway__title fs-3">
                  <FaMoneyBillTransfer className="mx-3" /> {t('payment.portal')}
                </div>
                <hr />

                {/* COD */}
                <button
                  className={`payment-method-btn payment-method-btn--cod rounded my-3 ${isRtl ? 'rtl' : ''} ${selectedPaymentMethod === 'cod' ? 'is-selected' : ''}`}
                  onClick={selectCashOnDelivery}
                >
                  <HiOutlineCash className="mx-2" /> {t('payment.cod')}
                </button>

                {/* Online */}
                <button
                  disabled={!IS_ONLINE_PAYMENT_ENABLED}
                  className={`payment-method-btn payment-method-btn--online rounded my-3 ${isRtl ? 'rtl' : ''} ${!IS_ONLINE_PAYMENT_ENABLED ? 'is-disabled' : ''} ${selectedPaymentMethod === 'online' ? 'is-selected' : ''}`}
                  onClick={handleOnlinePaymentSelect}
                >
                  <FaCreditCard className="mx-3" /> {t('payment.creditCard')}
                </button>

                <div id="payment-form-container" ref={onlinePaymentContainerRef} className="mb-2" />

                {/* Gateway brand */}
                <div className="payment-gateway__brand d-flex justify-content-end p-2">
                  <span className="text-muted"><i>by</i></span>
                  <div className="payment-gateway__brand-logo">
                    <img src="https://youcanpay.com/images/ycpay-logo.svg" alt="YouCan Pay" />
                  </div>
                </div>

                {/* Selected method display */}
                <div className={`payment-gateway__selection fw-bold fs-6 ${isRtl ? 'rtl' : ''}`}>
                  {t('payment.chosen')}: {
                    selectedPaymentMethod === undefined
                      ? t('payment.notChosen')
                      : selectedPaymentMethod === 'online'
                        ? t('payment.creditCard')
                        : t('payment.cod')
                  }
                </div>
              </div>

              {/* Pay now button */}
              <button
                id="pay-now-btn"
                className={`pay-now-btn rounded mt-2 ${isClientDataComplete(clientForm) && isFormLocked ? '' : 'is-disabled'}`}
                onClick={handlePayNowClick}
              >
                {t('payment.pay')}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Checkout