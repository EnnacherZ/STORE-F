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

  // ── Download button ───────────────────────────────────────────────────────────

  const renderDownloadTicketButton = () => (
    <a href={invoiceUrl} download={`${invoiceFileName}.pdf`} className="suc-download-link">
      <button className="suc-download-btn">
        <GiTicket size={18} />
        <span>{t('transaction.downloadTicket')}</span>
      </button>
    </a>
  );

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
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="suc-check-icon"
              beat
            />
          </div>

          <h1 className="suc-hero-title">{t('transaction.success')}</h1>
          <p className="suc-hero-sub">{t('transaction.thank')}</p>

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
                    <div className="suc-item-size">{t('product.size')}: <strong>{item.size}</strong></div>
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
