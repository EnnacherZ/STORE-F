/**
 * App.tsx
 *
 * Root storefront component. Owns route registration and provider composition;
 * staff functionality lives in the separate Dash-F application.
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

// ── Context providers ─────────────────────────────────────────────────────────
import { CartProvider }             from "./contexts/CartContext";
import { PaymentProvider }          from "./contexts/PaymentContext";
import { ProductsContextProvider }  from "./contexts/ProductsContext";
import { ClientAuthProvider }       from "./contexts/ClientAuthContext";
import { ParametersContextProvider} from "./contexts/ParametersContext";

// ── Storefront pages ──────────────────────────────────────────────────────────
import HomePage          from "./components/HomePage";
import Cart              from "./components/Cart";
import Checkout          from "./components/Checkout";
import SuccessTransaction from "./components/SuccessTransaction";
import FailedTransaction  from "./components/FailedTransaction";
import ProductDetails    from "./components/ProductDetails";
import ProductPage       from "./components/ProductPage";
import OrderTracker      from "./components/OrderTracker";
import Policies          from "./components/Policies";
import NotFoundPage      from "./components/NotFoundPage";
import PaymentCallback   from "./components/PaymentCallback";
import SignInPage        from "./components/SignInPage";
import SignUpPage        from "./components/SignUpPage";
import AccountPage       from "./client-profile/ClientAccount";
import ActivateAccount   from "./client-profile/ActivateAccount";
import ProductsPage from "./components/ProductsPage";
import CartAddedDrawer from "./components/CartAddedDrawer";
import ScrollToTop from "./components/ScrollToTop";


// ── Storefront routes ─────────────────────────────────────────────────────────
const storefrontRouter = createBrowserRouter(
  [
    {
      element: <ScrollToTop />,
      children: [
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
        { path: "/orders/track/:OrderID",                     element: <OrderTracker /> },
        { path: "/orders/track",                              element: <OrderTracker /> },
        { path: "/Policies/:option",                          element: <Policies /> },
        { path: "/account/activate/:activation_code",         element: <ActivateAccount /> },
        { path: "/account/signin",                            element: <SignInPage /> },
        { path: "/account/signup",                            element: <SignUpPage /> },
        { path: "/signin",                                    element: <Navigate to="/account/signin" replace /> },
        { path: "/signup",                                    element: <Navigate to="/account/signup" replace /> },
        { path: "/account",                                   element: <AccountPage /> },
        { path: "/products",                                  element: <ProductsPage /> },
        { path: "*",                                          element: <NotFoundPage /> },
      ],
    },
  ],
  { future: { v7_relativeSplatPath: true } }
);


// ── App ───────────────────────────────────────────────────────────────────────

const App: React.FC = () => (
  <motion.div
    key={window.location.pathname}
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    {
      <ClientAuthProvider>
      <ParametersContextProvider>
        <CartProvider>
          <PaymentProvider>
            <ProductsContextProvider>
              <CartAddedDrawer />
              <RouterProvider
                router={storefrontRouter}
                future={{ v7_startTransition: true }}
              />
            </ProductsContextProvider>
          </PaymentProvider>
        </CartProvider>
        </ParametersContextProvider>
      </ClientAuthProvider>
    }

    <ToastContainer />
  </motion.div>
);

export default App;
