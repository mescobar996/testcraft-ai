"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
      title={language === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <Globe className="w-4 h-4 mr-1.5" />
      <span className="text-xs font-medium uppercase">{language}</span>
    </Button>
  );
}
