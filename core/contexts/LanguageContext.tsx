import i18n from 'i18next';
import React, { createContext, Dispatch, ReactNode, useContext, useEffect, useState } from 'react';
import { selectedLang } from '../components/constants';
import { useStoreConfig } from '../config/StoreConfigContext';

// ── Context ───────────────────────────────────────────────────────────────────

interface LangContextProps {
  currentLang: string;
  setCurrentLang: Dispatch<React.SetStateAction<string>>;
}

const langContext = createContext<LangContextProps | undefined>(undefined);

export const LangContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { storageKeys } = useStoreConfig();

  const [currentLang, setCurrentLang] = useState<string>(() => {
    const lang = sessionStorage.getItem(storageKeys.language);
    if (lang) return JSON.parse(lang);
    return 'العربية';
  });

  useEffect(() => {
    if (import.meta.env.DEV && !i18n.isInitialized) {
      console.error(
        '[storefront-core] i18next is not initialized — the host app must import its i18n.ts ' +
        '(calling i18n.init(...)) before rendering <StorefrontApp>.'
      );
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(storageKeys.language, JSON.stringify(currentLang));
    i18n.changeLanguage(selectedLang(currentLang));
  }, [currentLang, storageKeys.language]);

  return (
    <langContext.Provider value={{ currentLang, setCurrentLang }}>
      <div>{children}</div>
    </langContext.Provider>
  );
};

export default i18n;

export const useLangContext = (): LangContextProps => {
  const context = useContext(langContext);
  if (context === undefined) {
    throw new Error('useLangContext must be used within a LangContextProvider');
  }
  return context;
};
