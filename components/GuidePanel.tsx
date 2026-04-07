"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, BookOpen, Lightbulb, X, Zap, Copy, Search, Download } from "lucide-react";

interface ShortcutItem {
  keys: string;
  description: string;
  descriptionEn: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: "Ctrl + Enter", description: "Generar casos de prueba", descriptionEn: "Generate test cases" },
  { keys: "Ctrl + G", description: "Copiar Gherkin al portapapeles", descriptionEn: "Copy Gherkin to clipboard" },
  { keys: "Ctrl + Shift + C", description: "Copiar todos los casos", descriptionEn: "Copy all test cases" },
  { keys: "Ctrl + F", description: "Focar campo de requisito", descriptionEn: "Focus requirement input" },
  { keys: "Shift + ?", description: "Abrir/cerrar esta guía", descriptionEn: "Toggle this guide" },
  { keys: "Esc", description: "Cerrar paneles y modales", descriptionEn: "Close panels and modals" },
];

const TIPS = [
  { text: "Escribí requisitos detallados con criterios de aceptación para mejores resultados.", textEn: "Write detailed requirements with acceptance criteria for better results." },
  { text: "Usá el motor Template para resultados instantáneos sin consumo de IA.", textEn: "Use the Template engine for instant results without AI consumption." },
  { text: "Guardá casos favoritos para acceso rápido desde la pestaña Favoritos.", textEn: "Save favorite cases for quick access from the Favorites tab." },
  { text: "Exportá a Jira CSV o TestRail CSV para importar directo a tus herramientas.", textEn: "Export to Jira CSV or TestRail CSV to import directly to your tools." },
];

export function GuidePanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
        onClick={() => setIsOpen(true)}
        title="Ayuda y atajos (Shift + ?)"
        aria-label="Abrir guía de ayuda"
      >
        <HelpCircle className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg bg-zinc-950 sm:rounded-2xl border border-white/[0.06] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-transparent p-5 sm:p-6 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Guía Rápida</h2>
                  <p className="text-xs text-zinc-400">Atajos de teclado y tips de uso</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 max-h-[70vh]">
              {/* Keyboard Shortcuts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">Atajos de Teclado</h3>
                </div>
                <div className="space-y-1.5">
                  {SHORTCUTS.map((shortcut) => (
                    <div
                      key={shortcut.keys}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
                    >
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded-md text-xs text-violet-400 font-mono shadow-sm whitespace-nowrap ml-3">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">Tips de Uso</h3>
                </div>
                <div className="space-y-2">
                  {TIPS.map((tip, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/15 text-violet-400 text-xs flex items-center justify-center font-medium mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-sm text-zinc-400 leading-relaxed">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.06] bg-zinc-900/50 flex-shrink-0">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <span>
                  Presioná <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded text-zinc-400 font-mono">Esc</kbd> para cerrar
                </span>
                <span className="text-zinc-600">TestCraft AI v1.0</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
