import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import enDict from './en.json';
import hiDict from './hi.json';
import mrDict from './mr.json';

type Lang = 'en' | 'hi' | 'mr';

type Dict = Record<string, string>;

// Use assertions to typecast the imported JSON to Dict. If nesting is used later, adjust accordingly.
const dictionaries: Record<Lang, Dict> = {
  en: enDict as unknown as Dict,
  hi: hiDict as unknown as Dict,
  mr: mrDict as unknown as Dict,
};

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem('harvestiq_lang');
      if (stored === 'en' || stored === 'hi' || stored === 'mr') {
        return stored as Lang;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('harvestiq_lang', lang);
  }, [lang]);

  const t = useMemo(() => {
    return (key: string) => {
      return dictionaries[lang]?.[key] ?? dictionaries.en?.[key] ?? key;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback to English if provider is not mounted to avoid runtime crashes
    return {
      lang: 'en',
      setLang: () => {},
      t: (key: string) => dictionaries.en[key] ?? key,
    } as I18nContextType;
  }
  return ctx;
};
