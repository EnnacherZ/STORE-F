import React from "react";
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";
import { CartProvider } from "./contexts/CartContext";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { PaymentProvider } from "./contexts/PaymentContext";
import { ProductsContextProvider } from "./contexts/ProductsContext";
import { ParametersContextProvider } from "./dashboard/contexts/ParametersContext";
import { AuthProvider } from "./dashboard/contexts/Authentication";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";


// Lazy load des composants
import  HomePage from "./components/HomePage";
import Cart from "./components/cart";
import Checkout from "./components/checkout";
import SuccessTransaction from "./components/SuccessTransaction";
import ProductDetails from "./components/ProductDetails";
import Login from "./dashboard/LogIn";
import DBHome from "./dashboard/pages/home";
import ProductsManager from "./dashboard/pages/ProductsManager";
import ExceptionsPage from "./dashboard/pages/Deficiencies";
import AddProductTypeForm from "./reloader";
import Orders from "./dashboard/pages/Orders";
import Settings from "./dashboard/pages/Settings";
import OrderTracker from "./components/OrderTracker";
import Statistics from "./dashboard/pages/Statistics";
import OrderDetails from "./dashboard/pages/OrderDetails";
import Policies from "./components/Policies";
import ProductPage from "./components/ProductPage";
import NotFoundPage from "./components/NotFoundPage";
//import LoginClient from "./client";
import SendEmail from "./sendMail";
import PaymentCallback from "./components/PaymentCallback";
import FailedTransaction from "./components/FailedTransaction";



// Routes clients
const routes = [
  { path: "/productDetails/:product/:category/:ref/:id", element: <ProductDetails /> },
  { path: "/", element: <Navigate to="/Home" /> },
  { path: "/Home", element: <HomePage /> },
  { path: "/ProductPage/:productType", element: <ProductPage /> },
  { path: "/Cart", element: <Cart /> },
  { path: "/Checkout", element: <Checkout /> },
  { path: "/Transaction/Success", element: <SuccessTransaction /> },
  { path: "/Transaction/Failed", element: <FailedTransaction /> },
  { path: "/testy", element: <AddProductTypeForm /> },
  { path: "/MyOrder", element: <OrderTracker /> },
  { path: "/Policies/:option", element: <Policies /> },
  //{ path: "/client", element: <LoginClient /> },
  { path: "*", element: <NotFoundPage /> },
  { path: "/send_mail", element: <SendEmail /> },
  { path: "/payment/success", element: <PaymentCallback />},
  { path: "/payment/error",   element: <PaymentCallback />},
];

// Routes admin
const dbRoutes = [
  { path: "/Dashboard", element: <Navigate to="/Dashboard/Home" /> },
  { path: "/Dashboard/Home", element: <DBHome /> },
  { path: "/Dashboard/Login", element: <Login /> },
  { path: "/Dashboard/ProductManager", element: <ProductsManager /> },
  { path: "/Dashboard/Deficiency", element: <ExceptionsPage /> },
  { path: "/Dashboard/Orders", element: <Orders /> },
  { path: "/Dashboard/Settings", element: <Settings /> },
  { path: "/Dashboard/Statistics", element: <Statistics /> },
  { path: "/Dashboard/OrderDetails/:orderID", element: <OrderDetails /> },
  
];

const isAdminInterface =
  window.location.pathname.startsWith("/Dashboard") ||
  window.location.pathname.startsWith("/dashboard");

const router = isAdminInterface
  ? createBrowserRouter(dbRoutes, { future: { v7_relativeSplatPath: true } })
  : createBrowserRouter(routes, { future: { v7_relativeSplatPath: true } });

const App: React.FC = () => {
    return (

      
      <CartProvider>
        <PaymentProvider>
          <ProductsContextProvider>
            <ParametersContextProvider>
              {/* <Suspense fallback={<Loading message={t("loading")}/>}> */}
                <motion.div
    key={window.location.pathname}
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
  >
                {isAdminInterface ? (
                  <AuthProvider>
                    <RouterProvider router={router} future={{ v7_startTransition: true }} />
                  </AuthProvider>
                ) : (
                  <RouterProvider router={router} future={{ v7_startTransition: true }} />
                )}
                </motion.div>
                   <ToastContainer />
              {/* </Suspense> */}
            </ParametersContextProvider>
          </ProductsContextProvider>
        </PaymentProvider>
      </CartProvider>
  );
};

export default App;
