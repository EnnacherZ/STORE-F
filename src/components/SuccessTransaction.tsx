import React, { useEffect, useMemo, useState } from 'react';
import storeLogo from '../assets/FIRDAOUS STORE.png';
import '../styles/SuccessTransaction.css';
import { Link } from 'react-router-dom';
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
import createInvoice from '../contexts/CreateInvoice';
import { connecter } from '../server/connecter';

// ─── Component ────────────────────────────────────────────────────────────────

const SuccessTransaction: React.FC = () => {
  const { currentLang }                                    = useLangContext();
  const { paymentResponse, clientForm, setPaymentResponse } = usePayment();
  const { successTransItems, setSuccessTransItems, clearCart } = useCart();
  const { t }                                              = useTranslation();

  const [invoiceUrl,       setInvoiceUrl]       = useState<string | undefined>();
  const [isOrderExpanded,  setIsOrderExpanded]  = useState<boolean>(false);
  const [isProcessing,     setIsProcessing]     = useState<boolean>(false);
  const [errorMessage,     setErrorMessage]     = useState<string | undefined>();

  const isRtl = selectedLang(currentLang) === 'ar';

  const invoiceFileName = useMemo(
    () => `${clientForm?.FirstName}_${clientForm?.LastName}`,
    [clientForm]
  );

  // ── On mount: detect online payment callback from YouCanPay URL params ───────
  //
  // YouCanPay redirects to success_url with query params like:
  //   ?payment_status=success&transaction_id=xxx&order_id=yyy
  //
  // If paymentResponse is already set (COD flow), skip this entirely.
  // If it's not set, we're in the online payment callback — call handle_payment.

  useEffect(() => {
    // COD flow: paymentResponse already set by Checkout → just generate invoice
    if (paymentResponse) {
      generateInvoice(paymentResponse);
      return;
    }

    // Online flow: page reloaded after YouCanPay redirect — read URL params
    const params        = new URLSearchParams(window.location.search);
    const transactionId = params.get('transaction_id');
    const orderId       = params.get('order_id');
    const status        = params.get('payment_status'); // YouCanPay sends this

    if (!transactionId || !orderId) {
      setErrorMessage('Missing payment information. Please contact support.');
      return;
    }

    if (status && status !== 'success') {
      setErrorMessage('Payment was not completed successfully.');
      return;
    }

    handleOnlinePayment(transactionId, orderId);
  }, []);

  // ── Call handle_payment for online flow ───────────────────────────────────────

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

      // Populate context with server-confirmed data
      setSuccessTransItems(orderedItems);

      const onlinePaymentResponse: PaymentResponse = {
        order_id        : serverOrderId,
        success         : true,
        transaction_id  : transactionId,
        amount          : serverAmount,   // ← from DB, authoritative
        currency        : serverCurrency,
        date            : new Date().toUTCString(),
        isOnlinePayment : true,
        code            : '',
        message         : '',
      };

      setPaymentResponse(onlinePaymentResponse);

      // Generate and send invoice
      await generateInvoice(onlinePaymentResponse);

      if (clientForm) {
        const invoicePdf  = (await createInvoice(onlinePaymentResponse, clientForm, successTransItems)).doc;
        const invoiceFile = new File(
          [invoicePdf.buffer as ArrayBuffer],
          `${invoiceFileName}.pdf`,
          { type: 'application/pdf' }
        );
        await sendEmail(clientForm, invoiceFile, 'Invoice', 'Here is your Invoice');
      }

      clearCart();

    } catch (error: any) {
      console.error('Online payment handling failed:', error);

      // Order already confirmed by webhook but handle_payment failed —
      // show a soft error rather than a blank page
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
      const invoice = await createInvoice(response, clientForm, successTransItems);
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

  const getItemTotal = (price: number, promo: number, quantity: number) => (price * (1 - promo * 0.01) * quantity).toFixed(2);

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

  // ── Active payment response (may come from context or just been set) ──────────
  const activeResponse = paymentResponse;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <Header />

      <div className={`suc-root ${isRtl ? 'rtl' : 'ltr'}`}>

        {/* ── Hero section ── */}
        <div className="suc-hero">
          <Link to="/home" className="suc-logo-link">
            <div className="suc-logo">
              <img src={storeLogo} alt="Store logo" />
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

        {/* ── Body panels ── */}
        <div className="suc-body">

          {/* ── Transaction details ── */}
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
                  // Always a number from the server now — safe to display
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

          {/* ── Order summary ── */}
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