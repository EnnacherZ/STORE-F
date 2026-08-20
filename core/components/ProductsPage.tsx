// pages/ProductsPage.tsx
//
// Destination for the "Shop now" (HeroSection → /products) and
// "See the deals" (PromoSection → /products?promo=true) buttons on the
// home page, and for the header's per-type nav links landing here with
// ?type=shoe|sandal|shirt|pant.
//
// Confirmed against store/views.py + serializers.py:
//   GET /api/products/get?productType=<shoe|sandal|shirt|pant>
//   GET /api/products/get            (no filters → every product, flat list)
//
// ProductSerializer fields actually returned: id, product_type, category,
// ref, name, price, promo, newest, stock, image, image1..image4.
//
//   - `price` is the product's base price.
//   - `promo` is a 0–100 PERCENTAGE discount stored directly on Product —
//     there is no separate "before/after price" pair. The discounted price
//     is computed client-side: price * (1 - promo / 100).
//   - `stock` is a list of { ..., quantity } (quantity is the serializer's
//     computed `available_quantity()`). A product is sold out when the sum
//     across all stock entries is <= 0. If the stock list is empty, we
//     don't assume sold-out (could mean "not size-tracked") — no badge is
//     shown in that case.
//   - There is no server-side promo filter, so "See the deals" fetches
//     normally (optionally type-filtered) and filters promo > 0 client-side.
//
// This page intentionally has NO per-type filter chips of its own — the
// header nav already lists Shoes/Sandals/Shirts/Pants, so duplicating that
// here would just be redundant UI. This page only needs a "view all" reset
// and a promo toggle, and still honors ?type= in the URL for header links.

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import Footer from "./Footer";
import { connecter } from "../server/connecter";
import { getDiscountedPrice as calcDiscountedPrice } from "../utils/pricing";
import "../styles/ProductsPage.css";

// ── Types ──────────────────────────────────────────────────────────────────

interface ProductStockEntry {
  quantity: number;
  [key: string]: unknown; // size, etc. — fields beyond quantity aren't needed here
}

interface Product {
  id: number;
  product_type: string;
  category: string;
  ref: string;
  name: string;
  price: number;
  promo: number; // 0–100, percentage discount
  newest: boolean;
  stock: ProductStockEntry[];
  image: string | null;
  image1: string | null;
  image2: string | null;
  image3: string | null;
  image4: string | null;
}

// ── Pricing / stock helpers ──────────────────────────────────────────────────

function getDiscountedPrice(p: Product): number {
  return calcDiscountedPrice(p.price, p.promo);
}

function isOnPromo(p: Product): boolean {
  return p.promo > 0;
}

// Returns null when stock isn't tracked for this product (empty list),
// so callers can distinguish "unknown" from "confirmed zero".
function getTotalStock(p: Product): number | null {
  if (!p.stock || p.stock.length === 0) return null;
  return p.stock.reduce((sum, entry) => sum + (entry.quantity ?? 0), 0);
}

// ── Component ──────────────────────────────────────────────────────────────

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeType = searchParams.get("type"); // e.g. "shoe" — set by header links
  const promoOnly = searchParams.get("promo") === "true";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    // Only `productType` is a real backend param — `promo` is never sent
    // to the API, it's applied client-side below after fetching.
    const params = new URLSearchParams();
    if (activeType) params.set("productType", activeType);

    const endpoint = params.toString()
      ? `api/products/get?${params.toString()}`
      : `api/products/get`; // no filters → get_products returns everything, flat

    connecter
      .get(endpoint)
      .then(res => {
        if (cancelled) return;
        const list: Product[] = res.data?.products ?? [];
        setProducts(promoOnly ? list.filter(isOnPromo) : list);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeType, promoOnly]);

  const handleViewAll = () => setSearchParams(new URLSearchParams());

  const handlePromoToggle = () => {
    const next = new URLSearchParams(searchParams);
    if (promoOnly) next.delete("promo");
    else next.set("promo", "true");
    setSearchParams(next);
  };

  const pageTitle = promoOnly
    ? t("home.promotions")
    : activeType
      ? t(`productTypes.${activeType}`)
      : t("home.products");

  return (
    <>
      <Header />
      <main className="products-page">
        <div className="products-page__header">
          <h1 className="products-page__title">{pageTitle}</h1>

          <div className="products-page__filters">
            <button
              className={`products-page__chip ${!activeType && !promoOnly ? "products-page__chip--active" : ""}`}
              onClick={handleViewAll}
            >
              {t("home.viewAll")}
            </button>

            <button
              className={`products-page__chip products-page__chip--promo ${promoOnly ? "products-page__chip--active" : ""}`}
              onClick={handlePromoToggle}
            >
              🔥 {t("promo.cta")}
            </button>
          </div>
        </div>

        {loading && (
          <div className="products-page__state">{t("product.loading")}</div>
        )}

        {!loading && error && (
          <div className="products-page__state products-page__state--error">
            {t("account.ordersError")}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="products-page__state">{t("product.noneYet")}</div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="products-page__grid">
            {products.map(p => {
              const onPromo = isOnPromo(p);
              const finalPrice = getDiscountedPrice(p);
              const totalStock = getTotalStock(p);
              const soldOut = totalStock !== null && totalStock <= 0;
              const currency = t("product.currency");

              return (
                <div
                  key={p.id}
                  className="products-page__card"
                  onClick={() => navigate(`/productDetails/${p.product_type}/${p.category}/${p.ref}/${p.id}`)}
                >
                  <div className="products-page__thumb">
                    {p.image ? (
                      <img src={p.image} alt={p.name} loading="lazy" />
                    ) : (
                      <span className="products-page__thumb-fallback">👟</span>
                    )}
                    {onPromo && (
                      <span className="products-page__promo-badge">
                        -{p.promo}%
                      </span>
                    )}
                    {soldOut && (
                      <span className="products-page__soldout">{t("product.soldOut")}</span>
                    )}
                  </div>
                  <div className="products-page__info">
                    <p className="products-page__name">{p.name}</p>
                    <p className="products-page__cat">{p.category}</p>
                    <div className="products-page__price-row">
                      {onPromo && (
                        <span className="products-page__before">
                          {p.price.toFixed(2)} {currency}
                        </span>
                      )}
                      <span className="products-page__price">
                        {finalPrice.toFixed(2)} {currency}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default ProductsPage;