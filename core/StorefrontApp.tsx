/**
 * StorefrontApp.tsx
 *
 * The entire storefront — route table, all context providers, and the
 * store-config injection point — as a single component. A host app's
 * main.tsx should need nothing more than:
 *
 *   import './i18n';               // initializes i18next with this store's content
 *   import { StorefrontApp } from '@firdaous/storefront-core';
 *   import { myStoreConfig } from './config';
 *   ReactDOM.createRoot(...).render(<StorefrontApp config={myStoreConfig} />);
 *
 * Splitting routing between the storefront and any admin/dashboard surface
 * (if a host app has one) is the host app's concern, not this component's —
 * this only ever renders the customer-facing storefront routes.
 */
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

// ── Config injection ──────────────────────────────────────────────────────────
import { StoreConfigProvider, StoreConfig } from "./config/StoreConfigContext";

// ── Context providers ─────────────────────────────────────────────────────────
import { LangContextProvider }      from "./contexts/LanguageContext";
import { CartProvider }             from "./contexts/CartContext";
import { PaymentProvider }          from "./contexts/PaymentContext";
import { ProductsContextProvider }  from "./contexts/ProductsContext";
import { ClientAuthProvider }       from "./contexts/ClientAuthContext";
import { ParametersContextProvider} from "./contexts/ParametersContext";

// ── Storefront pages ──────────────────────────────────────────────────────────
import HomePage          from "./components/HomePage";
import Cart              from "./components/cart";
import Checkout          from "./components/checkout";
import SuccessTransaction from "./components/SuccessTransaction";
import FailedTransaction  from "./components/FailedTransaction";
import ProductDetails    from "./components/ProductDetails";
import ProductPage       from "./components/ProductPage";
import OrderTracker      from "./components/OrderTracker";
import Policies          from "./components/Policies";
import NotFoundPage      from "./components/NotFoundPage";
import PaymentCallback   from "./components/PaymentCallback";
import SignInPage        from "./components/Signinpage";
import SignUpPage        from "./components/Signuppage";
import AccountPage       from "./client-profile/ClientAccount";
import ActivateAccount   from "./client-profile/ActivateAccount";
import ProductsPage      from "./components/ProductsPage";


// ── Storefront routes ─────────────────────────────────────────────────────────
const storefrontRouter = createBrowserRouter(
  [
    { path: "/",                                          element: <Navigate to="/Home" replace /> },
    { path: "/Home",                                      element: <HomePage /> },
    { path: "/ProductPage/:productType",                  element: <ProductPage /> },
    { path: "/productDetails/:productType/:category/:ref/:id" ,element: <ProductDetails /> },
    { path: "/Cart",                                      element: <Cart /> },
    { path: "/Checkout",                                  element: <Checkout /> },
    { path: "/Transaction/Success",                       element: <SuccessTransaction /> },
    { path: "/Transaction/Failed",                        element: <FailedTransaction /> },
    { path: "/payment/success",                           element: <PaymentCallback /> },
    { path: "/payment/error",                             element: <PaymentCallback /> },
    { path: "/orders/track/:OrderID",                          element: <OrderTracker /> },
    { path: "/orders/track",                                   element: <OrderTracker /> },
    { path: "/Policies/:option",                          element: <Policies /> },
    { path: "/account/activate/:activation_code",         element: <ActivateAccount /> },
    { path: "/account/signin",                                    element: <SignInPage /> },
    { path: "/account/signup",                                    element: <SignUpPage /> },
    { path: "/signin",                                     element: <Navigate to="/account/signin" replace /> },
    { path: "/signup",                                    element: <Navigate to="/account/signup" replace /> },
    { path: "/account",                                   element: <AccountPage /> },
    { path: "*",                                          element: <NotFoundPage /> },
    { path:"/products",  element:<ProductsPage /> }
  ],
  { future: { v7_relativeSplatPath: true } }
);


// ── StorefrontApp ──────────────────────────────────────────────────────────────

export interface StorefrontAppProps {
  config: StoreConfig;
}

export const StorefrontApp: React.FC<StorefrontAppProps> = ({ config }) => (
  <StoreConfigProvider config={config}>
    <LangContextProvider>
      <motion.div
        key={window.location.pathname}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        <ClientAuthProvider>
          <ParametersContextProvider>
            <CartProvider>
              <PaymentProvider>
                <ProductsContextProvider>
                  <RouterProvider
                    router={storefrontRouter}
                    future={{ v7_startTransition: true }}
                  />
                </ProductsContextProvider>
              </PaymentProvider>
            </CartProvider>
          </ParametersContextProvider>
        </ClientAuthProvider>

        <ToastContainer />
      </motion.div>
    </LangContextProvider>
  </StoreConfigProvider>
);

export default StorefrontApp;
