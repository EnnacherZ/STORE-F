import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePayment } from '../contexts/PaymentContext';
import Header from './Header';
import Footer from './Footer';

// ─── Error type classification ────────────────────────────────────────────────

type FailureCategory =
  | 'cancelled'
  | 'insufficient_funds'
  | 'card_declined'
  | 'card_expired'
  | 'auth_failed'
  | 'timeout'
  | 'generic';

interface ErrorProfile {
  category:    FailureCategory;
  icon:        string;
  accentColor: string;
  bgColor:     string;
  badgeColor:  string;
  canRetry:    boolean;
}

const classifyFailure = (code?: string, message?: string): FailureCategory => {
  const raw = `${code ?? ''} ${message ?? ''}`.toLowerCase();

  if (/cancel|annul|abandon/.test(raw))                              return 'cancelled';
  if (/insufficient|fund|solde|balance/.test(raw))                   return 'insufficient_funds';
  if (/expir/.test(raw))                                             return 'card_expired';
  if (/3ds|secure|authenticat|3d/.test(raw))                         return 'auth_failed';
  if (/timeout|time.?out|délai|expired.*token|session/.test(raw))    return 'timeout';
  if (/declin|refus|reject|refusé/.test(raw))                        return 'card_declined';
  return 'generic';
};

const ERROR_PROFILES: Record<FailureCategory, ErrorProfile> = {
  cancelled: {
    category:    'cancelled',
    icon:        '🚫',
    accentColor: '#5c6bc0',
    bgColor:     '#f3f4ff',
    badgeColor:  '#e8eaf6',
    canRetry:    true,
  },
  insufficient_funds: {
    category:    'insufficient_funds',
    icon:        '💳',
    accentColor: '#e65100',
    bgColor:     '#fff8f3',
    badgeColor:  '#fbe9e7',
    canRetry:    true,
  },
  card_declined: {
    category:    'card_declined',
    icon:        '🚫',
    accentColor: '#c62828',
    bgColor:     '#fff5f5',
    badgeColor:  '#ffebee',
    canRetry:    true,
  },
  card_expired: {
    category:    'card_expired',
    icon:        '📅',
    accentColor: '#f57f17',
    bgColor:     '#fffdf0',
    badgeColor:  '#fff9c4',
    canRetry:    false,
  },
  auth_failed: {
    category:    'auth_failed',
    icon:        '🔐',
    accentColor: '#6a1b9a',
    bgColor:     '#fdf4ff',
    badgeColor:  '#f3e5f5',
    canRetry:    true,
  },
  timeout: {
    category:    'timeout',
    icon:        '⏱️',
    accentColor: '#546e7a',
    bgColor:     '#f7f9fa',
    badgeColor:  '#eceff1',
    canRetry:    true,
  },
  generic: {
    category:    'generic',
    icon:        '❌',
    accentColor: '#b71c1c',
    bgColor:     '#fff5f5',
    badgeColor:  '#ffebee',
    canRetry:    true,
  },
};

// ─── Reason hint per category ─────────────────────────────────────────────────

const CATEGORY_HINT_KEYS: Record<FailureCategory, string> = {
  cancelled:          'transaction.failedHintCancelled',
  insufficient_funds: 'transaction.failedHintFunds',
  card_declined:      'transaction.failedHintDeclined',
  card_expired:       'transaction.failedHintExpired',
  auth_failed:        'transaction.failedHintAuth',
  timeout:            'transaction.failedHintTimeout',
  generic:            'transaction.failedSupportNote',
};

// ─── Component ────────────────────────────────────────────────────────────────

