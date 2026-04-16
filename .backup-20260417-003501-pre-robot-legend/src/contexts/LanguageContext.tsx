import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Language = 'bg' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (bg: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'en' || saved === 'bg') ? saved : 'bg';
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'bg' ? 'en' : 'bg');
  }, [lang, setLang]);

  const t = useCallback((bg: string, en: string) => {
    return lang === 'bg' ? bg : en;
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

// Bilingual text component
export function T({ bg, en }: { bg: string; en: string }) {
  return (
    <>
      <span className="bg-text">{bg}</span>
      <span className="en-text">{en}</span>
    </>
  );
}
