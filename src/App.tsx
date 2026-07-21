/**
 * App.tsx
 *
 * Root component. Splits routing between the storefront and the dashboard
 * at the /Dashboard path prefix. Each surface has its own router so they
 * can never accidentally share routes.
 *
 * Auth is provided at the appropriate level:
 *   - ClientAuthProvider wraps the entire storefront tree
 *   - AuthProvider (dashboard) wraps only dashboard routes
 */
import React from "react";
import "react-toastify/dist/ReactToastify.css";
// import "./App.css";
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
import AccountPage       from "./client profile/ClientAccount";
import ActivateAccount   from "./client profile/ActivateAccount";
// import SendEmail         from "./sendMail";
import AddProductTypeForm from "./reloader";
import ProductsPage from "./components/ProductsPage";


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
    // { path: "/send_mail",                                 element: <SendEmail /> },
    { path: "/testy",                                     element: <AddProductTypeForm /> },
    { path: "*",                                          element: <NotFoundPage /> },
    { path:"/products",  element:<ProductsPage /> }
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
    { (
      // Storefront surface
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
    )}

    <ToastContainer />
  </motion.div>
);

export default App;