const TransactionFailed: React.FC = () => {
  const { paymentResponse } = usePayment();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const category = classifyFailure(paymentResponse?.code, paymentResponse?.message);
  const profile  = ERROR_PROFILES[category];

  const displayMessage = paymentResponse?.message ?? t('transaction.failedDefaultMsg');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');

        .trf-root {
          min-height: 72vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: 'DM Sans', sans-serif;
          background: ${profile.bgColor};
          transition: background .4s;
        }

        .trf-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,.06), 0 8px 40px rgba(0,0,0,.08);
          width: 100%;
          max-width: 500px;
          overflow: hidden;
        }

        .trf-header {
          background: ${profile.bgColor};
          border-bottom: 1px solid ${profile.badgeColor};
          padding: 2.25rem 2rem 1.75rem;
          text-align: center;
        }

        .trf-icon-ring {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: ${profile.badgeColor};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 1rem;
          border: 2px solid ${profile.accentColor}22;
        }

        .trf-category-badge {
          display: inline-block;
          font-size: .7rem;
          font-weight: 600;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: ${profile.accentColor};
          background: ${profile.badgeColor};
          border-radius: 99px;
          padding: .25rem .75rem;
          margin-bottom: .6rem;
        }

        .trf-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: .3rem;
        }

        .trf-message {
          font-size: .9rem;
          color: #64748b;
          line-height: 1.6;
        }

        .trf-body {
          padding: 1.5rem 2rem;
        }

        .trf-hint {
          background: ${profile.bgColor};
          border-left: 3px solid ${profile.accentColor};
          border-radius: 0 10px 10px 0;
          padding: .75rem 1rem;
          font-size: .83rem;
          color: #475569;
          line-height: 1.55;
          margin-bottom: 1.25rem;
        }

        .trf-meta {
          font-family: 'DM Mono', monospace;
          font-size: .78rem;
          color: #94a3b8;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: .85rem 1rem;
          margin-bottom: 1.5rem;
          line-height: 2;
        }

        .trf-meta-row {
          display: flex;
          justify-content: space-between;
          gap: .5rem;
        }

        .trf-meta-key {
          color: #94a3b8;
        }

        .trf-meta-val {
          color: #475569;
          font-weight: 500;
          text-align: right;
          word-break: break-all;
        }

        .trf-divider {
          height: 1px;
          background: #f1f5f9;
          margin: .35rem 0;
        }

        .trf-actions {
          display: flex;
          gap: .75rem;
          flex-wrap: wrap;
        }

        .trf-btn {
          flex: 1;
          min-width: 120px;
          padding: .75rem 1.25rem;
          border-radius: 12px;
          font-size: .92rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-family: 'DM Sans', sans-serif;
          transition: opacity .18s, transform .12s, box-shadow .18s;
          white-space: nowrap;
        }

        .trf-btn:active { transform: scale(.97); }

        .trf-btn-primary {
          background: ${profile.accentColor};
          color: #fff;
          box-shadow: 0 2px 12px ${profile.accentColor}44;
        }

        .trf-btn-primary:hover { opacity: .88; }

        .trf-btn-ghost {
          background: #f1f5f9;
          color: #475569;
        }

        .trf-btn-ghost:hover { background: #e2e8f0; }

        .trf-footer-note {
          text-align: center;
          font-size: .75rem;
          color: #94a3b8;
          margin-top: 1rem;
          line-height: 1.5;
        }

        @media (max-width: 480px) {
          .trf-actions { flex-direction: column; }
          .trf-btn { min-width: unset; }
          .trf-body { padding: 1.25rem 1.25rem; }
          .trf-header { padding: 1.75rem 1.25rem 1.25rem; }
        }
      `}</style>

      <Header />

      <div className="trf-root">
        <div className="trf-card">

          {/* ── Header ── */}
          <div className="trf-header">
            <div className="trf-icon-ring">{profile.icon}</div>
            <div className="trf-category-badge">
              {t(`transaction.failedCategory_${category}`, { defaultValue: t('transaction.failedTitle') })}
            </div>
            <div className="trf-title">{t('transaction.failedTitle')}</div>
            <div className="trf-message">{displayMessage}</div>
          </div>

          {/* ── Body ── */}
          <div className="trf-body">

            {/* Contextual hint per error type */}
            <div className="trf-hint">
              {t(CATEGORY_HINT_KEYS[category], { defaultValue: t('transaction.failedSupportNote') })}
            </div>

            {/* Transaction metadata */}
            {paymentResponse && (
              <div className="trf-meta">
                {paymentResponse.order_id && (
                  <>
                    <div className="trf-meta-row">
                      <span className="trf-meta-key">{t('transaction.failedOrderId')}</span>
                      <span className="trf-meta-val">{paymentResponse.order_id}</span>
                    </div>
                    <div className="trf-divider" />
                  </>
                )}
                {paymentResponse.transaction_id && (
                  <>
                    <div className="trf-meta-row">
                      <span className="trf-meta-key">{t('transaction.failedTransactionId')}</span>
                      <span className="trf-meta-val">{paymentResponse.transaction_id}</span>
                    </div>
                    <div className="trf-divider" />
                  </>
                )}
                {paymentResponse.code && (
                  <div className="trf-meta-row">
                    <span className="trf-meta-key">{t('transaction.failedErrorCode')}</span>
                    <span className="trf-meta-val">{paymentResponse.code}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="trf-actions">
              <button
                className="trf-btn trf-btn-ghost"
                onClick={() => navigate('/')}
              >
                {t('transaction.failedGoHome')}
              </button>

              {profile.canRetry && (
                <button
                  className="trf-btn trf-btn-primary"
                  onClick={() => navigate('/checkout')}
                >
                  {t('transaction.failedTryAgain')}
                </button>
              )}
            </div>

            <div className="trf-footer-note">
              {t('transaction.failedSupportNote')}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TransactionFailed;
