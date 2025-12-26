import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | TestCraft AI",
  description: "Política de privacidad y protección de datos personales de TestCraft AI",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-violet-500/20 bg-purple-950/60 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-violet-500/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a TestCraft AI</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Política de Privacidad</h1>
            <p className="text-gray-400">Última actualización: Enero 2025</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <p className="text-gray-300">
            En TestCraft AI nos comprometemos a proteger tu privacidad y tus datos personales.
            Esta política describe cómo recopilamos, utilizamos, almacenamos y protegemos tu información
            de conformidad con la Ley N° 25.326 de Protección de Datos Personales de la República Argentina
            y las mejores prácticas internacionales de privacidad.
          </p>
        </div>

        <div className="space-y-8 text-gray-300">
          
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm font-bold">1</span>
              Responsable del Tratamiento
            </h2>
            <div className="pl-10 space-y-3">
              <p>El responsable del tratamiento de tus datos personales es:</p>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <p><strong className="text-white">TestCraft AI</strong></p>
                <p>Correo electrónico: <a href="mailto:testcraftia@gmail.com" className="text-violet-400 hover:text-violet-300">testcraftia@gmail.com</a></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm font-bold">2</span>
              Datos Personales que Recopilamos
            </h2>
            <div className="pl-10 space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">2.1 Datos de Identificación y Contacto</h3>
                <p>Al registrarte mediante Google OAuth, recopilamos:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-400">
                  <li>Nombre completo</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Fotografía de perfil (si está disponible en tu cuenta de Google)</li>
                  <li>Identificador único de usuario</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">2.2 Datos de Uso del Servicio</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-400">
                  <li>Requisitos de software ingresados para la generación de casos de prueba</li>
                  <li>Casos de prueba generados y su historial</li>
                  <li>Configuraciones y preferencias del usuario</li>
                  <li>Casos marcados como favoritos</li>
                  <li>Registros de actividad y uso de funcionalidades</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">2.3 Datos Técnicos</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-400">
                  <li>Dirección IP</li>
                  <li>Tipo y versión de navegador</li>
                  <li>Sistema operativo y dispositivo</li>
                  <li>Datos de cookies esenciales para el funcionamiento del servicio</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm font-bold">3</span>
              Finalidad del Tratamiento
            </h2>
            <div className="pl-10">
              <p className="mb-3">Utilizamos tus datos personales para las siguientes finalidades:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li><strong className="text-gray-300">Prestación del Servicio:</strong> Generar casos de prueba, gestionar tu cuenta y proporcionar las funcionalidades contratadas.</li>
                <li><strong className="text-gray-300">Mejora del Servicio:</strong> Analizar patrones de uso para optimizar la experiencia del usuario y desarrollar nuevas funcionalidades.</li>
                <li><strong className="text-gray-300">Comunicaciones:</strong> Enviar notificaciones relacionadas con el servicio, actualizaciones y cambios en los términos.</li>
                <li><strong className="text-gray-300">Seguridad:</strong> Detectar, prevenir y responder ante actividades fraudulentas o no autorizadas.</li>
                <li><strong className="text-gray-300">Cumplimiento Legal:</strong> Cumplir con obligaciones legales y responder a requerimientos de autoridades competentes.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm font-bold">4</span>
              Base Legal del Tratamiento
            </h2>
            <div className="pl-10">
              <p>El tratamiento de tus datos se fundamenta en:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-400">
                <li><strong className="text-gray-300">Ejecución contractual:</strong> El tratamiento es necesario para la prestación del servicio que has contratado.</li>
                <li><strong className="text-gray-300">Consentimiento:</strong> Al registrarte y utilizar el servicio, otorgás tu consentimiento libre, expreso e informado.</li>
                <li><strong className="text-gray-300">Interés legítimo:</strong> Para mejorar nuestros servicios y garantizar la seguridad de la plataforma.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm font-bold">5</span>
              Procesamiento mediante Inteligencia Artificial
            </h2>
            <div className="pl-10 space-y-3">
              <p>
                TestCraft AI utiliza modelos de inteligencia artificial proporcionados por Anthropic (Claude) 
                para generar casos de prueba. Es importante que comprendas que:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Los requisitos que ingreses son procesados por sistemas de IA en tiempo real.</li>
                <li>No se utilizan tus datos para entrenar modelos de inteligencia artificial.</li>
                <li>El procesamiento está sujeto a las políticas de privacidad de Anthropic como subprocesador.</li>
              </ul>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                <p className="text-yellow-200 text-sm">
                  <strong>Recomendación:</strong> Te aconsejamos no incluir en los requisitos información 
                  personal sensible, datos confidenciales, contraseñas, información financiera o cualquier 
                  dato que pueda identificar a terceros.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm font-bold">6</span>
              Almacenamiento y Seguridad
            </h2>
            <div className="pl-10 space-y-3">
              <p>Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li><strong className="text-gray-300">Encriptación en tránsito:</strong> Todas las comunicaciones utilizan protocolo HTTPS/TLS.</li>
                <li><strong className="text-gray-300">Encriptación en reposo:</strong> Los datos almacenados están cifrados en servidores seguros.</li>
                <li><strong className="text-gray-300">Autenticación segura:</strong> Utilizamos OAuth 2.0 a través de Google para la autenticación.</li>
                <li><strong className="text-gray-300">Infraestructura:</strong> Nuestros datos se alojan en servidores de Supabase y Vercel con certificaciones de seguridad.</li>
                <li><strong className="text-gray-300">Acceso restringido:</strong> Solo personal autorizado tiene acceso a los datos personales.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm font-bold">7</span>
              Compartición de Datos con Terceros
            </h2>
            <div className="pl-10 space-y-3">
              <p><strong className="text-white">No vendemos ni alquilamos tus datos personales.</strong> Solo compartimos información con:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li><strong className="text-gray-300">Proveedores de servicios esenciales:</strong> Supabase, Vercel, Stripe, Anthropic y Google.</li>
                <li><strong className="text-gray-300">Autoridades competentes:</strong> Cuando sea requerido por ley, orden judicial o requerimiento de autoridad pública.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm font-bold">8</span>
              Tus Derechos
            </h2>
            <div className="pl-10 space-y-3">
              <p>De acuerdo con la Ley N° 25.326, tenés derecho a:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li><strong className="text-gray-300">Acceso:</strong> Solicitar información sobre los datos personales que tenemos sobre vos.</li>
                <li><strong className="text-gray-300">Rectificación:</strong> Corregir datos inexactos o incompletos.</li>
                <li><strong className="text-gray-300">Supresión:</strong> Solicitar la eliminación de tus datos cuando ya no sean necesarios.</li>
                <li><strong className="text-gray-300">Actualización:</strong> Mantener tus datos actualizados.</li>
              </ul>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 mt-4">
                <p className="text-gray-300">
                  Para ejercer estos derechos, contactanos en: <a href="mailto:testcraftia@gmail.com" className="text-violet-400 hover:text-violet-300 font-medium">testcraftia@gmail.com</a>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm font-bold">9</span>
              Contacto
            </h2>
            <div className="pl-10">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <p className="text-white font-medium">TestCraft AI</p>
                <p className="text-gray-400">Correo electrónico: <a href="mailto:testcraftia@gmail.com" className="text-violet-400 hover:text-violet-300">testcraftia@gmail.com</a></p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-violet-500/20 bg-purple-950/60 backdrop-blur-xl py-8 mt-16 shadow-lg shadow-violet-500/10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2025 TestCraft AI. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Términos</Link>
            <Link href="/privacy" className="text-violet-400">Privacidad</Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Precios</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
