import { useEffect, useState } from "react";
import type { Language } from "../i18n";

const storageKey = "infrastructure-ui-language";
const defaultLanguage: Language = "ru";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem(storageKey);
    return savedLanguage === "en" || savedLanguage === "ru" ? savedLanguage : defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, language);
  }, [language]);

  const toggleLanguage = () => setLanguage((value) => (value === "ru" ? "en" : "ru"));

  return {
    language,
    toggleLanguage,
  };
}
