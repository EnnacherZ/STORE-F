import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { connecter } from "../server/connecter";
import Header from "./Header";
import "../styles/orderTracking.css";
import { useTranslation } from "react-i18next";
import { useLangContext } from "../contexts/LanguageContext";
import { goTo, selectedLang } from "./constants";

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_ATTEMPTS = "AlFirdaousStoreOrderTrackingLimitAttempts";
const LS_RESET    = "AlFirdaousStoreOrderTrackingLimitAttemptsLastReset";
const RESET_MS    = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 3;

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "confirmed" | "delivered" | "failed";

interface OrderedProduct {
  name:         string;
  ref:          string;
  category:     string;
  product_type: string;
  size:         string;
  quantity:     number;
  price:        number;
}

interface OrderData {
  order_id:     string;
  date:         string;
  amount:       number;
  currency:     string;
  is_paid:      string;
  payment_mode: string;
  delivered:    boolean;
  status:       boolean;
  products:     OrderedProduct[];
}

interface ClientData {
  first_name: string;
  last_name:  string;
  city:       string;
}

// ─── Order status pipeline ────────────────────────────────────────────────────
//
// Same dependency logic as the account order history view:
//
//   Placed → Payment → Processing → Delivery
//
//   - A failed online payment halts everything after it.
//   - COD orders settle payment AT delivery, so "payment" is shown done
//     immediately (informational), not blocking the rest.
//   - Processing cannot be current/done while an online payment is pending.
//   - Delivery cannot be current until processing is actually done.
//
// Reuses the same "account.step*" / "account.processing*" translation keys
// as the account page so both surfaces stay in sync with one source of truth.

type StepState = "done" | "current" | "pending" | "error";

interface OrderStep {
  key: "placed" | "payment" | "processing" | "delivery";
  labelKey: string;
  subLabelKey?: string;
  state: StepState;
  icon: string;
}

function getOrderSteps(order: OrderData): OrderStep[] {
  const isCod = order.payment_mode === "cash_on_delivery" || order.payment_mode === "cod";
  const isFailed = order.is_paid === "failed";
  const isConfirmed = order.is_paid === "confirmed";
  const isPendingOnline = order.is_paid === "pending";

  const placed: OrderStep = {
    key: "placed",
    labelKey: "account.stepPlaced",
    state: "done",
    icon: "🧾",
  };

  let paymentState: StepState;
  let paymentSubLabel: string | undefined;
  if (isFailed) {
    paymentState = "error";
    paymentSubLabel = "account.statusFailed";
  } else if (isCod) {
    paymentState = "done";
    paymentSubLabel = "account.codPayment";
  } else if (isConfirmed) {
    paymentState = "done";
    paymentSubLabel = "account.statusConfirmed";
  } else {
    paymentState = "current";
    paymentSubLabel = "account.statusPending";
  }
  const payment: OrderStep = {
    key: "payment",
    labelKey: "account.stepPayment",
    subLabelKey: paymentSubLabel,
    state: paymentState,
    icon: isCod ? "💵" : "💳",
  };

  let processingState: StepState;
  if (isFailed) {
    processingState = "error";
  } else if (isPendingOnline) {
    processingState = "pending";
  } else if (order.status) {
    processingState = "done";
  } else {
    processingState = "current";
  }
  const processing: OrderStep = {
    key: "processing",
    labelKey: "account.stepProcessing",
    subLabelKey: isFailed
      ? undefined
      : order.status ? "account.processingDone" : "account.processingOngoing",
    state: processingState,
    icon: "📦",
  };

  let deliveryState: StepState;
  if (isFailed) {
    deliveryState = "error";
  } else if (order.delivered) {
    deliveryState = "done";
  } else if (processingState === "done") {
    deliveryState = "current";
  } else {
    deliveryState = "pending";
  }
  const delivery: OrderStep = {
    key: "delivery",
    labelKey: "account.stepDelivery",
    subLabelKey: order.delivered ? "account.delivered" : undefined,
    state: deliveryState,
    icon: "🚚",
  };

  return [placed, payment, processing, delivery];
}

