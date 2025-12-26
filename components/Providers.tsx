"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";
import { EmailNurturingTrigger } from "@/components/EmailNurturingTrigger";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            {/* EmailNurturingTrigger se ejecuta en segundo plano */}
            <EmailNurturingTrigger />
            {children}
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
