"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // --- CORRECCIÓN DE HIDRATACIÓN ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Si no ha montado, mostramos el botón pero sin icono, 
  // para evitar que el servidor renderice "Sol" y el cliente "Luna".
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
      >
        <div className="w-4 h-4" /> {/* Espacio vacío del mismo tamaño */}
      </Button>
    );
  }
  // ---------------------------------

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
}