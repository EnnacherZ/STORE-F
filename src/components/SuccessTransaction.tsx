import React, { useEffect, useMemo, useState } from 'react';
import storeLogo from '../assets/FIRDAOUS STORE.png';
import '../styles/SuccessTransaction.css'
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
import { selectedLang } from './constants';
import { usePayment } from '../contexts/PaymentContext';
import createInvoice from '../contexts/CreateInvoice';


// ─── Component ────────────────────────────────────────────────────────────────

const SuccessTransaction: React.FC = () => {
  const { currentLang } = useLangContext();
  const { paymentResponse, clientForm } = usePayment();
  const { successTransItems } = useCart();
  const { t } = useTranslation();

  const [invoiceUrl, setInvoiceUrl] = useState<string>();
  const [isOrderExpanded, setIsOrderExpanded] = useState<boolean>(false);

  const isRtl = selectedLang(currentLang) === 'ar';

  const invoiceFileName = useMemo(
    () => `${clientForm?.FirstName}_${clientForm?.LastName}`,
    [clientForm]
  );

  // ── Generate invoice PDF on mount ────────────────────────────────────────────

  useEffect(() => {
    if (!paymentResponse || !clientForm) return;

    const generateInvoice = async () => {
      const invoice = await createInvoice(paymentResponse, clientForm);
      setInvoiceUrl(invoice.url);
    };

    generateInvoice();
  }, [paymentResponse, clientForm]);

  // ── Loading guard ─────────────────────────────────────────────────────────────

  if (!invoiceUrl) {
    return <Loading message={t('ui.loading')} />;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const getItemTotal = (price: number, promo: number, quantity: number) =>
    (price * (1 - promo * 0.01) * quantity).toFixed(2);

  const visibleItems = isOrderExpanded
    ? successTransItems
    : successTransItems?.slice(0, 2);

  // ── Download link renderer ────────────────────────────────────────────────────

  const renderDownloadTicketButton = () => (
    <a href={invoiceUrl} download={`${invoiceFileName}.pdf`}>
      <button className="invoice-download-btn btn btn-warning fw-bold">
        <GiTicket size={25} /> {t('transaction.downloadTicket')}
      </button>
    </a>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <Header />

      {/* Store logo link */}
      <Link to="/home">
        <div className="success-page__logo-wrapper d-flex justify-content-center">
          <div className="success-page__logo mt-3">
            <img src={storeLogo} alt="Store logo" />
          </div>
        </div>
      </Link>

      {/* Success message */}
      <p className="success-page__message mt-3">{t('transaction.success')}</p>
      <p className="success-page__message mt-1">{t('transaction.thank')}</p>

      {/* Animated check icon */}
      <div className="d-flex justify-content-center my-4">
        <FontAwesomeIcon
          icon={faCircleCheck}
          size="2xl"
          className="success-page__check-icon"
          beat
          style={{ color: '#38d400' }}
        />
      </div>

      {/* Top download button */}
      <div className="d-flex justify-content-center">
        {renderDownloadTicketButton()}
      </div>

      {/* Transaction details + order summary */}
      <div className="success-page__body d-flex">

        {/* Transaction info table */}
        <div className={`transaction-details card shadow mt-3 ${isRtl ? 'rtl' : ''}`}>
          <div className="transaction-details__title fw-bold text-center fs-3 my-1">
            <GrTransaction size={25} className="mx-1" /> {t('transaction.info')}
          </div>
          <hr className="my-2" />
          <ul className="transaction-details__list px-1">
            {[
              { label: t('transaction.currency'), value: paymentResponse?.currency },
              { label: t('transaction.amount'),   value: paymentResponse?.amount },
              { label: t('order.orderId'),         value: paymentResponse?.order_id },
              {
                label: t('transaction.transactionId'),
                value: paymentResponse?.isOnlinePayment
                  ? paymentResponse?.transaction_id
                  : t('payment.cod'),
              },
            ].map(({ label, value }, index) => (
              <li
                key={index}
                className="transaction-details__list-item d-flex justify-content-between align-items-center px-1 my-2"
              >
                <span className="fw-bold text-muted">{label}:</span>
                <span className="fw-bold transaction-details__list-value">{value}</span>
              </li>
            ))}
          </ul>
          <div className="d-flex justify-content-center mb-1">
            {renderDownloadTicketButton()}
          </div>
        </div>

        {/* Ordered items summary */}
        <div className={`order-review card shadow mt-3 ${isRtl ? 'rtl' : ''}`}>
          <div className="order-review__title fw-bold text-center fs-3 p-1">
            <BsBagCheckFill size={25} className="mx-2" /> {t('order.yourOrder')}
          </div>
          <hr className="m-0" />

          {visibleItems?.map((item, index) => (
            <div key={index} className="order-review-item d-flex flex-row justify-content-between my-2 mx-1">
              <div className="order-review-item__image card p-1 rounded m-1">
                <img src={item.image} className="rounded" alt={item.name} />
              </div>
              <div className="order-review-item__name d-flex flex-column align-items-center justify-content-around">
                <div className="fw-bold">{item.category} {item.ref}</div>
                <div className="fw-bold">{item.name}</div>
                <div className="text-muted">{t('product.size')}: {item.size}</div>
              </div>
              <div className="order-review-item__price d-flex flex-column justify-content-around align-items-center mx-1">
                <div className="fw-bold" style={{ color: 'green' }}>
                  {getItemTotal(item.price, item.promo, item.quantity)} {t('product.currency')}
                </div>
                <div className="text-muted">{t('product.quantity')}: {item.quantity}</div>
              </div>
            </div>
          ))}

          {/* Expand / collapse if more than 2 items */}
          {successTransItems && successTransItems.length > 2 && (
            <div className="text-center my-3">
              <button
                className="btn btn-outline-primary border border-2 border-primary fw-bold"
                onClick={() => setIsOrderExpanded((prev) => !prev)}
              >
                {isOrderExpanded ? t('product.readLess') : t('product.readMore')}
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SuccessTransaction;