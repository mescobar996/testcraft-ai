"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import {
  getEmailNurturingState,
  getPendingEmails,
  markEmailAsSent,
  shouldSendNurturingEmails
} from "@/lib/email-nurturing";

/**
 * Componente invisible que verifica y envía emails de nurturing del trial
 * Se ejecuta en segundo plano cuando el usuario está en trial activo
 */
export function EmailNurturingTrigger() {
  const { user, isPro, isProTrial, trialInfo } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    // Solo ejecutar si hay usuario y está en trial activo
    if (!user || !isProTrial || !trialInfo) return;

    const daysRemaining = trialInfo.daysRemaining || 0;

    // Verificar si deberíamos enviar emails
    if (!shouldSendNurturingEmails(isProTrial, isPro, daysRemaining)) {
      return;
    }

    // Obtener estado de nurturing
    const state = getEmailNurturingState(user.id);
    if (!state) return;

    // Obtener emails pendientes
    const pendingEmails = getPendingEmails(user.id);

    // Si hay emails pendientes, enviarlos
    if (pendingEmails.length > 0) {
      pendingEmails.forEach(async (emailStep) => {
        try {
          // Enviar email a través del API
          const response = await fetch('/api/email/send-nurturing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: state.userEmail,
              userName: state.userName,
              template: emailStep.template,
              trialDaysRemaining: daysRemaining,
              language
            })
          });

          if (response.ok) {
            // Marcar como enviado
            markEmailAsSent(user.id, emailStep.day);
            console.log(`✅ Email de día ${emailStep.day} enviado exitosamente`);
          } else {
            console.error(`❌ Error enviando email de día ${emailStep.day}`);
          }
        } catch (error) {
          console.error(`❌ Error enviando email de día ${emailStep.day}:`, error);
        }
      });
    }
  }, [user, isPro, isProTrial, trialInfo, language]);

  // Componente invisible, no renderiza nada
  return null;
}
