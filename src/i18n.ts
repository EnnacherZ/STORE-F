/**
 * i18n.ts
 *
 * i18next initialization lives here (in the app), not in
 * @firdaous/storefront-core, because the actual translation CONTENT is
 * store-specific. Core only owns the i18n context/mechanism
 * (LangContextProvider/useLangContext) and calls i18n.changeLanguage(...)
 * on whatever instance the host app has already initialized.
 *
 * Import this as a side effect before rendering <StorefrontApp>.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import fr from './locales/fr';
import ar from './locales/ar';

i18n
  .use(initReactI18next)
  .init({
    resources: { en, fr, ar },
    lng: 'fr',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
