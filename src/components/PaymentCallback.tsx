import React, { useEffect, useRef, useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';
import { useCart } from '../contexts/CartContext';
import { connecter } from '../server/connecter';
import { goTo, sendEmail, selectedLang } from './constants';
import { useLangContext } from '../contexts/LanguageContext';
import createInvoice from '../contexts/CreateInvoice';
import Header from './Header';
import Footer from './Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

type CallbackStatus =
  | 'loading'
  | 'verifying'
  | 'processing'
  | 'emailing'
  | 'done'
  | 'retry'       // payment failed — offer retry or cancel
  | 'retrying'    // fetching a new payment URL
  | 'cancelling'  // releasing reservation
  | 'error';      // unexpected server crash

interface VerifyResponse {
  verified: boolean;
  status:   'confirmed' | 'pending' | 'failed' | 'error';
  reason?:  string;
}

// ─── Polling config ───────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 6;
const RETRY_DELAYS = [2000, 3000, 4000, 6000, 8000]; // ms after each pending
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { key: 'verifying',  label: 'Verifying',  icon: '🔒' },
  { key: 'processing', label: 'Processing', icon: '📦' },
  { key: 'emailing',   label: 'Invoice',    icon: '✉'  },
  { key: 'done',       label: 'Done',       icon: '✓'  },
] as const;

