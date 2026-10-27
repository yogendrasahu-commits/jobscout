import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('jobscout_lang') || 'en';
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('jobscout_lang', lang);
    }
  };

  const t = (key, fallback = '') => {
    const dict = translations[language] || translations.en;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to English
    return translations.en[key] || fallback || key;
  };

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी', short: 'हिं' },
    { code: 'mr', label: 'मराठी', short: 'मरा' }
  ];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, fallback = '') => translations.en[key] || fallback || key,
      languages: [
        { code: 'en', label: 'English', short: 'EN' },
        { code: 'hi', label: 'हिंदी', short: 'हिं' },
        { code: 'mr', label: 'मराठी', short: 'मरा' }
      ]
    };
  }
  return ctx;
};
