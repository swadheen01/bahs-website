"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "bn" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLang: (lang: Language) => void;
  t: (bn: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "bn",
  toggleLanguage: () => {},
  setLang: () => {},
  t: (bn) => bn,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("bn");

  useEffect(() => {
    const saved = localStorage.getItem("site_lang") as Language;
    if (saved === "en" || saved === "bn") {
      setLanguage(saved);
    }
  }, []);

  const setLang = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("site_lang", lang);
    document.cookie = `site_lang=${lang}; path=/; max-age=31536000`;

    // Also trigger google translate if available
    try {
      const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event("change"));
      }
    } catch (e) {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    setLang(language === "bn" ? "en" : "bn");
  };

  const t = (bn: string, en: string) => {
    return language === "en" ? en : bn;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
