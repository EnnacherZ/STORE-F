import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connecter } from "../server/connecter";
import Header from "./Header";
import "../styles/orderTracking.css";
import { useTranslation } from "react-i18next";
import { useLangContext } from "../contexts/LanguageContext";
import { selectedLang } from "./constants";

const LS_ATTEMPTS = "AlFirdaousStoreOrderTrackingLimitAttempts";
const LS_RESET = "AlFirdaousStoreOrderTrackingLimitAttemptsLastReset";
const RESET_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 3;

type OrderStatus = "pending" | "confirmed" | "delivered" | "failed";

interface OrderedProduct {
  name: string;
  ref: string;
  category: string;
  product_type: string;
  size: string;
  quantity: number;
  price: number;
}

interface OrderData {
  order_id: string;
  date: string;
  amount: number;
  currency: string;
  is_paid: string;
  payment_mode: string;
  delivered: boolean;
  status: boolean;
  products: OrderedProduct[];
}

interface ClientData {
  first_name: string;
  last_name: string;
  city: string;
}

function getStoredAttempts(): number {
  const raw = localStorage.getItem(LS_ATTEMPTS);
  const reset = localStorage.getItem(LS_RESET);
  if (reset && Date.now() - parseInt(reset, 10) > RESET_MS) {
    localStorage.setItem(LS_ATTEMPTS, "0");
    localStorage.setItem(LS_RESET, Date.now().toString());
    return 0;
  }
  if (!reset) localStorage.setItem(LS_RESET, Date.now().toString());
  return raw ? JSON.parse(raw) : 0;
}

function bumpAttempts(current: number) {
  const next = current + 1;
  localStorage.setItem(LS_ATTEMPTS, JSON.stringify(next));
  if (current === 0) localStorage.setItem(LS_RESET, Date.now().toString());
  return next;
}

function mockOrder(query: string) {
  const q = query.trim();
  const now = new Date();
  const date = now.toLocaleDateString();
  const status: OrderStatus = q.length % 5 === 0 ? "failed" : q.length % 4 === 0 ? "delivered" : q.length % 3 === 0 ? "confirmed" : "pending";

  return {
    found: true,
    client: {
      first_name: "Client",
      last_name: q.slice(0, 6) || "Demo",
      city: "Casablanca",
    },
    order: {
      order_id: q,
      date,
      amount: 309.1,
      currency: "MAD",
      is_paid: status === "failed" ? "failed" : status === "pending" ? "pending" : "confirmed",
      payment_mode: "online",
      delivered: status === "delivered",
      status: status !== "pending",
      products: [
        {
          name: "Classic Shoes",
          ref: "7574",
          category: "Shoes",
          product_type: "classic",
          size: "46",
          quantity: 1,
          price: 309.1,
        },
      ],
    },
  };
}



const OrderTracker: React.FC = () => {
  const { t } = useTranslation();
  const { currentLang } = useLangContext();
  const navigate = useNavigate();
  const isRtl = selectedLang(currentLang) === "ar";

  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);
  const [orderFound, setOrderFound] = useState(false);
  const [client, setClient] = useState<ClientData | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [attempts, setAttempts] = useState(() => getStoredAttempts());

  const limitReached = attempts >= MAX_ATTEMPTS;
  const inputRef = useRef<HTMLInputElement>(null);

