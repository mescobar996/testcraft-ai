"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Keyboard, X, Zap, FileText, Download, Star, Search } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  category?: string;
}

interface KeyboardShortcutsProps {
  shortcuts: ShortcutAction[];
}

// Categorías de shortcuts
const CATEGORIES = {
  generation: { label: "Generación", labelEn: "Generation", icon: Zap, color: "text-violet-400" },
  navigation: { label: "Navegación", labelEn: "Navigation", icon: Search, color: "text-blue-400" },
  actions: { label: "Acciones", labelEn: "Actions", icon: FileText, color: "text-green-400" },
  export: { label: "Exportación", labelEn: "Export", icon: Download, color: "text-yellow-400" },
  favorites: { label: "Favoritos", labelEn: "Favorites", icon: Star, color: "text-orange-400" }
};

// Shortcuts globales adicionales
const GLOBAL_SHORTCUTS: ShortcutAction[] = [
  {
    key: "h",
    ctrl: true,
    description: "Ir al inicio",
    action: () => window.location.href = "/",
    category: "navigation"
  },
  {
    key: "s",
    ctrl: true,
    description: "Ir a configuración",
    action: () => window.location.href = "/settings",
    category: "navigation"
  },
  {
    key: "p",
    ctrl: true,
    description: "Ver planes y precios",
    action: () => window.location.href = "/pricing",
    category: "navigation"
  },
  {
    key: "k",
    ctrl: true,
    description: "Buscar (Command palette)",
    action: () => console.log("Command palette - próximamente"),
    category: "navigation"
  },
  {
    key: "n",
    ctrl: true,
    description: "Nueva generación",
    action: () => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.select();
      }
    },
    category: "generation"
  },
  {
    key: "r",
    ctrl: true,
    description: "Limpiar formulario",
    action: () => window.location.reload(),
    category: "actions"
  },
  {
    key: "/",
    description: "Enfocar búsqueda",
    action: () => {
      const searchInput = document.querySelector('input[type="search"]');
      if (searchInput instanceof HTMLInputElement) {
        searchInput.focus();
      }
    },
    category: "navigation"
  }
];

export function useKeyboardShortcuts(shortcuts: ShortcutAction[]) {
  useEffect(() => {
    const allShortcuts = [...shortcuts, ...GLOBAL_SHORTCUTS];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Permitir shortcuts en inputs solo si es Ctrl+Enter o shortcuts globales con Ctrl
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (!(e.ctrlKey || e.metaKey) && e.key !== "/") {
          return;
        }
      }

      for (const shortcut of allShortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + ? para abrir/cerrar
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      // Escape para cerrar
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const formatKey = (shortcut: ShortcutAction) => {
    const parts = [];
    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    if (shortcut.ctrl) parts.push(isMac ? "⌘" : "Ctrl");
    if (shortcut.shift) parts.push(isMac ? "⇧" : "Shift");
    if (shortcut.alt) parts.push(isMac ? "⌥" : "Alt");
    parts.push(shortcut.key.toUpperCase());

    return parts.join(" + ");
  };

  // Combinar shortcuts personalizados con globales
  const allShortcuts = [...shortcuts, ...GLOBAL_SHORTCUTS];

  // Agrupar por categoría
  const groupedShortcuts = allShortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || "actions";
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutAction[]>);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white relative group"
        title="Atajos de teclado (Shift + ?)"
      >
        <Keyboard className="w-4 h-4" />
        <span className="ml-2 hidden md:inline text-xs">
          Shift + ?
        </span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-violet-600/10 to-purple-600/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                    <Keyboard className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {language === "es" ? "Atajos de Teclado" : "Keyboard Shortcuts"}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {language === "es" ? "Trabaja más rápido con atajos" : "Work faster with shortcuts"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Shortcuts List - Agrupados por categoría */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {Object.entries(groupedShortcuts).map(([categoryKey, categoryShortcuts]) => {
                  const category = CATEGORIES[categoryKey as keyof typeof CATEGORIES];
                  if (!category || categoryShortcuts.length === 0) return null;

                  const Icon = category.icon;

                  return (
                    <div key={categoryKey} className="space-y-3">
                      {/* Category Header */}
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <Icon className={`w-4 h-4 ${category.color}`} />
                        <h3 className={`text-sm font-semibold ${category.color}`}>
                          {language === "es" ? category.label : category.labelEn}
                        </h3>
                      </div>

                      {/* Category Shortcuts */}
                      <div className="space-y-2">
                        {categoryShortcuts.map((shortcut, index) => (
                          <div
                            key={`${categoryKey}-${index}`}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
                          >
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                              {shortcut.description}
                            </span>
                            <kbd className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-violet-400 font-mono shadow-sm group-hover:border-violet-500/50 transition-colors">
                              {formatKey(shortcut)}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Help Shortcut */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
                    <span className="text-sm text-violet-300 font-medium">
                      {language === "es" ? "Mostrar/ocultar este panel" : "Show/hide this panel"}
                    </span>
                    <kbd className="px-3 py-1.5 bg-violet-900/50 border border-violet-500/50 rounded-lg text-xs text-violet-300 font-mono shadow-sm">
                      Shift + ?
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-800/30">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {language === "es" ? "Presiona" : "Press"}{" "}
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-violet-400 font-mono">Esc</kbd>{" "}
                    {language === "es" ? "para cerrar" : "to close"}
                  </span>
                  <span className="text-slate-600">
                    {allShortcuts.length} {language === "es" ? "atajos disponibles" : "shortcuts available"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom scrollbar styles */}
          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgb(15 23 42);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgb(71 85 105);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgb(100 116 139);
            }
          `}</style>
        </>
      )}
    </>
  );
}

/**
 * Componente para mostrar el shortcut en un botón
 */
export function ShortcutBadge({ shortcut }: { shortcut: string }) {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const displayShortcut = shortcut.replace('Ctrl', isMac ? '⌘' : 'Ctrl');

  return (
    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 font-mono">
      {displayShortcut}
    </kbd>
  );
}