function getProgressPercent(steps: OrderStep[]): { percent: number; failed: boolean } {
  if (steps.some(s => s.state === "error")) return { percent: 100, failed: true };
  const doneCount = steps.filter(s => s.state === "done").length;
  const hasCurrent = steps.some(s => s.state === "current");
  const percent = ((doneCount + (hasCurrent ? 0.5 : 0)) / steps.length) * 100;
  return { percent, failed: false };
}

function getHeadlineStatus(steps: OrderStep[], t: (key: string) => string) {
  const payment = steps[1];
  const processing = steps[2];
  const delivery = steps[3];

  if (payment.state === "error")
    return { cls: "ot-badge--failed", icon: "✕", label: t("tracking.failed") };
  if (delivery.state === "done")
    return { cls: "ot-badge--delivered", icon: "✓", label: t("tracking.delivered") };
  if (delivery.state === "current")
    return { cls: "ot-badge--processing", icon: "🚚", label: t("account.outForDelivery") };
  if (processing.state === "done")
    return { cls: "ot-badge--processing", icon: "📦", label: t("account.readyToShip") };
  if (processing.state === "current")
    return { cls: "ot-badge--pending", icon: "⟳", label: t("tracking.processing") };
  return { cls: "ot-badge--pending", icon: "⏳", label: t("tracking.pending") };
}

// ─── Clipboard helper ─────────────────────────────────────────────────────────

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStoredAttempts(): number {
  const raw   = localStorage.getItem(LS_ATTEMPTS);
  const reset = localStorage.getItem(LS_RESET);

  if (reset && Date.now() - parseInt(reset, 10) > RESET_MS) {
    localStorage.setItem(LS_ATTEMPTS, "0");
    localStorage.setItem(LS_RESET, Date.now().toString());
    return 0;
  }

  if (!reset) localStorage.setItem(LS_RESET, Date.now().toString());
  return raw ? JSON.parse(raw) : 0;
}

function bumpAttempts(current: number): number {
  const next = current + 1;
  localStorage.setItem(LS_ATTEMPTS, JSON.stringify(next));
  if (current === 0) localStorage.setItem(LS_RESET, Date.now().toString());
  return next;
}

function isUUIDv4(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

function mockOrder(query: string) {
  const q      = query.trim();
  const date   = new Date().toISOString();
  const status: OrderStatus =
    q.length % 5 === 0 ? "failed"    :
    q.length % 4 === 0 ? "delivered" :
    q.length % 3 === 0 ? "confirmed" : "pending";

  return {
    found: true,
    client: {
      first_name: "Client",
      last_name:  q.slice(0, 6) || "Demo",
      city:       "Casablanca",
    },
    order: {
      order_id:     q,
      date,
      amount:       309.1,
      currency:     "MAD",
      is_paid:
        status === "failed"  ? "failed"    :
        status === "pending" ? "pending"   : "confirmed",
      payment_mode: "online",
      delivered:    status === "delivered",
      status:       status !== "pending",
      products: [
        {
          name:         "Classic Shoes",
          ref:          "7574",
          category:     "Shoes",
          product_type: "classic",
          size:         "46",
          quantity:     1,
          price:        309.1,
        },
      ],
    },
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ steps, t }: { steps: OrderStep[]; t: (key: string) => string }) {
  const headline = getHeadlineStatus(steps, t);
  return (
    <span className={`ot-badge ${headline.cls}`}>
      {headline.icon} {headline.label}
    </span>
  );
}

interface CopyableValueProps {
  value: string;
  copyLabel: string;
  copiedLabel: string;
}

const CopyableValue: React.FC<CopyableValueProps> = ({ value, copyLabel, copiedLabel }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <span className="ot-copyable">
      <span className="ot-copyable__value">{value}</span>
      <button
        type="button"
        className={`ot-copyable__btn ${copied ? "ot-copyable__btn--copied" : ""}`}
        onClick={handleCopy}
        aria-label={copied ? copiedLabel : copyLabel}
        title={copied ? copiedLabel : copyLabel}
      >
        {copied ? "✓" : "📋"}
      </button>
      {copied && <span className="ot-copyable__tooltip">{copiedLabel}</span>}
    </span>
  );
};

