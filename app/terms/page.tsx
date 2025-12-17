import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a TestCraft</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Términos y Condiciones</h1>
        <p className="text-slate-400 mb-8">Última actualización: Diciembre 2024</p>

        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar TestCraft AI (&quot;el Servicio&quot;), aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debés utilizar el Servicio.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Descripción del Servicio</h2>
            <p>TestCraft AI es una herramienta de generación automática de casos de prueba utilizando inteligencia artificial. El Servicio permite a los usuarios:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Generar casos de prueba a partir de requisitos de software</li>
              <li>Exportar casos en múltiples formatos (Excel, PDF, JSON, etc.)</li>
              <li>Guardar historial de generaciones</li>
              <li>Utilizar plantillas predefinidas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cuentas de Usuario</h2>
            <p>Para acceder a ciertas funciones del Servicio, debés crear una cuenta utilizando autenticación de Google. Sos responsable de:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Mantener la confidencialidad de tu cuenta</li>
              <li>Todas las actividades que ocurran bajo tu cuenta</li>
              <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Uso Aceptable</h2>
            <p>Al usar el Servicio, acordás NO:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Violar leyes o regulaciones aplicables</li>
              <li>Intentar acceder a sistemas o datos sin autorización</li>
              <li>Transmitir malware o código malicioso</li>
              <li>Abusar del sistema de generación o evadir límites de uso</li>
              <li>Utilizar el Servicio para generar contenido ilegal o dañino</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Propiedad Intelectual</h2>
            <p><strong>Contenido del Usuario:</strong> Conservás todos los derechos sobre los requisitos y datos que ingreses al Servicio. Los casos de prueba generados son de tu propiedad.</p>
            <p className="mt-2"><strong>Contenido del Servicio:</strong> TestCraft AI, incluyendo su diseño, código, logotipos y marcas, son propiedad exclusiva de TestCraft AI.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Planes y Pagos</h2>
            <p>Ofrecemos planes gratuitos y de pago. Para los planes de pago:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Los pagos se procesan de forma segura a través de Stripe</li>
              <li>Las suscripciones se renuevan automáticamente</li>
              <li>Podés cancelar en cualquier momento desde tu cuenta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Uso de Inteligencia Artificial</h2>
            <p>El Servicio utiliza modelos de inteligencia artificial para generar casos de prueba. Reconocés que:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Los resultados generados son sugerencias y deben ser revisados</li>
              <li>La IA puede producir resultados imprecisos o incompletos</li>
              <li>Sos responsable de validar los casos generados antes de usarlos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Limitación de Responsabilidad</h2>
            <p>El Servicio se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;. No seremos responsables por daños indirectos, incidentales o consecuentes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos Términos en cualquier momento. Te notificaremos de cambios significativos por email.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Ley Aplicable</h2>
            <p>Estos Términos se rigen por las leyes de la República Argentina.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contacto</h2>
            <p>Para consultas sobre estos Términos: <a href="mailto:mescobar996@gmail.com" className="text-violet-400 hover:text-violet-300">mescobar996@gmail.com</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2024 TestCraft AI. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="text-violet-400">Términos</Link>
            <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacidad</Link>
            <Link href="/pricing" className="text-slate-500 hover:text-white transition-colors">Precios</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
