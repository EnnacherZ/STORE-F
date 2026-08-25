import React, {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { selectedLang } from "../components/constants";
import ar from "../locales/ar";
import en from "../locales/en";
import fr from "../locales/fr";

const LANGUAGE_STORAGE_KEY = "AlFirdaousStoreLang";
const DEFAULT_LANGUAGE_LABEL = "العربية";

i18n.use(initReactI18next).init({
  resources: { en, fr, ar },
  lng: "fr",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

interface LangContextValue {
  currentLang: string;
  setCurrentLang: Dispatch<React.SetStateAction<string>>;
}

const LangContext = createContext<LangContextValue | undefined>(undefined);

const readStoredLanguage = (): string => {
  const storedLanguage = sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (!storedLanguage) return DEFAULT_LANGUAGE_LABEL;

  try {
    return JSON.parse(storedLanguage) as string;
  } catch {
    return DEFAULT_LANGUAGE_LABEL;
  }
};

export const LangContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(readStoredLanguage);

  useEffect(() => {
    sessionStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(currentLang));
    void i18n.changeLanguage(selectedLang(currentLang));
  }, [currentLang]);

  return (
    <LangContext.Provider value={{ currentLang, setCurrentLang }}>
      <div>{children}</div>
    </LangContext.Provider>
  );
};

export const useLangContext = (): LangContextValue => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLangContext must be used within LangContextProvider");
  }
  return context;
};

export default i18n;
