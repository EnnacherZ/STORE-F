import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/SuccessTransaction.css';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { GrTransaction } from 'react-icons/gr';
import { GiTicket } from 'react-icons/gi';
import Footer from './Footer';
import { BsBagCheckFill } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Loading from './loading';
import { useLangContext } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { selectedLang, sendEmail } from './constants';
import { usePayment, PaymentResponse } from '../contexts/PaymentContext';
import { useStoreConfig } from '../config/StoreConfigContext';
import { connecter } from '../server/connecter';
import { getLineTotal } from '../utils/pricing';

const FAILURE_ROUTE = '/Transaction/Failed'; // ⚠️ update to match your actual route
const MAX_VERIFY_ATTEMPTS = 10;
const VERIFY_INTERVAL_MS  = 2000;

// ─── Component ────────────────────────────────────────────────────────────────

const SuccessTransaction: React.FC = () => {
  const { currentLang }                                    = useLangContext();
  const { paymentResponse, clientForm, setPaymentResponse } = usePayment();
  const { successTransItems, setSuccessTransItems, clearCart } = useCart();
  const { t }                                              = useTranslation();
  const navigate                                           = useNavigate();
  const { logo, generateInvoice: generateInvoicePdf }      = useStoreConfig();

  const [invoiceUrl,       setInvoiceUrl]       = useState<string | undefined>();
  const [isOrderExpanded,  setIsOrderExpanded]  = useState<boolean>(false);
  const [isProcessing,     setIsProcessing]     = useState<boolean>(false);
  const [errorMessage,     setErrorMessage]     = useState<string | undefined>();

  // Guards against React StrictMode's mount→unmount→mount double-invoke
  // (and any other accidental re-entry within the same component instance)
  // calling handle_payment / pollAndFinalize twice. The real safety net
  // against a genuine full page refresh is the backend idempotency fix
  // on handle_payment — this ref just avoids a wasted extra round trip.
  const hasFinalizedRef = useRef(false);

  const isRtl = selectedLang(currentLang) === 'ar';

  const invoiceFileName = useMemo(
    () => `${clientForm?.FirstName}_${clientForm?.LastName}`,
    [clientForm]
  );

  // ── On mount: decide COD vs online flow explicitly by URL params ─────────────
  //
  // We do NOT infer the flow from paymentResponse truthiness — that value can
  // be stale (leftover from a previous transaction). The presence of
  // transaction_id + order_id in the URL is what YouCanPay's success_url
  // actually carries for the online flow; its absence means COD.

  useEffect(() => {
    const params        = new URLSearchParams(window.location.search);
    const transactionId = params.get('transaction_id');
    const orderId       = params.get('order_id');
    const isOnlineReturn = Boolean(transactionId && orderId);

    if (!isOnlineReturn) {
      // COD flow: paymentResponse was set synchronously by Checkout right
      // before navigating here. If it's genuinely missing or doesn't
      // indicate success, this page was reached incorrectly.
      if (paymentResponse?.success) {
        generateInvoice(paymentResponse);
      } else {
        setErrorMessage('No transaction to display.');
      }
      return;
    }

    // If context already reflects THIS exact order as successful (e.g. user
    // navigated back/forward within the same completed transaction), skip
    // re-verifying and re-calling handle_payment entirely.
    if (paymentResponse?.success && paymentResponse.order_id === orderId) {
      generateInvoice(paymentResponse);
      return;
    }

    if (hasFinalizedRef.current) return;
    hasFinalizedRef.current = true;

    pollAndFinalize(transactionId as string, orderId as string);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Poll handle_verify, then finalize via handle_payment once confirmed ──────

  const pollAndFinalize = async (transactionId: string, orderId: string, attempt = 1) => {
    setIsProcessing(true);
    try {
      const verifyRes = await connecter.post('api/payment/verify/', {
        transaction_id: transactionId,
        order_id: orderId,
      });

      const { status } = verifyRes.data;

      if (status === 'pending') {
        if (attempt >= MAX_VERIFY_ATTEMPTS) {
          setIsProcessing(false);
          setErrorMessage('Payment confirmation is taking longer than expected. Please refresh in a moment.');
          return;
        }
        setTimeout(() => pollAndFinalize(transactionId, orderId, attempt + 1), VERIFY_INTERVAL_MS);
        return;
      }

      if (status === 'failed') {
        setIsProcessing(false);
        navigate(
          `${FAILURE_ROUTE}?order_id=${encodeURIComponent(orderId)}&transaction_id=${encodeURIComponent(transactionId)}&code=payment_failed`,
          { replace: true }
        );
        return;
      }

      if (status === 'error') {
        setIsProcessing(false);
        setErrorMessage('Something went wrong verifying your payment. Please contact support.');
        return;
      }

      // status === 'confirmed'
      await handleOnlinePayment(transactionId, orderId);
    } catch (error) {
      console.error('Payment verification failed:', error);
      setIsProcessing(false);
      setErrorMessage('Something went wrong verifying your payment. Please contact support.');
    }
  };

  // ── Call handle_payment for online flow ───────────────────────────────────────
  // Safe to call more than once for the same order — handle_payment on the
  // backend is idempotent and always returns the full item list.

  const handleOnlinePayment = async (transactionId: string, orderId: string) => {
    setIsProcessing(true);
    try {
      const response = await connecter.post('api/payment/handle/', {
        transaction_id: transactionId,
        orderId       : orderId,
        onlinePayment : true,
        date          : new Date().toUTCString(),
      });

      const serverAmount   = response.data.paymentResponse.amount;
      const serverCurrency = response.data.paymentResponse.currency;
      const serverOrderId  = response.data.paymentResponse.order_id;
      const orderedItems   = response.data.ordered_products ?? [];

      setSuccessTransItems(orderedItems);

      const onlinePaymentResponse: PaymentResponse = {
        order_id        : serverOrderId,
        success         : true,
        transaction_id  : transactionId,
        amount          : serverAmount,
        currency        : serverCurrency,
        date            : new Date().toUTCString(),
        isOnlinePayment : true,
        code            : '',
        message         : '',
      };

      setPaymentResponse(onlinePaymentResponse);

      await generateInvoice(onlinePaymentResponse);

      if (clientForm) {
        try {
          const invoicePdf  = (await generateInvoicePdf(onlinePaymentResponse, clientForm, orderedItems)).doc;
          const invoiceFile = new File(
            [invoicePdf.buffer as ArrayBuffer],
            `${invoiceFileName}.pdf`,
            { type: 'application/pdf' }
          );
          await sendEmail(clientForm, invoiceFile, 'Invoice', 'Here is your Invoice');
        } catch (emailErr) {
          // Don't fail the whole success page just because the email step
          // failed — the payment itself succeeded and items are already set.
          console.error('Invoice email failed:', emailErr);
        }
      }

      clearCart();
      // Note: paymentResponse is intentionally NOT cleared here — this render
      // still displays amount/currency/order_id from it. It gets cleared the
      // next time Checkout mounts.

    } catch (error: any) {
      console.error('Online payment handling failed:', error);

      const isOrderNotFound = error?.response?.status === 404;
      setErrorMessage(
        isOrderNotFound
          ? 'Order not found or not yet confirmed. Please wait a moment and refresh.'
          : 'Something went wrong finalizing your order. Please contact support.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Generate invoice PDF ──────────────────────────────────────────────────────

  const generateInvoice = async (response: PaymentResponse) => {
    if (!clientForm) return;
    try {
      const invoice = await generateInvoicePdf(response, clientForm, successTransItems);
      setInvoiceUrl(invoice.url);
    } catch (err) {
      console.error('Invoice generation failed:', err);
    }
  };

  // ── Loading / error guards ────────────────────────────────────────────────────

  if (isProcessing) {
    return <Loading message={t('ui.loading')} />;
  }

  if (errorMessage) {
    return (
      <>
        <Header />
        <div style={{
          display       : 'flex',
          flexDirection : 'column',
          alignItems    : 'center',
          justifyContent: 'center',
          minHeight     : '60vh',
          gap           : '16px',
          padding       : '2rem',
          textAlign     : 'center',
        }}>
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <h2 style={{ color: '#c0392b' }}>{errorMessage}</h2>
          <Link to="/" style={{ color: '#1e7fff', textDecoration: 'underline' }}>
            Return to home
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (!invoiceUrl) {
    return <Loading message={t('ui.loading')} />;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const getItemTotal = (price: number, promo: number, quantity: number) => getLineTotal(price, promo, quantity).toFixed(2);

  const visibleItems = isOrderExpanded
    ? successTransItems
    : successTransItems?.slice(0, 2);

  // ── Download button ───────────────────────────────────────────────────────────

  const renderDownloadTicketButton = () => (
    <a href={invoiceUrl} download={`${invoiceFileName}.pdf`} className="suc-download-link">
      <button className="suc-download-btn">
        <GiTicket size={18} />
        <span>{t('transaction.downloadTicket')}</span>
      </button>
    </a>
  );

  const activeResponse = paymentResponse;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <Header />

      <div className={`suc-root ${isRtl ? 'rtl' : 'ltr'}`}>

        <div className="suc-hero">
          <Link to="/home" className="suc-logo-link">
            <div className="suc-logo">
              <img src={logo.standard} alt="Store logo" />
            </div>
          </Link>

          <div className="suc-check-ring">
            <FontAwesomeIcon icon={faCircleCheck} className="suc-check-icon" beat />
          </div>

          <h1 className="suc-hero-title">{t('transaction.success')}</h1>
          <p  className="suc-hero-sub">{t('transaction.thank')}</p>

          <div className="suc-hero-download">
            {renderDownloadTicketButton()}
          </div>
        </div>

        <div className="suc-body">

          <div className={`suc-panel suc-panel--details ${isRtl ? 'rtl' : ''}`}>
            <div className="suc-panel-header">
              <GrTransaction size={18} />
              <span>{t('transaction.info')}</span>
            </div>

            <ul className="suc-detail-list">
              {[
                {
                  label: t('transaction.currency'),
                  value: activeResponse?.currency,
                },
                {
                  label: t('transaction.amount'),
                  value: activeResponse?.amount !== undefined
                    ? `${Number(activeResponse.amount).toFixed(2)}`
                    : '—',
                },
                {
                  label: t('order.orderId'),
                  value: activeResponse?.order_id,
                },
                {
                  label: t('transaction.transactionId'),
                  value: activeResponse?.isOnlinePayment
                    ? activeResponse?.transaction_id
                    : t('payment.cod'),
                },
              ].map(({ label, value }, index) => (
                <li key={index} className="suc-detail-item">
                  <span className="suc-detail-label">{label}</span>
                  <span className="suc-detail-value">{value}</span>
                </li>
              ))}
            </ul>

            <div className="suc-panel-footer">
              {renderDownloadTicketButton()}
            </div>
          </div>

          <div className={`suc-panel suc-panel--order ${isRtl ? 'rtl' : ''}`}>
            <div className="suc-panel-header">
              <BsBagCheckFill size={18} />
              <span>{t('order.yourOrder')}</span>
            </div>

            <div className="suc-items">
              {visibleItems?.map((item, index) => (
                <div key={index} className="suc-item">
                  <div className="suc-item-img">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="suc-item-info">
                    <div className="suc-item-ref">{item.category} {item.ref}</div>
                    <div className="suc-item-name">{item.name}</div>
                    <div className="suc-item-size">
                      {t('product.size')}: <strong>{item.size}</strong>
                    </div>
                  </div>

                  <div className="suc-item-pricing">
                    <div className="suc-item-total">
                      {getItemTotal(item.price, item.promo, item.quantity)} {t('product.currency')}
                    </div>
                    <div className="suc-item-qty">× {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            {successTransItems && successTransItems.length > 2 && (
              <div className="suc-expand">
                <button
                  className="suc-expand-btn"
                  onClick={() => setIsOrderExpanded((prev) => !prev)}
                >
                  {isOrderExpanded ? t('product.readLess') : t('product.readMore')}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default SuccessTransaction;