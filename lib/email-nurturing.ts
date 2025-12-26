/**
 * Sistema de Email Nurturing para Trial de 14 días
 * Maximiza la conversión trial-to-paid mediante secuencia educativa
 */

export interface EmailSequenceStep {
  day: number;
  subject: string;
  subjectEn: string;
  template: string;
  priority: 'high' | 'normal' | 'low';
}

export interface TrialEmailState {
  userId: string;
  userEmail: string;
  userName: string;
  trialStartDate: string;
  emailsSent: number[];
  nextEmailDay: number | null;
}

const NURTURING_KEY = 'testcraft-email-nurturing';

/**
 * Secuencia de emails durante el trial de 14 días
 */
export const EMAIL_SEQUENCE: EmailSequenceStep[] = [
  {
    day: 0,
    subject: '¡Bienvenido a TestCraft AI Pro Trial! 🚀',
    subjectEn: 'Welcome to TestCraft AI Pro Trial! 🚀',
    template: 'trial-welcome',
    priority: 'high'
  },
  {
    day: 3,
    subject: 'Tips Pro: Saca el máximo provecho de tu trial',
    subjectEn: 'Pro Tips: Get the most out of your trial',
    template: 'trial-tips',
    priority: 'normal'
  },
  {
    day: 7,
    subject: '¿Cómo va tu experiencia con TestCraft AI Pro?',
    subjectEn: 'How is your TestCraft AI Pro experience?',
    template: 'trial-checkup',
    priority: 'normal'
  },
  {
    day: 13,
    subject: '⏰ Último día de trial - Oferta especial dentro',
    subjectEn: '⏰ Last day of trial - Special offer inside',
    template: 'trial-urgent',
    priority: 'high'
  }
];

/**
 * Obtiene el estado de emails para un usuario en trial
 */
export function getEmailNurturingState(userId: string): TrialEmailState | null {
  if (typeof window === 'undefined') return null;

  const key = `${NURTURING_KEY}-${userId}`;
  const saved = localStorage.getItem(key);

  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

/**
 * Inicializa el estado de nurturing cuando un usuario inicia el trial
 */
export function initializeEmailNurturing(
  userId: string,
  userEmail: string,
  userName: string,
  trialStartDate: string
): TrialEmailState {
  if (typeof window === 'undefined') {
    return {
      userId,
      userEmail,
      userName,
      trialStartDate,
      emailsSent: [],
      nextEmailDay: 0
    };
  }

  const state: TrialEmailState = {
    userId,
    userEmail,
    userName,
    trialStartDate,
    emailsSent: [],
    nextEmailDay: 0
  };

  const key = `${NURTURING_KEY}-${userId}`;
  localStorage.setItem(key, JSON.stringify(state));

  return state;
}

/**
 * Marca un email como enviado
 */
export function markEmailAsSent(userId: string, day: number): TrialEmailState | null {
  const state = getEmailNurturingState(userId);
  if (!state) return null;

  // Agregar el día a la lista de emails enviados
  if (!state.emailsSent.includes(day)) {
    state.emailsSent.push(day);
  }

  // Calcular el próximo email a enviar
  const remainingEmails = EMAIL_SEQUENCE
    .filter(step => !state.emailsSent.includes(step.day))
    .sort((a, b) => a.day - b.day);

  state.nextEmailDay = remainingEmails.length > 0 ? remainingEmails[0].day : null;

  const key = `${NURTURING_KEY}-${userId}`;
  localStorage.setItem(key, JSON.stringify(state));

  return state;
}

/**
 * Calcula qué emails deberían enviarse basándose en días transcurridos
 */
export function getPendingEmails(userId: string): EmailSequenceStep[] {
  const state = getEmailNurturingState(userId);
  if (!state) return [];

  const trialStart = new Date(state.trialStartDate);
  const now = new Date();
  const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));

  // Filtrar emails que deberían haberse enviado pero no se han enviado
  return EMAIL_SEQUENCE.filter(step =>
    step.day <= daysPassed && !state.emailsSent.includes(step.day)
  );
}

/**
 * Limpia el estado de nurturing (cuando trial termina o usuario se suscribe)
 */
export function clearEmailNurturing(userId: string): void {
  if (typeof window === 'undefined') return;

  const key = `${NURTURING_KEY}-${userId}`;
  localStorage.removeItem(key);
}

/**
 * Verifica si un usuario debería recibir emails de nurturing
 */
export function shouldSendNurturingEmails(
  isProTrial: boolean,
  isPro: boolean,
  trialDaysRemaining: number
): boolean {
  // No enviar si ya es Pro (se convirtió)
  if (isPro) return false;

  // Enviar solo si está en trial activo
  if (!isProTrial) return false;

  // No enviar si el trial ya expiró
  if (trialDaysRemaining <= 0) return false;

  return true;
}

/**
 * Genera el contenido del email basado en el template
 */
