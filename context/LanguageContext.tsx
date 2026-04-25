
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { en } from '../locales/en';
import { ptBR } from '../locales/ptBR';

export enum Language {
  EN = 'en',
  PT_BR = 'pt-BR',
}

// Define a type for your translations object
// This is a simplified example; a more complex app might have nested objects.
type TranslationMessages = typeof en; // Assume 'en' has all keys

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof TranslationMessages, options?: Record<string, string | number>) => string;
}

const translations: Record<Language, TranslationMessages> = {
  [Language.EN]: en,
  [Language.PT_BR]: ptBR,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(Language.PT_BR); // Default to Portuguese

  const t = useCallback((key: keyof TranslationMessages, options?: Record<string, string | number>): string => {
    let message = translations[language][key] || translations[Language.EN][key] || key.toString();
    
    if (options && typeof message === 'string') {
      Object.entries(options).forEach(([optionKey, value]) => {
        const placeholder = `{${optionKey}}`;
        // For currency, format with $ or R$ based on language, though this is a simplification
        // A more robust solution would use Intl.NumberFormat
        let displayValue = String(value);
        if (typeof value === 'number' && (optionKey.toLowerCase().includes('cost') || optionKey.toLowerCase().includes('money') || optionKey.toLowerCase().includes('income') || optionKey.toLowerCase().includes('maintenance') || optionKey.toLowerCase().includes('cashflow'))) {
            // No specific R$ formatting here, just using the value for simplicity with the key.
            // The translation string itself should contain $ or R$.
        }
        message = message.replace(new RegExp(placeholder.replace(/([{}])/g, '\\$1'), 'g'), displayValue);

      });
    }
    return message as string; // Cast because TS might think it's still the union if key is not found
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
