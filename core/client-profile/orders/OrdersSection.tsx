// account/orders/OrdersSection.tsx
import React, { useState } from "react";
import {
  FaTimesCircle, FaHourglassHalf,
  FaTruck, FaMoneyBillWave, FaCreditCard,
  FaBoxOpen, FaChevronDown, FaChevronUp,
  FaClipboardCheck, FaBoxes, FaExclamationTriangle,
  FaCopy, FaCheck, FaHashtag,
} from "react-icons/fa";
import { Order } from "../utils/types";
import "../styles/OrdersSection.css";
import {
  getOrderSteps as computeOrderSteps,
  getProgressPercent,
  isCodPaymentMode,
  OrderStepResult,
} from "../../utils/orderSteps";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-MA", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Fallback for older/unsupported contexts (non-HTTPS, permissions, etc.)
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

// ── CopyableId ────────────────────────────────────────────────────────────────
// Small chip used for both the order ID and the transaction ID: shows a
// truncated value with a copy button that briefly confirms success.

interface CopyableIdProps {
  value: string;
  displayValue: string;
  icon?: React.ReactNode;
  variant?: "default" | "muted";
  wrap?: boolean;
  copyLabel: string;
  copiedLabel: string;
}

const CopyableId: React.FC<CopyableIdProps> = ({
  value, displayValue, icon, variant = "default", wrap = false, copyLabel, copiedLabel,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <span className={`acc-copyable acc-copyable--${variant} ${wrap ? "acc-copyable--wrap" : ""}`}>
      {icon && <span className="acc-copyable__icon">{icon}</span>}
      <span className="acc-copyable__value">{displayValue}</span>
      <button
        type="button"
        className={`acc-copyable__btn ${copied ? "acc-copyable__btn--copied" : ""}`}
        onClick={handleCopy}
        aria-label={copied ? copiedLabel : copyLabel}
        title={copied ? copiedLabel : copyLabel}
      >
        {copied ? <FaCheck /> : <FaCopy />}
      </button>
      {copied && <span className="acc-copyable__tooltip">{copiedLabel}</span>}
    </span>
  );
};

// ── IdRow ─────────────────────────────────────────────────────────────────────
// A labelled row for the "order details" block in the expanded card body:
// small uppercase label above/beside a full, copyable ID chip.

interface IdRowProps {
  label: string;
  value: string;
  displayValue: string;
  copyLabel: string;
  copiedLabel: string;
}

const IdRow: React.FC<IdRowProps> = ({ label, value, displayValue, copyLabel, copiedLabel }) => (
  <div className="acc-order__id-row">
    <span className="acc-order__id-row-label">{label}</span>
    <CopyableId
      value={value}
      displayValue={displayValue}
      variant="muted"
      wrap
      copyLabel={copyLabel}
      copiedLabel={copiedLabel}
    />
  </div>
);

// ── Order pipeline model ──────────────────────────────────────────────────────
//
// Three raw fields drive the customer-facing status: is_paid, status, delivered.
// They are NOT independent — this encodes the real dependency chain:
//
//   Placed  →  Payment  →  Processing  →  Delivery
//
//   - A failed online payment halts everything after it.
//   - COD orders settle payment AT delivery, so "payment" is shown done
//     immediately (informational), not blocking the rest.
//   - Processing cannot be current/done while an online payment is pending.
//   - Delivery cannot be current until processing is actually done.

export type StepState = OrderStepResult["state"];

export interface OrderStep extends OrderStepResult {
  icon: React.ReactNode;
}

// React-icon per step key — the pure state logic lives in utils/orderSteps.ts
// (shared with the public order-tracking view), only the icon differs here.
const STEP_ICONS: Record<OrderStepResult["key"], React.ReactNode> = {
  placed: <FaClipboardCheck />,
  payment: <FaCreditCard />, // overridden to FaMoneyBillWave for COD orders below
  processing: <FaBoxes />,
  delivery: <FaTruck />,
};

export function getOrderSteps(order: Order): OrderStep[] {
  const isCod = isCodPaymentMode(order.payment_mode);
  return computeOrderSteps(order).map(step => ({
    ...step,
    icon: step.key === "payment" ? (isCod ? <FaMoneyBillWave /> : <FaCreditCard />) : STEP_ICONS[step.key],
  }));
}

function getHeadlineStatus(order: Order, t: (key: string) => string) {
  const steps = getOrderSteps(order);
  const payment = steps[1];
  const processing = steps[2];
  const delivery = steps[3];

  if (payment.state === "error") {
    return { cls: "badge--red", icon: <FaTimesCircle />, label: t("account.paymentFailed") };
  }
  if (delivery.state === "done") {
    return { cls: "badge--teal", icon: <FaTruck />, label: t("account.delivered") };
  }
  if (delivery.state === "current") {
    return { cls: "badge--blue", icon: <FaTruck />, label: t("account.outForDelivery") };
  }
  if (processing.state === "done") {
    return { cls: "badge--blue", icon: <FaBoxes />, label: t("account.readyToShip") };
  }
  if (processing.state === "current") {
    return { cls: "badge--orange", icon: <FaBoxes />, label: t("account.processingOngoing") };
  }
  return { cls: "badge--orange", icon: <FaHourglassHalf />, label: t("account.statusPending") };
}

