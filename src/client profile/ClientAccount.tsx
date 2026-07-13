// account/AccountPage.tsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaShoppingBag,
  FaTimesCircle, FaSignOutAlt, FaStar,
} from "react-icons/fa";

import { useClientAuth } from "../contexts/ClientAuthContext";
import { connecter } from "../server/connecter";
import { Order } from "./utils/types";
import { getLoyaltyTier } from "./loyalty/LoyaltyCard";

import Header      from "../components/Header";
import LoyaltyCard from "./loyalty/LoyaltyCard";
import OrdersSection from "./orders/OrdersSection";
import ProfileCard from "./profile/ProfileCard";

import "./styles/account.css";

const AccountPage: React.FC = () => {
  const { client, isAuthenticated, isLoading, signOut, refresh } = useClientAuth();
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const [orders,        setOrders]        = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError,   setOrdersError]   = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<"orders" | "profile">("orders");

  // ── Redirect unauthenticated users ──────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !isAuthenticated)
      navigate("/account/signin", { state: { from: { pathname: "/account" } } });
  }, [isLoading, isAuthenticated, navigate]);

  // ── Fetch orders ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    setOrdersLoading(true);
    connecter.get<Order[]>("api/client/orders/")
      .then(res => setOrders(res.data))
      .catch(() => setOrdersError(t("account.ordersError")))
      .finally(() => setOrdersLoading(false));
  }, [isAuthenticated, t]);

  // ── Loading / guard ───────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="acc-splash"><div className="acc-splash__spinner" /></div>
  );
  if (!client) return null;

  // ── Derived stats ─────────────────────────────────────────────────────────
  const confirmedOrders = orders.filter(o => o.is_paid === "confirmed" || o.is_paid === "cod");
  const totalSpent      = confirmedOrders.reduce((s, o) => s + o.amount, 0);
  const loyaltyPoints   = client.loyalty_points ?? 0;
  const tier            = getLoyaltyTier(loyaltyPoints);
  const initials        = `${client.first_name[0] ?? ""}${client.last_name[0] ?? ""}`.toUpperCase();

  return (
    <>
      <Header />
      <div className="acc-page">

        {/* ── Hero ── */}
        <div className="acc-hero">
          <div className="acc-hero__bg" aria-hidden />
          <div className="acc-hero__content">

            {/* Avatar (read-only in hero — editable inside profile tab) */}
            {client.image ? (
              <img
                className="acc-avatar acc-avatar--img"
                src={client.image}
                alt={initials}
              />
            ) : (
              <div className="acc-avatar">{initials}</div>
            )}

            <div className="acc-hero__text">
              <h1 className="acc-hero__name">{client.first_name} {client.last_name}</h1>
              <p className="acc-hero__email">{client.email}</p>
              <span className="acc-hero__tier-badge" style={{ background: tier.color }}>
                {tier.icon} {tier.label}
              </span>
            </div>

            <button className="acc-signout-btn" onClick={signOut}>
              <FaSignOutAlt />
              <span className="acc-signout-label">{t("auth.signOut")}</span>
            </button>
          </div>

          {/* Stats strip */}
          <div className="acc-stats">
            {[
              { val: orders.length,                              lbl: t("account.statOrders")    },
              { val: confirmedOrders.length,                     lbl: t("account.statConfirmed") },
              { val: orders.filter(o => o.delivered).length,     lbl: t("account.statDelivered") },
              { val: `${totalSpent.toFixed(0)} MAD`,             lbl: t("account.statSpent")     },
              {
                val: <><FaStar style={{ color: tier.color }} /> {loyaltyPoints}</>,
                lbl: t("account.loyaltyPoints"),
              },
            ].map((s, i) => (
              <div key={i} className="acc-stat">
                <span className="acc-stat__val">{s.val}</span>
                <span className="acc-stat__lbl">{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="acc-tabs">
          <button
            className={`acc-tab ${activeTab === "orders" ? "acc-tab--active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <FaShoppingBag /><span>{t("account.tabOrders")}</span>
          </button>
          <button
            className={`acc-tab ${activeTab === "profile" ? "acc-tab--active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser /><span>{t("account.tabProfile")}</span>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="acc-body">

          {/* Orders tab */}
          {activeTab === "orders" && (
            <section className="acc-section">
              <LoyaltyCard points={loyaltyPoints} t={t} />

              {ordersLoading ? (
                <div className="acc-orders-loading">
                  {[1, 2, 3].map(i => <div key={i} className="acc-skeleton" />)}
                </div>
              ) : ordersError ? (
                <div className="acc-empty">
                  <FaTimesCircle className="acc-empty__icon acc-empty__icon--red" />
                  <p>{ordersError}</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="acc-empty">
                  <FaShoppingBag className="acc-empty__icon" />
                  <p>{t("account.noOrders")}</p>
                  <button className="acc-shop-btn" onClick={() => navigate("/Home")}>
                    {t("cart.shopNow")}
                  </button>
                </div>
              ) : (
                <OrdersSection orders={orders} t={t} />
              )}
            </section>
          )}

          {/* Profile tab */}
          {activeTab === "profile" && (
            <section className="acc-section">
              <ProfileCard client={client} t={t} onSaved={refresh} />
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default AccountPage;