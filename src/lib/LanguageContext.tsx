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

/** Selects a language in the (hidden) Google Translate widget, if it has loaded. */
function selectGoogleTranslate(lang: Language): boolean {
  try {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
      return true;
    }
  } catch {}
  return false;
}

/**
 * Google Translate is only a fallback for text without an English version, so its script
 * (~100KB+ of third-party JS) is loaded on demand when a visitor switches to English,
 * instead of on every page for every visitor.
 */
function applyGoogleTranslate(lang: Language) {
  if (typeof window === "undefined") return;
  if (selectGoogleTranslate(lang)) return;
  if (lang !== "en") return;

  const w = window as any;
  if (!document.getElementById("google_translate_element")) {
    const mount = document.createElement("div");
    mount.id = "google_translate_element";
    mount.style.cssText = "position:absolute;opacity:0;pointer-events:none;z-index:-100";
    document.body.appendChild(mount);
  }
  if (document.getElementById("google-translate-script")) return;

  w.googleTranslateElementInit = () => {
    try {
      new w.google.translate.TranslateElement({ pageLanguage: "bn", autoDisplay: false }, "google_translate_element");
    } catch {}
    // The widget's <select> appears shortly after init.
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (selectGoogleTranslate("en") || tries > 20) clearInterval(timer);
    }, 250);
  };
  const script = document.createElement("script");
  script.id = "google-translate-script";
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("bn");

  useEffect(() => {
    const saved = localStorage.getItem("site_lang") as Language;
    if (saved === "en" || saved === "bn") {
      setLanguage(saved);
      if (saved === "en") applyGoogleTranslate("en");
    }
  }, []);

  const setLang = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("site_lang", lang);
    document.cookie = `site_lang=${lang}; path=/; max-age=31536000`;
    applyGoogleTranslate(lang);
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
