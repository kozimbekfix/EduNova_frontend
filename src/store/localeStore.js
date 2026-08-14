import { create } from 'zustand';
import translations from '../utils/translations';

const getInitialLocale = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('edunova-locale') || 'en';
  }
  return 'en';
};

const translate = (locale, key, fallback = '') => {
  const trans = translations[locale];
  return trans?.[key] || fallback || key;
};

const useLocaleStore = create((set, get) => ({
  locale: getInitialLocale(),
  localeVersion: 0,

  setLocale: (locale) => {
    localStorage.setItem('edunova-locale', locale);
    set({ locale, localeVersion: get().localeVersion + 1 });
  },

  t: (key, fallback = '') => {
    const { locale } = get();
    return translate(locale, key, fallback);
  },
}));

export default useLocaleStore;
