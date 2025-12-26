import { NextResponse } from 'next/server';
import { generateEmailContent, type EmailSequenceStep } from '@/lib/email-nurturing';

/**
 * API endpoint para enviar emails de nurturing del trial
 * POST /api/email/send-nurturing
 *
 * Body:
 * {
 *   userEmail: string,
 *   userName: string,
 *   template: string,
 *   trialDaysRemaining: number,
 *   language: 'es' | 'en'
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, userName, template, trialDaysRemaining, language = 'es' } = body;

    // Validar parámetros
    if (!userEmail || !userName || !template) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generar contenido del email
    const emailContent = generateEmailContent(template, userName, trialDaysRemaining, language);

    // En desarrollo, solo logueamos el email (no enviamos realmente)
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email de nurturing (DEV MODE - no enviado):');
      console.log('To:', userEmail);
      console.log('Subject:', emailContent.subject);
      console.log('Template:', template);
      console.log('Days remaining:', trialDaysRemaining);
      console.log('---');

      return NextResponse.json({
        success: true,
        message: 'Email logged in development mode',
        preview: {
          to: userEmail,
          subject: emailContent.subject,
          template
        }
      });
    }

    // En producción, enviar email real con Resend
    if (process.env.RESEND_API_KEY) {
      try {
        // Importación dinámica de Resend
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
          from: 'TestCraft AI <onboarding@resend.dev>', // Cambiar en producción
          to: [userEmail],
          subject: emailContent.subject,
          html: emailContent.htmlContent,
          text: emailContent.textContent
        });

        if (error) {
          console.error('Resend error:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Email sent successfully',
          emailId: data?.id || 'sent-' + Date.now()
        });
      } catch (resendError) {
        console.error('Failed to send email with Resend:', resendError);
        return NextResponse.json(
          { error: 'Failed to send email' },
          { status: 500 }
        );
      }
    }

    // Si no hay API key configurada, simular envío
    console.log('⚠️ RESEND_API_KEY not configured - email not sent');
    return NextResponse.json({
      success: true,
      message: 'Email simulated (no API key configured)',
      emailId: 'simulated-' + Date.now()
    });

  } catch (error) {
    console.error('Error sending nurturing email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email/send-nurturing
 * Endpoint de diagnóstico para ver status del servicio de emails
 */
export async function GET() {
  return NextResponse.json({
    service: 'Email Nurturing Service',
    status: 'operational',
    mode: process.env.NODE_ENV,
    note: 'In development mode, emails are logged but not sent'
  });
}