const STATUS_ORDER: CallbackStatus[] = ['loading', 'verifying', 'processing', 'emailing', 'done'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getQueryParams = (): Record<string, string> => {
  const p = new URLSearchParams(window.location.search);
  const r: Record<string, string> = {};
  p.forEach((v, k) => { r[k] = v; });
  return r;
};

// ─── Progress UI ──────────────────────────────────────────────────────────────

const PaymentProgress: React.FC<{
  status:      CallbackStatus;
  pollAttempt: number;
  isWaiting:   boolean;
}> = ({ status, pollAttempt, isWaiting }) => {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const current      = STEPS.find(s => s.key === status) ?? STEPS[0];
  const showRetry    = status === 'verifying' && pollAttempt > 0;

  const mainLabel = (() => {
    if (status === 'verifying')  return 'Verifying Payment';
    if (status === 'processing') return 'Processing Order';
    if (status === 'emailing')   return 'Sending Invoice';
    if (status === 'done')       return 'All Done!';
    return 'Please wait…';
  })();

  const subLabel = (() => {
    if (status === 'done') return 'Redirecting you now…';
    if (!showRetry)        return 'Confirming with payment gateway…';
    if (isWaiting)         return `Waiting before retry ${pollAttempt + 1} of ${MAX_ATTEMPTS}…`;
    return `Attempt ${pollAttempt + 1} of ${MAX_ATTEMPTS}`;
  })();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap');
        .pcb-wrap{min-height:70vh;display:flex;align-items:center;justify-content:center;padding:2rem;font-family:'DM Sans',sans-serif}
        .pcb-card{background:#fff;border-radius:20px;box-shadow:0 4px 40px rgba(0,0,0,.10);padding:3rem 2.5rem 2.5rem;width:100%;max-width:440px;text-align:center}
        .pcb-ring-wrap{position:relative;width:80px;height:80px;margin:0 auto 1.5rem}
        .pcb-ring{position:absolute;inset:0;border-radius:50%;border:3px solid #e8f5e9;border-top-color:#2e7d32;animation:spin .9s linear infinite}
        .pcb-icon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.8rem}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pcb-title{font-size:1.2rem;font-weight:600;color:#1b2a1e;margin-bottom:.25rem}
        .pcb-sub{font-size:.85rem;color:#6b7c6e;font-family:'DM Mono',monospace;min-height:1.3em}
        .pcb-dots{display:flex;justify-content:center;gap:7px;margin-top:.85rem}
        .pcb-dot{width:9px;height:9px;border-radius:50%;border:1.5px solid #c8e6c9;background:#fff;transition:all .35s}
        .pcb-dot.done{background:#a5d6a7;border-color:#a5d6a7}
        .pcb-dot.live{background:#2e7d32;border-color:#2e7d32;box-shadow:0 0 0 3px rgba(46,125,50,.18)}
        .pcb-dot.wait{background:#fff;border-color:#2e7d32;animation:blink .8s ease-in-out infinite}
        @keyframes blink{0%,100%{opacity:.4}50%{opacity:1}}
        .pcb-track{display:flex;align-items:center;margin:2rem 0 0}
        .pcb-node{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:600;flex-shrink:0;border:2px solid #dee2e6;background:#fff;color:#ced4da;transition:all .4s}
        .pcb-node.dn{background:#2e7d32;border-color:#2e7d32;color:#fff}
        .pcb-node.ac{background:#fff;border-color:#2e7d32;color:#2e7d32;box-shadow:0 0 0 4px rgba(46,125,50,.12)}
        .pcb-edge{flex:1;height:2px;background:#dee2e6;transition:background .4s}
        .pcb-edge.dn{background:#2e7d32}
        .pcb-lbls{display:flex;margin-top:.4rem}
        .pcb-lbl{font-size:.6rem;color:#9aa49b;text-align:center;flex:1;transition:color .3s}
        .pcb-lbl.ac{color:#2e7d32;font-weight:600}
        .pcb-lbl.dn{color:#4caf50}
        .pcb-bar{height:3px;border-radius:99px;margin-top:2rem;background:linear-gradient(90deg,#e8f5e9,#2e7d32,#e8f5e9);background-size:200%;animation:bar 1.6s ease-in-out infinite}
        @keyframes bar{0%{background-position:100%}50%{background-position:0%}100%{background-position:100%}}
      `}</style>
      <div className="pcb-wrap">
        <div className="pcb-card">
          <div className="pcb-ring-wrap">
            <div className="pcb-ring" />
            <div className="pcb-icon" key={status}>{current.icon}</div>
          </div>
          <div className="pcb-title">{mainLabel}</div>
          <div className="pcb-sub" key={`${status}-${pollAttempt}-${isWaiting}`}>{subLabel}</div>
          {showRetry && (
            <div className="pcb-dots">
              {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                const cls = i < pollAttempt ? 'done' : i === pollAttempt ? (isWaiting ? 'wait' : 'live') : '';
                return <div key={i} className={`pcb-dot ${cls}`} />;
              })}
            </div>
          )}
          <div className="pcb-track">
            {STEPS.slice(0, -1).map((step, i) => {
              const idx  = STATUS_ORDER.indexOf(step.key as CallbackStatus);
              const dn   = idx < currentIndex;
              const ac   = idx === currentIndex;
              const last = i === STEPS.length - 2;
              return (
                <React.Fragment key={step.key}>
                  <div className={`pcb-node ${dn ? 'dn' : ac ? 'ac' : ''}`}>{dn ? '✓' : i + 1}</div>
                  {!last && <div className={`pcb-edge ${dn ? 'dn' : ''}`} />}
                </React.Fragment>
              );
            })}
          </div>
          <div className="pcb-lbls">
            {STEPS.slice(0, -1).map((step) => {
              const idx = STATUS_ORDER.indexOf(step.key as CallbackStatus);
              return (
                <span key={step.key} className={`pcb-lbl ${idx < currentIndex ? 'dn' : idx === currentIndex ? 'ac' : ''}`}>
                  {step.label}
                </span>
              );
            })}
          </div>
          <div className="pcb-bar" />
        </div>
      </div>
    </>
  );
};

// ─── Retry Screen ─────────────────────────────────────────────────────────────

const RetryScreen: React.FC<{
  reason:       string;
  transactionId: string;
  orderId:      string;
  isBusy:       boolean;
  onRetry:      () => void;
  onCancel:     () => void;
}> = ({ reason, transactionId, orderId, isBusy, onRetry, onCancel }) => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap');
      .rty-wrap{min-height:70vh;display:flex;align-items:center;justify-content:center;padding:2rem;font-family:'DM Sans',sans-serif}
      .rty-card{background:#fff;border-radius:20px;box-shadow:0 4px 40px rgba(0,0,0,.09);padding:3rem 2.5rem;max-width:460px;width:100%;text-align:center}
      .rty-icon{font-size:2.8rem;margin-bottom:1rem}
      .rty-title{font-size:1.25rem;font-weight:600;color:#b71c1c;margin-bottom:.4rem}
      .rty-reason{font-size:.9rem;color:#555;line-height:1.6;margin-bottom:1.25rem}
      .rty-ids{font-family:'DM Mono',monospace;font-size:.72rem;color:#888;background:#f7f7f7;border-radius:10px;padding:.6rem .9rem;display:inline-block;margin-bottom:1.5rem;line-height:1.8;text-align:left;width:100%;box-sizing:border-box}
      .rty-actions{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap}
      .rty-btn{padding:.7rem 1.75rem;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;border:none;transition:opacity .2s,transform .1s;font-family:'DM Sans',sans-serif}
      .rty-btn:active{transform:scale(.97)}
      .rty-btn:disabled{opacity:.5;cursor:not-allowed}
      .rty-btn-retry{background:#2e7d32;color:#fff}
      .rty-btn-retry:hover:not(:disabled){background:#1b5e20}
      .rty-btn-cancel{background:#f5f5f5;color:#333;border:1px solid #ddd}
      .rty-btn-cancel:hover:not(:disabled){background:#eeeeee}
      .rty-note{font-size:.75rem;color:#9e9e9e;margin-top:1.25rem;line-height:1.5}
      .rty-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:6px}
      @keyframes spin{to{transform:rotate(360deg)}}
    `}</style>
    <div className="rty-wrap">
      <div className="rty-card">
        <div className="rty-icon">⚠️</div>
        <div className="rty-title">Payment could not be confirmed</div>
        <div className="rty-reason">{reason}</div>
        <div className="rty-ids">
          {transactionId && <div>Transaction: {transactionId}</div>}
          <div>Order: {orderId}</div>
        </div>
        <div className="rty-actions">
          <button
            className="rty-btn rty-btn-retry"
            onClick={onRetry}
            disabled={isBusy}
          >
            {isBusy
              ? <><span className="rty-spinner" />Please wait…</>
              : '↩ Try Again'}
          </button>
          <button
            className="rty-btn rty-btn-cancel"
            onClick={onCancel}
            disabled={isBusy}
          >
            Cancel order
          </button>
        </div>
        <div className="rty-note">
          Your reserved items are still held. Retrying will take you back to the
          payment page without creating a new order.
        </div>
      </div>
    </div>
  </>
);

// ─── Error UI (unrecoverable) ─────────────────────────────────────────────────

const ErrorUI: React.FC<{ message: string; transactionId: string }> = ({ message, transactionId }) => (
  <>
    <style>{`
      .err-wrap{min-height:60vh;display:flex;align-items:center;justify-content:center;padding:2rem;font-family:'DM Sans',sans-serif}
      .err-card{background:#fff;border-radius:20px;box-shadow:0 4px 40px rgba(0,0,0,.09);padding:3rem 2.5rem;max-width:480px;width:100%;text-align:center}
      .err-icon{font-size:3rem;margin-bottom:1rem}
      .err-title{font-size:1.3rem;font-weight:700;color:#b71c1c;margin-bottom:.5rem}
      .err-msg{color:#555;margin-bottom:1.25rem;line-height:1.6}
      .err-tid{font-family:'DM Mono',monospace;font-size:.78rem;color:#888;background:#f5f5f5;border-radius:8px;padding:.5rem .75rem;display:inline-block;margin-bottom:1.25rem}
      .err-note{font-size:.8rem;color:#9e9e9e}
    `}</style>
    <div className="err-wrap">
      <div className="err-card">
        <div className="err-icon">🚨</div>
        <div className="err-title">Something went wrong</div>
        <div className="err-msg">{message}</div>
        {transactionId && <div className="err-tid">Transaction ID: {transactionId}</div>}
        <div className="err-note">Please contact our support team with the details above.</div>
      </div>
    </div>
  </>
);

// ─── Component ────────────────────────────────────────────────────────────────

const PaymentCallback: React.FC = () => {
  const { clientForm, setPaymentResponse } = usePayment();
  const { allItems, clearCart, setSuccessTransItems } = useCart();
  const { currentLang } = useLangContext();

  const [status,       setStatus      ] = useState<CallbackStatus>('loading');
  const [pollAttempt,  setPollAttempt ] = useState(0);
  const [isWaiting,    setIsWaiting   ] = useState(false);
  const [isBusy,       setIsBusy      ] = useState(false);   // retry/cancel in-flight
  const [errorMsg,     setErrorMsg    ] = useState('');
  const [failReason,   setFailReason  ] = useState('');
  const [txId,         setTxId        ] = useState('');
  const [orderId,      setOrderId     ] = useState('');

  const hasRun = useRef(false);

  // ── Core flow (runs once on mount) ──────────────────────────────────────────
  useEffect(() => {
    const run = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      const params      = getQueryParams();
      const transaction = params['transaction_id'] ?? '';
      const isSuccess   = params['is_success'] === '1' || params['success'] === '1';
      const oid         = params['order_id']    ?? '';
      const code        = params['code']         ?? '';
      const failMsg     = params['message']      ?? 'Payment failed.';
      const date        = new Date().toUTCString();

      setTxId(transaction);
      setOrderId(oid);

      // ── YCPay already flagged failure in the redirect URL ──────────────────
      if (!isSuccess) {
        setPaymentResponse({
          transaction_id: transaction, order_id: oid, code,
          success: false, message: failMsg,
          amount: clientForm?.Amount, currency: clientForm?.Currency,
          date, isOnlinePayment: true,
        });
        setFailReason(failMsg);
        setStatus('retry');
        return;
      }

      // ── Poll verify until confirmed, hard-failed, or timed out ────────────
      try {
        setStatus('verifying');
        let verified    = false;
        let hardFailure = false;
        let failureMsg  = '';

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          setPollAttempt(attempt);
          setIsWaiting(false);

          console.log(`[verify] attempt ${attempt + 1}/${MAX_ATTEMPTS}`);
          const res  = await connecter.post('api/payment/verify/', { transaction_id: transaction, order_id: oid });
          const data = res.data as VerifyResponse;
          console.log(`[verify] response:`, JSON.stringify(data));

          if (data.status === 'confirmed' || data.verified === true) { verified = true; break; }
          if (data.status === 'pending') {
            const delayMs = RETRY_DELAYS[attempt] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1];
            setIsWaiting(true);
            await sleep(delayMs);
            continue;
          }
          // 'failed' or 'error' — hard stop
          hardFailure = true;
          failureMsg  = data.reason ?? 'Payment could not be verified.';
          break;
        }

        if (!verified) {
          const msg = hardFailure
            ? failureMsg
            : 'We could not confirm your payment in time. You can try again or contact support.';
          setPaymentResponse({
            transaction_id: transaction, order_id: oid, code,
            success: false, message: msg,
            amount: clientForm?.Amount, currency: clientForm?.Currency,
            date, isOnlinePayment: true,
          });
          setFailReason(msg);
          setStatus('retry');   // ← offer retry instead of redirect to /failed
          return;
        }

        // ── Confirmed: process order ──────────────────────────────────────────
        setIsWaiting(false);
        setStatus('processing');
        const response = await connecter.post('api/payment/handle/', {
          items: allItems, orderId: oid,
          transaction_id: transaction,
          date, onlinePayment: true,
        });
        setSuccessTransItems(response.data.ordered_products ?? []);

        const freshResponse = {
          transaction_id: transaction, order_id: oid, code,
          success: true, message: 'Payment successful',
          amount: clientForm?.Amount, currency: clientForm?.Currency,
          date, isOnlinePayment: true,
        };
        setPaymentResponse(freshResponse);

        setStatus('emailing');
        const invoicePdf      = (await createInvoice(freshResponse, clientForm)).doc;
        const invoiceFileName = `${clientForm?.FirstName}_${clientForm?.LastName}`;
        const invoiceFile     = new File(
          [invoicePdf.buffer as ArrayBuffer],
          `${invoiceFileName}.pdf`,
          { type: 'application/pdf' }
        );
        await sendEmail(clientForm, invoiceFile, 'Invoice', 'Here is your Invoice');

        setStatus('done');
        clearCart();
        await sleep(800);
        goTo('/transaction/success');

      } catch (err) {
        console.error('[PaymentCallback] error:', err);
        setStatus('error');
        setErrorMsg('Payment was received but we could not confirm your order. Please contact support.');
      }
    };

    run();
  }, []);

  // ── Retry handler ────────────────────────────────────────────────────────
  const handleRetry = async () => {
    if (isBusy) return;
    setIsBusy(true);
    setStatus('retrying');

    try {
      const response = await connecter.post('api/payment/url/retry/', {
        order_id: orderId,
        tokenParams: {
          success_url: `${window.location.origin}/payment/success`,
          error_url  : `${window.location.origin}/payment/error`,
          lang       : selectedLang(currentLang),
        },
      });

      // Redirect — hasRun guard will allow the new PaymentCallback to run
      hasRun.current = false;
      window.location.href = response.data.payment_url;

    } catch (err) {
      console.error('[retry] failed:', err);
      setIsBusy(false);
      setStatus('retry');
    }
  };

  // ── Cancel handler ───────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (isBusy) return;
    setIsBusy(true);
    setStatus('cancelling');

    try {
      await connecter.post('api/payment/cancel/', { order_id: orderId });
    } catch (err) {
      console.error('[cancel] failed:', err);
      // Even if the request fails, navigate the user away
    } finally {
      goTo('/transaction/failed');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const renderContent = () => {
    if (status === 'error') {
      return <ErrorUI message={errorMsg} transactionId={txId} />;
    }
    if (status === 'retry') {
      return (
        <RetryScreen
          reason={failReason}
          transactionId={txId}
          orderId={orderId}
          isBusy={isBusy}
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
      );
    }
    // retrying / cancelling → reuse progress spinner with a simple message
    if (status === 'retrying' || status === 'cancelling') {
      return (
        <PaymentProgress
          status="verifying"
          pollAttempt={0}
          isWaiting={false}
        />
      );
    }
    return <PaymentProgress status={status} pollAttempt={pollAttempt} isWaiting={isWaiting} />;
  };

  return (
    <>
      <Header />
      {renderContent()}
      <Footer />
    </>
  );
};

export default PaymentCallback;