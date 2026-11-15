import { toast } from "react-toastify";

export type ToastKind = "success" | "error" | "warning" | "info";

const durations: Record<ToastKind, number> = {
  success: 3000,
  error: 5000,
  warning: 4500,
  info: 3500,
};

/** Display one consistent, deduplicated application notification. */
export const showToast = (message: string, kind: ToastKind = "info") => {
  toast[kind](message, {
    autoClose: durations[kind],
    toastId: `${kind}:${message}`,
  });
};
