import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/common.json';
import id from '../locales/id/common.json';

export type Lang = 'en' | 'id';

const STORAGE_KEY = 'anatosphere.language';

function initialLanguage(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'id') return saved;
  } catch {
    // Storage can be blocked; fall through to the browser language.
  }
  return navigator.language?.toLowerCase().startsWith('id') ? 'id' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, id: { translation: id } },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

const syncDocument = (lang: string) => {
  document.documentElement.lang = lang;
};
syncDocument(i18n.language);

i18n.on('languageChanged', (lang) => {
  syncDocument(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // The choice just won't persist.
  }
});

export default i18n;
