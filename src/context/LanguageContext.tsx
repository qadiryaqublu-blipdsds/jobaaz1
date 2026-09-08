import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Language, SUPPORTED_LANGUAGES, LanguageOption } from '../i18n/types';
import { translations, Translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dict: Translations;
  t: (keyPath: string, fallback?: string) => string;
  currentLangOption: LanguageOption;
  brandAcronym: string;
  brandSlogan: string;
  brandAcronymFull: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'jobia_selected_language';

/**
 * Deep Proxy fallback generator that automatically falls back to default language (az)
 * if any property or nested property in the chosen language is missing or undefined.
 */
function createFallbackProxy<T extends object>(target: T, fallback: T): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const val = Reflect.get(obj, prop, receiver);
      const fallbackVal = (fallback as any)?.[prop];

      if (val === undefined || val === null || val === '') {
        return fallbackVal;
      }

      if (
        typeof val === 'object' &&
        val !== null &&
        !Array.isArray(val) &&
        typeof fallbackVal === 'object' &&
        fallbackVal !== null
      ) {
        return createFallbackProxy(val, fallbackVal);
      }

      return val;
    },
  });
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'az' || saved === 'en' || saved === 'ru')) {
        return saved as Language;
      }
    } catch {}
    return 'az';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = 'ltr';
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jobia_language_change', { detail: { language: lang } }));
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  // Robust dict with recursive fallback to Azerbaijani
  const dict = useMemo(() => {
    const rawTarget = translations[language] || translations.az;
    return createFallbackProxy(rawTarget, translations.az) as Translations;
  }, [language]);

  // Dot-notation translation helper with automatic fallback
  const t = useMemo(() => {
    return (keyPath: string, fallback?: string): string => {
      if (!keyPath) return fallback || '';
      const parts = keyPath.split('.');
      let current: any = dict;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          // Fallback directly to az dictionary
          let fbCurrent: any = translations.az;
          for (const fbPart of parts) {
            if (fbCurrent && typeof fbCurrent === 'object' && fbPart in fbCurrent) {
              fbCurrent = fbCurrent[fbPart];
            } else {
              return fallback || keyPath;
            }
          }
          return typeof fbCurrent === 'string' ? fbCurrent : (fallback || keyPath);
        }
      }

      return typeof current === 'string' ? current : (fallback || keyPath);
    };
  }, [dict]);

  const currentLangOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        dict,
        t,
        currentLangOption,
        brandAcronym: dict.brand.acronym,
        brandSlogan: dict.brand.slogan,
        brandAcronymFull: dict.brand.acronymFull,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'az',
      setLanguage: () => {},
      dict: translations.az,
      t: (k, fb) => fb || k,
      currentLangOption: SUPPORTED_LANGUAGES[0],
      brandAcronym: translations.az.brand.acronym,
      brandSlogan: translations.az.brand.slogan,
      brandAcronymFull: translations.az.brand.acronymFull,
    };
  }
  return context;
};

