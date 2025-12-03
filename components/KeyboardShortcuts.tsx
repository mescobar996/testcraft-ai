"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Keyboard, X } from "lucide-react";

interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: ShortcutAction[];
}

export function useKeyboardShortcuts(shortcuts: ShortcutAction[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (!(e.ctrlKey && e.key === "Enter")) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const formatKey = (shortcut: ShortcutAction) => {
    const parts = [];
    if (shortcut.ctrl) parts.push("Ctrl");
    if (shortcut.shift) parts.push("Shift");
    if (shortcut.alt) parts.push("Alt");
    parts.push(shortcut.key.toUpperCase());
    return parts.join(" + ");
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
        title="Atajos de teclado (Shift + ?)"
      >
        <Keyboard className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden mt-16">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-violet-400" />
                  <h2 className="font-semibold text-white">Atajos de Teclado</h2>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Shortcuts List */}
              <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50"
                  >
                    <span className="text-sm text-slate-300">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-violet-400 font-mono">
                      {formatKey(shortcut)}
                    </kbd>
                  </div>
                ))}
                
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 border-t border-slate-800 mt-2 pt-4">
                  <span className="text-sm text-slate-300">Mostrar/ocultar atajos</span>
                  <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-violet-400 font-mono">
                    Shift + ?
                  </kbd>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-800/30">
                <p className="text-xs text-slate-500 text-center">
                  Presioná <kbd className="px-1 py-0.5 bg-slate-700 rounded text-violet-400">Esc</kbd> para cerrar
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