export function generateEmailContent(
  template: string,
  userName: string,
  trialDaysRemaining: number,
  language: 'es' | 'en' = 'es'
): { subject: string; htmlContent: string; textContent: string } {
  const templates = {
    'trial-welcome': {
      es: {
        subject: '¡Bienvenido a TestCraft AI Pro Trial! 🚀',
        html: `
          <h2>¡Hola ${userName}!</h2>
          <p>¡Bienvenido a tu trial de 14 días de TestCraft AI Pro! 🎉</p>

          <h3>Tienes acceso a:</h3>
          <ul>
            <li>✅ <strong>500 generaciones por mes</strong> (vs 10 en Free)</li>
            <li>✅ <strong>Exportación avanzada</strong> en Gherkin, JSON y más</li>
            <li>✅ <strong>Plantillas personalizadas</strong> para tu equipo</li>
            <li>✅ <strong>Soporte prioritario</strong></li>
          </ul>

          <h3>Primeros pasos recomendados:</h3>
          <ol>
            <li>Genera casos de prueba con tus proyectos reales</li>
            <li>Prueba la exportación a Gherkin para Cucumber</li>
            <li>Guarda tus favoritos para reutilizarlos</li>
          </ol>

          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Comenzar ahora</a></p>

          <p>¡Aprovecha al máximo tu trial!</p>
          <p>El equipo de TestCraft AI</p>
        `,
        text: `¡Hola ${userName}! Bienvenido a tu trial de 14 días de TestCraft AI Pro...`
      },
      en: {
        subject: 'Welcome to TestCraft AI Pro Trial! 🚀',
        html: `
          <h2>Hello ${userName}!</h2>
          <p>Welcome to your 14-day TestCraft AI Pro trial! 🎉</p>

          <h3>You now have access to:</h3>
          <ul>
            <li>✅ <strong>500 generations per month</strong> (vs 10 in Free)</li>
            <li>✅ <strong>Advanced export</strong> in Gherkin, JSON and more</li>
            <li>✅ <strong>Custom templates</strong> for your team</li>
            <li>✅ <strong>Priority support</strong></li>
          </ul>

          <h3>Recommended first steps:</h3>
          <ol>
            <li>Generate test cases with your real projects</li>
            <li>Try exporting to Gherkin for Cucumber</li>
            <li>Save your favorites to reuse them</li>
          </ol>

          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Get started now</a></p>

          <p>Make the most of your trial!</p>
          <p>The TestCraft AI team</p>
        `,
        text: `Hello ${userName}! Welcome to your 14-day TestCraft AI Pro trial...`
      }
    },
    'trial-tips': {
      es: {
        subject: 'Tips Pro: Saca el máximo provecho de tu trial',
        html: `
          <h2>¡Hola ${userName}!</h2>
          <p>Llevas 3 días con TestCraft AI Pro. Aquí hay algunos tips para aprovechar al máximo tu trial:</p>

          <h3>💡 Tips Pro</h3>
          <ul>
            <li><strong>Usa el contexto</strong>: Agrega información del proyecto para casos más precisos</li>
            <li><strong>Genera desde imágenes</strong>: Sube screenshots de tu UI para tests visuales</li>
            <li><strong>Exporta a Gherkin</strong>: Integra directo con Cucumber/SpecFlow</li>
            <li><strong>Guarda plantillas</strong>: Reutiliza estructuras para proyectos similares</li>
          </ul>

          <p><strong>Te quedan ${trialDaysRemaining} días</strong> para explorar todas las features Pro.</p>

          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Continuar generando</a></p>

          <p>¿Preguntas? Responde este email, estamos aquí para ayudarte.</p>
        `,
        text: `¡Hola ${userName}! Llevas 3 días con TestCraft AI Pro...`
      },
      en: {
        subject: 'Pro Tips: Get the most out of your trial',
        html: `
          <h2>Hello ${userName}!</h2>
          <p>You've been using TestCraft AI Pro for 3 days. Here are some tips to maximize your trial:</p>

          <h3>💡 Pro Tips</h3>
          <ul>
            <li><strong>Use context</strong>: Add project information for more accurate cases</li>
            <li><strong>Generate from images</strong>: Upload UI screenshots for visual tests</li>
            <li><strong>Export to Gherkin</strong>: Integrate directly with Cucumber/SpecFlow</li>
            <li><strong>Save templates</strong>: Reuse structures for similar projects</li>
          </ul>

          <p><strong>You have ${trialDaysRemaining} days left</strong> to explore all Pro features.</p>

          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Continue generating</a></p>

          <p>Questions? Reply to this email, we're here to help.</p>
        `,
        text: `Hello ${userName}! You've been using TestCraft AI Pro for 3 days...`
      }
    },
    'trial-checkup': {
      es: {
        subject: '¿Cómo va tu experiencia con TestCraft AI Pro?',
        html: `
          <h2>¡Hola ${userName}!</h2>
          <p>Ya llevas una semana usando TestCraft AI Pro. ¿Cómo va tu experiencia?</p>

          <h3>📊 Valor que estás obteniendo:</h3>
          <ul>
            <li>Generación ilimitada de casos de prueba</li>
            <li>Ahorro de horas en documentación manual</li>
            <li>Cobertura más completa con casos positivos, negativos y de borde</li>
          </ul>

          <h3>💬 Nos encantaría saber:</h3>
          <ul>
            <li>¿Qué feature te ha gustado más?</li>
            <li>¿Algo que mejorarías?</li>
            <li>¿Planeas continuar con Pro?</li>
          </ul>

          <p><strong>Te quedan ${trialDaysRemaining} días de trial.</strong></p>

          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Ver planes</a></p>

          <p>Responde este email con tus comentarios. ¡Nos importa tu feedback!</p>
        `,
        text: `¡Hola ${userName}! Ya llevas una semana usando TestCraft AI Pro...`
      },
      en: {
        subject: 'How is your TestCraft AI Pro experience?',
        html: `
          <h2>Hello ${userName}!</h2>
          <p>You've been using TestCraft AI Pro for a week. How's your experience?</p>

          <h3>📊 Value you're getting:</h3>
          <ul>
            <li>Unlimited test case generation</li>
            <li>Hours saved on manual documentation</li>
            <li>More complete coverage with positive, negative and edge cases</li>
          </ul>

          <h3>💬 We'd love to know:</h3>
          <ul>
            <li>What feature did you like the most?</li>
            <li>Anything you'd improve?</li>
            <li>Planning to continue with Pro?</li>
          </ul>

          <p><strong>You have ${trialDaysRemaining} days of trial left.</strong></p>

          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View plans</a></p>

          <p>Reply to this email with your feedback. We care about your input!</p>
        `,
        text: `Hello ${userName}! You've been using TestCraft AI Pro for a week...`
      }
    },
    'trial-urgent': {
      es: {
        subject: '⏰ Último día de trial - Oferta especial dentro',
        html: `
          <h2>¡Hola ${userName}!</h2>
          <p><strong style="color: #EF4444;">Tu trial termina mañana.</strong> No pierdas acceso a todas las features Pro.</p>

          <h3>🎁 Oferta especial de último momento:</h3>
          <p style="background: #FEF3C7; padding: 16px; border-left: 4px solid #F59E0B; border-radius: 8px;">
            <strong>20% de descuento</strong> en tu primer mes si te suscribes hoy.<br/>
            Código: <code style="background: white; padding: 4px 8px; border-radius: 4px;">TRIAL20</code>
          </p>

          <h3>Lo que perderás mañana:</h3>
          <ul>
            <li>❌ 500 generaciones/mes → Solo 10/mes</li>
            <li>❌ Exportación avanzada (Gherkin, JSON)</li>
            <li>❌ Plantillas personalizadas</li>
            <li>❌ Soporte prioritario</li>
          </ul>

          <h3>Lo que mantendrás con Pro:</h3>
          <ul>
            <li>✅ 500 generaciones cada mes</li>
            <li>✅ Todas las exportaciones</li>
            <li>✅ Plantillas ilimitadas</li>
            <li>✅ Soporte prioritario</li>
          </ul>

          <p><strong>Solo $29/mes</strong> - cancela cuando quieras.</p>

          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing?code=TRIAL20" style="background: #8B5CF6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold;">Actualizar a Pro ahora</a></p>

          <p style="color: #6B7280; font-size: 14px;">Esta oferta expira en 24 horas.</p>
        `,
        text: `¡Hola ${userName}! Tu trial termina mañana. Usa el código TRIAL20 para 20% de descuento...`
      },
      en: {
        subject: '⏰ Last day of trial - Special offer inside',
        html: `
          <h2>Hello ${userName}!</h2>
          <p><strong style="color: #EF4444;">Your trial ends tomorrow.</strong> Don't lose access to all Pro features.</p>

          <h3>🎁 Last minute special offer:</h3>
          <p style="background: #FEF3C7; padding: 16px; border-left: 4px solid #F59E0B; border-radius: 8px;">
            <strong>20% off</strong> your first month if you subscribe today.<br/>
            Code: <code style="background: white; padding: 4px 8px; border-radius: 4px;">TRIAL20</code>
          </p>

          <h3>What you'll lose tomorrow:</h3>
          <ul>
            <li>❌ 500 generations/month → Only 10/month</li>
            <li>❌ Advanced export (Gherkin, JSON)</li>
            <li>❌ Custom templates</li>
            <li>❌ Priority support</li>
          </ul>

          <h3>What you'll keep with Pro:</h3>
          <ul>
            <li>✅ 500 generations every month</li>
            <li>✅ All exports</li>
            <li>✅ Unlimited templates</li>
            <li>✅ Priority support</li>
          </ul>

          <p><strong>Just $29/month</strong> - cancel anytime.</p>

          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing?code=TRIAL20" style="background: #8B5CF6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold;">Upgrade to Pro now</a></p>

          <p style="color: #6B7280; font-size: 14px;">This offer expires in 24 hours.</p>
        `,
        text: `Hello ${userName}! Your trial ends tomorrow. Use code TRIAL20 for 20% off...`
      }
    }
  };

  const content = templates[template as keyof typeof templates]?.[language];

  if (!content) {
    return {
      subject: 'TestCraft AI',
      htmlContent: '<p>Email content</p>',
      textContent: 'Email content'
    };
  }

  return {
    subject: content.subject,
    htmlContent: content.html,
    textContent: content.text
  };
}