interface OrderStepperProps {
  steps: OrderStep[];
  t: (key: string) => string;
}

const OrderStepper: React.FC<OrderStepperProps> = ({ steps, t }) => {
  const { percent, failed } = getProgressPercent(steps);

  return (
    <div className="ot-stepper">
      <div className="ot-progress">
        <div className="ot-progress__labels">
          <span>{t("account.stepPlaced")}</span>
          <span>{t("account.stepDelivery")}</span>
        </div>
        <div className="ot-progress__track">
          <div
            className={`ot-progress__fill ${failed ? "ot-progress__fill--failed" : ""}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="ot-timeline">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div className="ot-timeline__row" key={step.key}>
              <div className="ot-timeline__iconcol">
                <div className={`ot-timeline__circle ot-timeline__circle--${step.state}`}>
                  {step.state === "error" ? "⚠" : step.icon}
                </div>
                {!isLast && (
                  <div className={`ot-timeline__line ot-timeline__line--${step.state === "done" ? "done" : "pending"}`} />
                )}
              </div>
              <div className="ot-timeline__text">
                <span className={`ot-timeline__label ot-timeline__label--${step.state}`}>
                  {t(step.labelKey)}
                </span>
                {step.subLabelKey && (
                  <span className="ot-timeline__sublabel">{t(step.subLabelKey)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const OrderTracker: React.FC = () => {
  const { OrderID }        = useParams<{ OrderID?: string }>();
  const { t }              = useTranslation();
  const { currentLang }    = useLangContext();
  const navigate           = useNavigate();
  const isRtl              = selectedLang(currentLang) === "ar";

  const [query,      setQuery]      = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const [searched,   setSearched]   = useState(false);
  const [error,      setError]      = useState(false);
  const [orderFound, setOrderFound] = useState(false);
  const [client,     setClient]     = useState<ClientData | null>(null);
  const [order,      setOrder]      = useState<OrderData | null>(null);
  const [attempts,   setAttempts]   = useState(() => getStoredAttempts());

  const limitReached = attempts >= MAX_ATTEMPTS;
  const inputRef     = useRef<HTMLInputElement>(null);

  // ── Core search logic ──────────────────────────────────────────────────────
  //
  // `overrideId` lets the useEffect pass the URL param directly, avoiding the
  // stale-closure issue where `query` state hasn't been set yet.
  //
  const handleSearch = useCallback(
    async (overrideId?: string) => {
      const idToSearch = (overrideId ?? query).trim();
      if (!idToSearch || isLoading || limitReached) return;

      // Reject malformed IDs before ever touching the network or the
      // attempts counter — same validation the URL-param path already uses.
      if (!isUUIDv4(idToSearch)) {
        setError(true);
        setSearched(true);
        setOrderFound(false);
        return;
      }

      setIsLoading(true);
      setSearched(false);
      setError(false);
      setOrderFound(false);

      const next = bumpAttempts(attempts);
      setAttempts(next);

      try {
        const response = await connecter.get(
          `api/orders/check?orderID=${encodeURIComponent(idToSearch)}`
        );
        const data = response.data;

        if (data?.found) {
          setOrderFound(true);
          setClient(data.client ?? null);
          setOrder(data.order ?? null);
        } else {
          // Backend explicitly says no such order — this is a real "not
          // found", never fabricate a result for it.
          setOrderFound(false);
        }
      } catch {
        // Network/backend unreachable. In local development only, fall back
        // to a mock so the UI can be built without a live backend running.
        // This must NEVER fire in production — a real user's failed request
        // would otherwise be silently turned into a fake "found" order.
        if (import.meta.env.DEV) {
          const fallback = mockOrder(idToSearch);
          setOrderFound(true);
          setClient(fallback.client);
          setOrder(fallback.order);
        } else {
          setOrderFound(false);
        }
      } finally {
        setIsLoading(false);
        setSearched(true);
      }
    },
    [query, isLoading, limitReached, attempts]
  );

  // ── URL-param auto-search ──────────────────────────────────────────────────
  //
  // Pass OrderID directly to handleSearch so it doesn't depend on `query`
  // state being flushed yet (setState is async).
  //
  useEffect(() => {
    if (!OrderID) return;

    if (!isUUIDv4(OrderID)) {
      setError(true);
      setSearched(true);
      return;
    }

    setQuery(OrderID);
    handleSearch(OrderID); // ← fix: pass value directly, not via state
  // handleSearch is memoised with useCallback; including it avoids stale closure
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [OrderID]);

  // ── Keyboard support ───────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setQuery("");
    setSearched(false);
    setError(false);
    setOrderFound(false);
    setClient(null);
    setOrder(null);
    goTo("/orders/track");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // ── Derived pipeline (computed once per render, shared by badge + stepper) ──

  const steps = order ? getOrderSteps(order) : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`ot-page${isRtl ? " rtl" : ""}`}>
      <Header />

      <div className="ot-title">
        <span>📦</span>
        {t("tracking.title")}
      </div>

      {/* ── Search card (hidden once a result is displayed) ── */}
      {!orderFound && (
        <div className="ot-search-card">
          <div className="ot-search-card__icon">🔍</div>

          <label className="ot-search-card__label" htmlFor="ot-input">
            {t("tracking.enterOrderId") || "Numéro de commande"}
          </label>

          <div className="ot-search-card__input-wrap">
            <input
              ref={inputRef}
              id="ot-input"
              className="ot-search-card__input"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                t("tracking.placeholder") ||
                "ex: 550e8400-e29b-41d4-a716-446655440000"
              }
              disabled={limitReached || isLoading}
              dir={isRtl ? "rtl" : "ltr"}
              autoFocus
            />
            <button
              className="ot-search-card__btn"
              onClick={() => handleSearch()}
              disabled={!query.trim() || limitReached || isLoading}
            >
              {isLoading ? "…" : t("tracking.search") || "Rechercher"}
            </button>
          </div>

          <p className="ot-search-card__hint">
            {t("tracking.hint") ||
              "Entrez l'identifiant de commande reçu dans votre message de confirmation."}
          </p>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <span
              className={`ot-attempts-badge${
                attempts >= MAX_ATTEMPTS - 1 ? " ot-attempts-badge--warn" : ""
              }`}
            >
              🔒 {t("tracking.attempts") || "Tentatives"} : {attempts}/{MAX_ATTEMPTS}
            </span>
          </div>
        </div>
      )}

      {/* ── Status / feedback states ── */}
      {(isLoading || (searched && !orderFound) || limitReached) && (
        <div className="ot-status">
          <div
            className="ot-status__icon ot-status__icon--blue"
            style={{ animation: isLoading ? "spin 1s linear infinite" : undefined }}
          >
            {limitReached ? "🚫" : isLoading ? "🔍" : "📦"}
          </div>

          {limitReached ? (
            <p className="ot-status__text">{t("tracking.limitReached")}</p>
          ) : isLoading ? (
            <p className="ot-status__text">{t("tracking.searching")} …</p>
          ) : searched && !orderFound ? (
            <p className="ot-status__text">
              {error ? t("tracking.noValidId") : t("tracking.noOrderFound")}
            </p>
          ) : null}
        </div>
      )}

      {/* ── Result cards ── */}
      {orderFound && client && order && steps && (
        <div className="ot-result">
          {/* Client summary */}
          <div className="ot-card">
            <div className="ot-card__stripe" />
            <div
              className="ot-card__body"
              style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
            >
              <div className="order-tracking-icon">
                <span style={{ fontSize: "2.2rem" }}>📦</span>
              </div>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f1c35" }}>
                  {t("auth.welcomeBack") || "Bienvenue"},{" "}
                  <span style={{ color: "#0e92e4" }}>
                    {client.first_name} {client.last_name}
                  </span>{" "}
                  !
                </div>
                <div style={{ fontSize: "0.88rem", color: "#64748b", marginTop: 4 }}>
                  📍 {client.city}
                </div>
              </div>
              <div style={{ marginInlineStart: "auto" }}>
                <StatusBadge steps={steps} t={t} />
              </div>
            </div>
          </div>

          {/* Status pipeline */}
          <div className="ot-card">
            <div className="ot-card__stripe" />
            <div className="ot-card__header">
              <div className="ot-card__header-icon">📶</div>
              <h3 className="ot-card__title">
                {t("tracking.orderDetails") || "Détails de la commande"}
              </h3>
            </div>
            <div className="ot-card__body">
              <OrderStepper steps={steps} t={t} />
              {steps[1].state === "error" && (
                <div className="ot-alert ot-alert--error">
                  ⚠ {t("account.paymentFailedNote")}
                </div>
              )}
            </div>
          </div>

          {/* Order details */}
          <div className="ot-card">
            <div className="ot-card__stripe" />
            <div className="ot-card__header">
              <div className="ot-card__header-icon">🧾</div>
              <h3 className="ot-card__title">
                {t("tracking.orderId") || "N° commande"}
              </h3>
            </div>
            <div className="ot-card__body">
              <div className="ot-info-grid">
                <div className="ot-info-row">
                  <span className="ot-info-row__label">
                    {t("tracking.orderId") || "N° commande"}
                  </span>
                  <span className="ot-info-row__value">
                    <CopyableValue
                      value={order.order_id}
                      copyLabel={t("account.copyId")}
                      copiedLabel={t("account.copied")}
                    />
                  </span>
                </div>
                <div className="ot-info-row">
                  <span className="ot-info-row__label">
                    {t("tracking.date") || "Date"}
                  </span>
                  <span className="ot-info-row__value">
                    {order.date ? new Date(order.date).toLocaleString() : "—"}
                  </span>
                </div>
                <div className="ot-info-row">
                  <span className="ot-info-row__label">
                    {t("tracking.paymentMode") || "Mode de paiement"}
                  </span>
                  <span className="ot-info-row__value">
                    {order.payment_mode === "online"
                      ? t("tracking.online") || "En ligne"
                      : t("tracking.cod")   || "Paiement à la livraison"}
                  </span>
                </div>
                <div className="ot-info-row">
                  <span className="ot-info-row__label">
                    {t("tracking.delivery") || "Livraison"}
                  </span>
                  <span className="ot-info-row__value">
                    {order.delivered
                      ? t("tracking.delivered") || "Livré"
                      : t("tracking.inProgress") || "En cours"}
                  </span>
                </div>
                <div className="ot-info-row">
                  <span className="ot-info-row__label">
                    {t("tracking.total") || "Total"}
                  </span>
                  <span className="ot-info-row__value ot-info-row__value--blue">
                    {order.amount.toFixed(2)} {order.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Products table */}
          <div className="ot-card">
            <div className="ot-card__stripe" />
            <div className="ot-card__header">
              <div className="ot-card__header-icon">👟</div>
              <h3 className="ot-card__title">
                {t("tracking.products") || "Articles commandés"}
              </h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="ot-products-table">
                <thead>
                  <tr>
                    <th>{t("tracking.product") || "Article"}</th>
                    <th>{t("tracking.size")    || "Taille"}</th>
                    <th>{t("tracking.qty")     || "Qté"}</th>
                    <th>{t("tracking.price")   || "Prix"}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <div className="ot-product-name">{p.name}</div>
                        <div className="ot-product-ref">Réf : {p.ref}</div>
                      </td>
                      <td>{p.size}</td>
                      <td>
                        <span className="ot-product-qty-badge">{p.quantity}</span>
                      </td>
                      <td>
                        <strong>
                          {p.price.toFixed(2)} {order.currency}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ot-total-row">
              <span className="ot-total-row__label">
                {t("tracking.total") || "Total"}
              </span>
              <span className="ot-total-row__value">
                {order.amount.toFixed(2)} {order.currency}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="ot-actions">
            <button className="ot-btn ot-btn--secondary" onClick={handleReset}>
              🔍 {t("tracking.newSearch") || "Nouvelle recherche"}
            </button>
            <button className="ot-btn ot-btn--primary" onClick={() => navigate(-1)}>
              ← {t("tracking.goBack") || "Retour"}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrderTracker;
