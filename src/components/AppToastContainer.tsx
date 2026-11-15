import React from "react";
import { Slide, ToastContainer } from "react-toastify";

import { useLangContext } from "../contexts/LanguageContext";
import { selectedLang } from "./constants";
import "../styles/toasts.css";

const AppToastContainer: React.FC = () => {
  const { currentLang } = useLangContext();
  const isRtl = selectedLang(currentLang) === "ar";

  return (
    <ToastContainer
      position="top-center"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      pauseOnHover
      draggable
      limit={4}
      role="alert"
      rtl={isRtl}
      theme="light"
      transition={Slide}
      className={`app-toast-container${isRtl ? " app-toast-container--rtl" : ""}`}
      toastClassName="app-toast"
      bodyClassName="app-toast__body"
      progressClassName="app-toast__progress"
    />
  );
};

export default AppToastContainer;