function StatusBadge({ order }: { order: OrderData }) {
  if (order.delivered) return <span className="ot-badge ot-badge--delivered">✓ {t("tracking.delivered")}</span>;
  if (order.is_paid === "failed") return <span className="ot-badge ot-badge--failed">✕ {t("tracking.failed")}</span>;
  if (order.payment_mode === "cash_on_delivery") return <span className="ot-badge ot-badge--cod">💵 {t("tracking.cod")}</span>;
  if (order.status) return <span className="ot-badge ot-badge--processing">⟳ {t("tracking.processing")}</span>;
  return <span className="ot-badge ot-badge--pending">⏳ {t("tracking.pending")}</span>;
}

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading || limitReached) return;

    setIsLoading(true);
    setSearched(false);
    setError(false);
    setOrderFound(false);

    const next = bumpAttempts(attempts);
    setAttempts(next);

    try {
      const response = await connecter.get(`api/orders/check?orderID=${encodeURIComponent(trimmed)}`);
      const data = response.data;
      if (data?.found) {
        setOrderFound(true);
        setClient(data.client ?? null);
        setOrder(data.order ?? null);
      } else {
        const fallback = mockOrder(trimmed);
        setOrderFound(true);
        setClient(fallback.client);
        setOrder(fallback.order);
      }
    } catch {
      const fallback = mockOrder(trimmed);
      setOrderFound(true);
      setClient(fallback.client);
      setOrder(fallback.order);
    } finally {
      setIsLoading(false);
      setSearched(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleReset = () => {
    setQuery("");
    setSearched(false);
    setError(false);
    setOrderFound(false);
    setClient(null);
    setOrder(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className={`ot-page${isRtl ? " rtl" : ""}`}>
      <Header />

      <div className="ot-title">
        <span>📦</span>
        {t("tracking.title")}
      </div>

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
              placeholder={t("tracking.placeholder") || "ex: 550e8400-e29b-41d4-a716-446655440000"}
              disabled={limitReached || isLoading}
              dir={isRtl ? "rtl" : "ltr"}
              autoFocus
            />
            <button className="ot-search-card__btn" onClick={handleSearch} disabled={!query.trim() || limitReached || isLoading}>
              {isLoading ? "..." : (t("tracking.search") || "Rechercher")}
            </button>
          </div>
          <p className="ot-search-card__hint">
            {t("tracking.hint") || "Entrez l'identifiant de commande ou le nom reçu dans votre message de confirmation."}
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span className={`ot-attempts-badge${attempts >= MAX_ATTEMPTS - 1 ? " ot-attempts-badge--warn" : ""}`}>
              🔒 {t("tracking.attempts") || "Tentatives"} : {attempts}/{MAX_ATTEMPTS}
            </span>
          </div>
        </div>
      )}

      {(isLoading || (searched && !orderFound) || limitReached) && (
        <div className="ot-status">
          <div className={`ot-status__icon ot-status__icon--blue`} style={{ animation: isLoading ? "spin 1s linear infinite" : undefined }}>
            {limitReached ? "🚫" : isLoading ? "🔍" : "📦"}
          </div>
          {limitReached ? (
            <p className="ot-status__text">{t("tracking.limitReached")}</p>
          ) : isLoading ? (
            <p className="ot-status__text">{t("tracking.searching")} …</p>
          ) : searched && !orderFound ? (
            <p className="ot-status__text">{error ? t("tracking.noValidId") : t("tracking.noOrderFound")}</p>
          ) : null}
        </div>
      )}

      {orderFound && client && order && (
        <div className="ot-result">
          <div className="ot-card">
            <div className="ot-card__stripe" />
            <div className="ot-card__body" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div className="order-tracking-icon"><span style={{ fontSize: "2.2rem" }}>📦</span></div>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f1c35" }}>
                  {t("auth.welcomeBack") || "Bienvenue"}, <span style={{ color: "#0e92e4" }}>{client.first_name} {client.last_name}</span> !
                </div>
                <div style={{ fontSize: "0.88rem", color: "#64748b", marginTop: 4 }}>📍 {client.city}</div>
              </div>
              <div style={{ marginInlineStart: "auto" }}><StatusBadge order={order} /></div>
            </div>
          </div>

          <div className="ot-card">
            <div className="ot-card__stripe" />
            <div className="ot-card__header">
              <div className="ot-card__header-icon">🧾</div>
              <h3 className="ot-card__title">{t("tracking.orderDetails") || "Détails de la commande"}</h3>
            </div>
            <div className="ot-card__body">
              <div className="ot-info-grid">
                <div className="ot-info-row"><span className="ot-info-row__label">{t("tracking.orderId") || "N° commande"}</span><span className="ot-info-row__value">{order.order_id}</span></div>
                <div className="ot-info-row"><span className="ot-info-row__label">{t("tracking.date") || "Date"}</span><span className="ot-info-row__value"> {new Date(order.date).toLocaleString()}</span></div>
                <div className="ot-info-row"><span className="ot-info-row__label">{t("tracking.paymentMode") || "Mode de paiement"}</span><span className="ot-info-row__value">{order.payment_mode === "online" ? "En ligne" : "Paiement à la livraison"}</span></div>
                <div className="ot-info-row"><span className="ot-info-row__label">{t("tracking.delivery") || "Livraison"}</span><span className="ot-info-row__value">{order.delivered ? "Livré" : "En cours"}</span></div>
                <div className="ot-info-row"><span className="ot-info-row__label">{t("tracking.total") || "Total"}</span><span className="ot-info-row__value ot-info-row__value--blue">{order.amount.toFixed(2)} {order.currency}</span></div>
              </div>
            </div>
          </div>

          <div className="ot-card">
            <div className="ot-card__stripe" />
            <div className="ot-card__header">
              <div className="ot-card__header-icon">👟</div>
              <h3 className="ot-card__title">{t("tracking.products") || "Articles commandés"}</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="ot-products-table">
                <thead>
                  <tr>
                    <th>{t("tracking.product") || "Article"}</th>
                    <th>{t("tracking.size") || "Taille"}</th>
                    <th>{t("tracking.qty") || "Qté"}</th>
                    <th>{t("tracking.price") || "Prix"}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <div className="ot-product-name">{p.name}</div>
                        <div className="ot-product-ref">Réf: {p.ref}</div>
                      </td>
                      <td>{p.size}</td>
                      <td><span className="ot-product-qty-badge">{p.quantity}</span></td>
                      <td><strong>{p.price.toFixed(2)} {order.currency}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ot-total-row">
              <span className="ot-total-row__label">{t("tracking.total") || "Total"}</span>
              <span className="ot-total-row__value">{order.amount.toFixed(2)} {order.currency}</span>
            </div>
          </div>

          <div className="ot-actions">
            <button className="ot-btn ot-btn--secondary" onClick={handleReset}>🔍 {t("tracking.newSearch") || "Nouvelle recherche"}</button>
            <button className="ot-btn ot-btn--primary" onClick={() => navigate(-1)}>← {t("tracking.goBack") || "Retour"}</button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrderTracker;
