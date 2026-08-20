/**
 * orderSteps.ts
 *
 * The order-status pipeline (Placed → Payment → Processing → Delivery) was
 * previously duplicated byte-for-byte between components/OrderTracker.tsx
 * (public order tracking) and "client profile/orders/OrdersSection.tsx"
 * (authenticated account order history) — same rules, same comments, two
 * copies that could silently drift apart.
 *
 * This module holds only the pure state-per-step logic. Each consumer keeps
 * its own icon rendering (OrderTracker uses emoji strings, OrdersSection
 * uses react-icons components) and its own badge/CSS class naming — those
 * are presentation choices, not the underlying business rule.
 *
 * NOTE on payment_mode: OrderTracker's public tracking endpoint has been
 * observed to send "cash_on_delivery", while the authenticated account
 * endpoint sends "cod" for the same concept (Order.payment_mode in
 * "client profile/utils/types.ts" is typed as "online" | "cod" only). Both
 * spellings are treated as COD here so neither caller's existing behavior
 * changes.
 */

export type StepState = "done" | "current" | "pending" | "error";

export interface OrderStepInput {
  payment_mode: string;
  is_paid: string;
  status: boolean;
  delivered: boolean;
}

export interface OrderStepResult {
  key: "placed" | "payment" | "processing" | "delivery";
  labelKey: string;
  subLabelKey?: string;
  state: StepState;
}

export function isCodPaymentMode(paymentMode: string): boolean {
  return paymentMode === "cash_on_delivery" || paymentMode === "cod";
}

export function getOrderSteps(order: OrderStepInput): OrderStepResult[] {
  const isCod = isCodPaymentMode(order.payment_mode);
  const isFailed = order.is_paid === "failed";
  const isConfirmed = order.is_paid === "confirmed";
  const isPendingOnline = order.is_paid === "pending";

  const placed: OrderStepResult = {
    key: "placed",
    labelKey: "account.stepPlaced",
    state: "done",
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
  const payment: OrderStepResult = {
    key: "payment",
    labelKey: "account.stepPayment",
    subLabelKey: paymentSubLabel,
    state: paymentState,
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
  const processing: OrderStepResult = {
    key: "processing",
    labelKey: "account.stepProcessing",
    subLabelKey: isFailed
      ? undefined
      : order.status ? "account.processingDone" : "account.processingOngoing",
    state: processingState,
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
  const delivery: OrderStepResult = {
    key: "delivery",
    labelKey: "account.stepDelivery",
    subLabelKey: order.delivered ? "account.delivered" : undefined,
    state: deliveryState,
  };

  return [placed, payment, processing, delivery];
}

export function getProgressPercent(steps: OrderStepResult[]): { percent: number; failed: boolean } {
  if (steps.some(s => s.state === "error")) return { percent: 100, failed: true };
  const doneCount = steps.filter(s => s.state === "done").length;
  const hasCurrent = steps.some(s => s.state === "current");
  const percent = ((doneCount + (hasCurrent ? 0.5 : 0)) / steps.length) * 100;
  return { percent, failed: false };
}