// ── Stepper (vertical timeline) ───────────────────────────────────────────────

interface StepperProps {
  steps: OrderStep[];
  t: (key: string) => string;
}

const OrderStepper: React.FC<StepperProps> = ({ steps, t }) => {
  const { percent, failed } = getProgressPercent(steps);

  return (
    <div className="acc-stepper">
      <div className="acc-progress">
        <div className="acc-progress__labels">
          <span>{t("account.stepPlaced")}</span>
          <span>{t("account.stepDelivery")}</span>
        </div>
        <div className="acc-progress__track">
          <div
            className={`acc-progress__fill ${failed ? "acc-progress__fill--failed" : ""}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="acc-timeline">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div className="acc-timeline__row" key={step.key}>
              <div className="acc-timeline__iconcol">
                <div className={`acc-timeline__circle acc-timeline__circle--${step.state}`}>
                  {step.state === "error" ? <FaExclamationTriangle /> : step.icon}
                </div>
                {!isLast && (
                  <div className={`acc-timeline__line acc-timeline__line--${step.state === "done" ? "done" : "pending"}`} />
                )}
              </div>
              <div className="acc-timeline__text">
                <span className={`acc-timeline__label acc-timeline__label--${step.state}`}>
                  {t(step.labelKey)}
                </span>
                {step.subLabelKey && (
                  <span className="acc-timeline__sublabel">{t(step.subLabelKey)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── OrderCard ─────────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  t: (key: string) => string;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, t }) => {
  const [open, setOpen] = useState(false);
  const headline = getHeadlineStatus(order, t);
  const steps = getOrderSteps(order);
  const shortId = order.order_id.slice(0, 8).toUpperCase();
  const copyLabel = t("account.copyId");
  const copiedLabel = t("account.copied");

  const toggle = () => setOpen(v => !v);
  const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className={`acc-order ${open ? "acc-order--open" : ""}`}>
      <div
        className="acc-order__header"
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={handleHeaderKeyDown}
      >
        <div className="acc-order__meta">
          <CopyableId
            value={order.order_id}
            displayValue={`#${shortId}`}
            icon={<FaHashtag />}
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
          />
          <span className="acc-order__date">{formatDate(order.date)}</span>
        </div>
        <div className="acc-order__right">
          <span className={`acc-badge ${headline.cls}`}>
            {headline.icon}
            {headline.label}
          </span>
          <span className="acc-order__amount">{order.amount.toFixed(2)} {order.currency}</span>
          <span className="acc-order__chevron">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
        </div>
      </div>

      {open && (
        <div className="acc-order__body">
          <div className="acc-order__ids">
            <IdRow
              label={t("order.orderId")}
              value={order.order_id}
              displayValue={order.order_id.toUpperCase()}
              copyLabel={copyLabel}
              copiedLabel={copiedLabel}
            />
            {order.transaction_id && (
              <IdRow
                label={t("transaction.transactionId")}
                value={order.transaction_id}
                displayValue={order.transaction_id}
                copyLabel={copyLabel}
                copiedLabel={copiedLabel}
              />
            )}
          </div>

          <OrderStepper steps={steps} t={t} />

          {steps[1].state === "error" && (
            <div className="acc-alert acc-alert--error">
              <FaExclamationTriangle />
              {t("account.paymentFailedNote")}
            </div>
          )}

          <div className="acc-order__info-row">
            <span className="acc-order__info-item">
              {order.payment_mode === "online"
                ? <><FaCreditCard />{t("account.onlinePayment")}</>
                : <><FaMoneyBillWave />{t("account.codPayment")}</>}
            </span>
          </div>

          <div className="acc-order__products">
            {order.products.map((p, i) => (
              <div key={i} className="acc-product-row">
                <div className="acc-product-row__thumb"><FaBoxOpen /></div>
                <div className="acc-product-row__info">
                  <p className="acc-product-row__name">{p.name}</p>
                  <p className="acc-product-row__sub">{p.category} · {p.product_type} · T:{p.size}</p>
                </div>
                <div className="acc-product-row__right">
                  <span className="acc-product-row__qty">×{p.quantity}</span>
                  <span className="acc-product-row__price">
                    {(p.price * p.quantity).toFixed(2)} MAD
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="acc-order__footer">
            <span>
              {order.products.length}{" "}
              {t(order.products.length > 1 ? "account.articles" : "account.article")}
            </span>
            <span className="acc-order__total">
              {t("tracking.total")} :{" "}
              <strong>{order.amount.toFixed(2)} {order.currency}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── OrdersSection ─────────────────────────────────────────────────────────────

interface OrdersSectionProps {
  orders: Order[];
  t: (key: string) => string;
}

const OrdersSection: React.FC<OrdersSectionProps> = ({ orders, t }) => (
  <div className="acc-orders-list">
    {orders.map(order => <OrderCard key={order.order_id} order={order} t={t} />)}
  </div>
);

export default OrdersSection;