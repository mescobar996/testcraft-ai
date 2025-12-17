import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a TestCraft</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Política de Privacidad
        </h1>
        <p className="text-slate-400 mb-8">
          Última actualización: Diciembre 2024
        </p>

        <div className="prose prose-invert prose-slate max-w-none">
          <div className="space-y-8 text-slate-300">
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Introducción</h2>
              <p>
                En TestCraft AI ("nosotros", "nuestro" o "el Servicio"), respetamos tu privacidad 
                y nos comprometemos a proteger tus datos personales. Esta Política de Privacidad 
                explica cómo recopilamos, usamos y protegemos tu información.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Información que Recopilamos</h2>
              
              <h3 className="text-lg font-medium text-white mt-4 mb-2">2.1 Información de Cuenta</h3>
              <p>Cuando te registrás con Google OAuth, recopilamos:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Nombre completo</li>
                <li>Dirección de correo electrónico</li>
                <li>Foto de perfil (si está disponible)</li>
                <li>Identificador único de Google</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-2">2.2 Datos de Uso</h3>
              <p>Recopilamos información sobre cómo usás el Servicio:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Requisitos ingresados para generar casos de prueba</li>
                <li>Historial de generaciones</li>
                <li>Preferencias y configuraciones</li>
                <li>Casos marcados como favoritos</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-2">2.3 Datos Técnicos</h3>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Dirección IP</li>
                <li>Tipo de navegador y dispositivo</li>
                <li>Sistema operativo</li>
                <li>Páginas visitadas y tiempo de uso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Cómo Usamos tu Información</h2>
              <p>Utilizamos la información recopilada para:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Proporcionar y mantener el Servicio</li>
                <li>Procesar tus solicitudes de generación de casos de prueba</li>
                <li>Guardar tu historial y preferencias</li>
                <li>Mejorar y personalizar tu experiencia</li>
                <li>Enviar comunicaciones importantes sobre el Servicio</li>
                <li>Detectar y prevenir fraudes o abusos</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Procesamiento por IA</h2>
              <p>
                Los requisitos que ingresás son procesados por modelos de inteligencia artificial 
                (Claude de Anthropic) para generar casos de prueba. Este procesamiento:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Se realiza en tiempo real para cada solicitud</li>
                <li>No almacena tus datos en los modelos de IA</li>
                <li>Está sujeto a las políticas de privacidad de Anthropic</li>
              </ul>
              <p className="mt-2">
                Te recomendamos no incluir información personal sensible, contraseñas o datos 
                confidenciales en los requisitos que ingreses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Almacenamiento y Seguridad</h2>
              <p>
                Tus datos se almacenan de forma segura en servidores de Supabase y Vercel. 
                Implementamos medidas de seguridad que incluyen:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Encriptación de datos en tránsito (HTTPS/TLS)</li>
                <li>Encriptación de datos en reposo</li>
                <li>Autenticación segura mediante OAuth 2.0</li>
                <li>Acceso restringido a datos personales</li>
                <li>Monitoreo de seguridad continuo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Compartir Información</h2>
              <p>No vendemos ni alquilamos tu información personal. Podemos compartirla con:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Proveedores de servicios:</strong> Supabase (base de datos), Vercel (hosting), Stripe (pagos), Anthropic (IA)</li>
                <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o proceso legal</li>
                <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos, privacidad, seguridad o propiedad</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Tus Derechos</h2>
              <p>Tenés derecho a:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de tus datos</li>
                <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
                <li><strong>Retiro del consentimiento:</strong> Retirar tu consentimiento en cualquier momento</li>
              </ul>
              <p className="mt-2">
                Para ejercer estos derechos, contactanos en{" "}
                <a href="mailto:privacidad@testcraft.ai" className="text-violet-400 hover:text-violet-300">
                  privacidad@testcraft.ai
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Retención de Datos</h2>
              <p>Conservamos tus datos mientras:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Tu cuenta esté activa</li>
                <li>Sea necesario para proporcionarte el Servicio</li>
                <li>Tengamos obligaciones legales de retención</li>
              </ul>
              <p className="mt-2">
                El historial de generaciones se conserva según tu plan (7 días para Free, 
                ilimitado para Pro). Podés eliminar tu historial manualmente en cualquier momento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Cookies</h2>
              <p>Utilizamos cookies esenciales para:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Mantener tu sesión iniciada</li>
                <li>Recordar tus preferencias</li>
                <li>Garantizar la seguridad del Servicio</li>
              </ul>
              <p className="mt-2">
                No utilizamos cookies de seguimiento o publicidad de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Menores de Edad</h2>
              <p>
                El Servicio no está dirigido a menores de 18 años. No recopilamos intencionalmente 
                información de menores. Si sos padre o tutor y creés que tu hijo nos ha proporcionado 
                información personal, contactanos para eliminarla.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">11. Cambios a esta Política</h2>
              <p>
                Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos 
                de cambios significativos por email o mediante un aviso en el Servicio. La fecha 
                de "última actualización" indica cuándo se realizaron los últimos cambios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">12. Contacto</h2>
              <p>
                Si tenés preguntas sobre esta Política de Privacidad o sobre cómo manejamos 
                tus datos, contactanos en:
              </p>
              <ul className="list-none mt-2 space-y-1">
                <li>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacidad@testcraft.ai" className="text-violet-400 hover:text-violet-300">
                    privacidad@testcraft.ai
                  </a>
                </li>
              </ul>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2024 TestCraft AI. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="text-slate-500 hover:text-white transition-colors">
              Términos
            </Link>
            <Link href="/privacy" className="text-violet-400">
              Privacidad
            </Link>
            <Link href="/pricing" className="text-slate-500 hover:text-white transition-colors">
              Precios
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
