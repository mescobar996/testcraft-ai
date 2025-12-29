import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones | TestCraft AI",
  description: "Términos y condiciones de uso de TestCraft AI",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-violet-500/20 bg-purple-950/60 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-violet-500/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a TestCraft AI</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Términos y Condiciones</h1>
            <p className="text-slate-400">Última actualización: Enero 2025</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <p className="text-slate-300">
            Los presentes Términos y Condiciones (en adelante, los &quot;Términos&quot;) regulan el acceso y uso 
            de la plataforma TestCraft AI (en adelante, el &quot;Servicio&quot;). Al acceder, registrarte o utilizar 
            el Servicio, manifestás tu conformidad con estos Términos. Si no estás de acuerdo con alguna 
            disposición, te solicitamos que no utilices el Servicio.
          </p>
        </div>

        <div className="space-y-8 text-slate-300">

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">1</span>
              Definiciones
            </h2>
            <div className="pl-10 space-y-2">
              <ul className="list-disc pl-6 space-y-2 text-slate-400">
                <li><strong className="text-slate-300">&quot;TestCraft AI&quot; o &quot;Servicio&quot;:</strong> Plataforma web de generación automática de casos de prueba mediante inteligencia artificial.</li>
                <li><strong className="text-slate-300">&quot;Usuario&quot;:</strong> Toda persona física o jurídica que acceda y/o utilice el Servicio.</li>
                <li><strong className="text-slate-300">&quot;Cuenta&quot;:</strong> Registro personal del Usuario que permite el acceso a las funcionalidades del Servicio.</li>
                <li><strong className="text-slate-300">&quot;Contenido del Usuario&quot;:</strong> Toda información, requisitos, datos y materiales que el Usuario ingrese al Servicio.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">2</span>
              Descripción del Servicio
            </h2>
            <div className="pl-10 space-y-3">
              <p>TestCraft AI es una herramienta que utiliza inteligencia artificial para generar casos de prueba de software a partir de requisitos proporcionados por el Usuario. El Servicio incluye:</p>
              <ul className="list-disc pl-6 space-y-1 text-slate-400">
                <li>Generación automática de casos de prueba en formato tabla y Gherkin</li>
                <li>Exportación a múltiples formatos (Excel, PDF, JSON, CSV)</li>
                <li>Compatibilidad con herramientas de testing (Jira, TestRail, Zephyr, qTest)</li>
                <li>Historial de generaciones y casos favoritos</li>
                <li>Generación desde imágenes (plan Pro)</li>
                <li>Test Plan PDF profesional (plan Pro)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">3</span>
              Registro y Cuenta de Usuario
            </h2>
            <div className="pl-10 space-y-3">
              <p><strong className="text-white">3.1 Requisitos:</strong> Para utilizar ciertas funcionalidades del Servicio, deberás crear una cuenta mediante autenticación de Google OAuth. Declarás que:</p>
              <ul className="list-disc pl-6 space-y-1 text-slate-400">
                <li>Sos mayor de 18 años o contás con capacidad legal para contratar.</li>
                <li>La información proporcionada es veraz, completa y actualizada.</li>
                <li>Mantendrás la confidencialidad de tu cuenta.</li>
              </ul>
              <p className="mt-3"><strong className="text-white">3.2 Responsabilidad:</strong> Sos el único responsable de todas las actividades realizadas bajo tu cuenta. Debés notificarnos inmediatamente ante cualquier uso no autorizado.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">4</span>
              Uso Aceptable
            </h2>
            <div className="pl-10 space-y-3">
              <p>El Usuario se compromete a utilizar el Servicio de manera lícita y conforme a estos Términos. Queda expresamente prohibido:</p>
              <ul className="list-disc pl-6 space-y-1 text-slate-400">
                <li>Utilizar el Servicio para fines ilegales o no autorizados.</li>
                <li>Intentar acceder a sistemas, datos o funcionalidades sin autorización.</li>
                <li>Transmitir virus, malware o código malicioso.</li>
                <li>Evadir, desactivar o interferir con las medidas de seguridad del Servicio.</li>
                <li>Reproducir, duplicar, copiar, vender o revender el Servicio sin autorización.</li>
                <li>Utilizar el Servicio para generar contenido ilegal, difamatorio, discriminatorio u ofensivo.</li>
                <li>Sobrecargar la infraestructura del Servicio o evadir los límites de uso establecidos.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">5</span>
              Propiedad Intelectual
            </h2>
            <div className="pl-10 space-y-3">
              <p><strong className="text-white">5.1 Contenido del Usuario:</strong> Conservás todos los derechos de propiedad intelectual sobre el contenido que ingreses al Servicio. Los casos de prueba generados son de tu propiedad para su uso sin restricciones.</p>
              <p><strong className="text-white">5.2 Propiedad del Servicio:</strong> TestCraft AI, incluyendo pero no limitado a su código fuente, diseño, logotipos, marcas, textos, gráficos e interfaces, son propiedad exclusiva de TestCraft AI y están protegidos por las leyes de propiedad intelectual aplicables.</p>
              <p><strong className="text-white">5.3 Licencia limitada:</strong> Te otorgamos una licencia limitada, no exclusiva, intransferible y revocable para utilizar el Servicio conforme a estos Términos.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">6</span>
              Planes y Condiciones de Pago
            </h2>
            <div className="pl-10 space-y-3">
              <p><strong className="text-white">6.1 Planes disponibles:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-slate-400">
                <li><strong className="text-slate-300">Plan Gratuito:</strong> 10 generaciones mensuales con funcionalidades básicas.</li>
                <li><strong className="text-slate-300">Plan Pro:</strong> 500 generaciones mensuales y funcionalidades premium por $29 USD/mes.</li>
              </ul>
              <p className="mt-3"><strong className="text-white">6.2 Facturación:</strong> Los pagos se procesan de forma segura a través de Stripe. Las suscripciones se renuevan automáticamente al final de cada período de facturación.</p>
              <p><strong className="text-white">6.3 Cancelación:</strong> Podés cancelar tu suscripción en cualquier momento. La cancelación será efectiva al finalizar el período de facturación vigente, sin reembolsos por períodos parciales.</p>
              <p><strong className="text-white">6.4 Modificación de precios:</strong> Nos reservamos el derecho de modificar los precios con un aviso previo de 30 días.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">7</span>
              Uso de Inteligencia Artificial
            </h2>
            <div className="pl-10 space-y-3">
              <p>El Servicio utiliza modelos de inteligencia artificial para generar casos de prueba. El Usuario reconoce y acepta que:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400">
                <li>Los resultados generados por IA son <strong className="text-slate-300">sugerencias</strong> que deben ser revisadas y validadas antes de su implementación.</li>
                <li>La IA puede producir resultados imprecisos, incompletos o que requieran ajustes.</li>
                <li>El Usuario es el único responsable de verificar la adecuación de los casos generados.</li>
                <li>TestCraft AI no garantiza la exactitud, completitud o idoneidad de los resultados para un propósito específico.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">8</span>
              Limitación de Responsabilidad
            </h2>
            <div className="pl-10 space-y-3">
              <p><strong className="text-white">8.1</strong> El Servicio se proporciona &quot;TAL CUAL&quot; y &quot;SEGÚN DISPONIBILIDAD&quot;, sin garantías de ningún tipo, expresas o implícitas.</p>
              <p><strong className="text-white">8.2</strong> En la máxima medida permitida por la ley aplicable, TestCraft AI no será responsable por:</p>
              <ul className="list-disc pl-6 space-y-1 text-slate-400">
                <li>Daños directos, indirectos, incidentales, especiales, consecuentes o punitivos.</li>
                <li>Pérdida de datos, beneficios, ingresos o interrupción del negocio.</li>
                <li>Errores, inexactitudes u omisiones en los casos de prueba generados.</li>
                <li>Interrupciones, demoras o fallos en el Servicio.</li>
                <li>Acciones de terceros o eventos de fuerza mayor.</li>
              </ul>
              <p className="mt-3"><strong className="text-white">8.3</strong> En ningún caso nuestra responsabilidad total excederá el monto pagado por el Usuario en los últimos 12 meses.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">9</span>
              Indemnización
            </h2>
            <div className="pl-10">
              <p>El Usuario acepta indemnizar, defender y mantener indemne a TestCraft AI, sus directores, empleados y agentes, frente a cualquier reclamo, demanda, daño, pérdida o gasto (incluyendo honorarios legales razonables) que surja de: (a) el uso del Servicio; (b) la violación de estos Términos; (c) la infracción de derechos de terceros.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">10</span>
              Suspensión y Terminación
            </h2>
            <div className="pl-10 space-y-3">
              <p><strong className="text-white">10.1</strong> Nos reservamos el derecho de suspender o terminar tu acceso al Servicio, con o sin previo aviso, si:</p>
              <ul className="list-disc pl-6 space-y-1 text-slate-400">
                <li>Violás estos Términos o cualquier ley aplicable.</li>
                <li>Realizás un uso abusivo o fraudulento del Servicio.</li>
                <li>No efectuás los pagos correspondientes.</li>
              </ul>
              <p className="mt-3"><strong className="text-white">10.2</strong> Podés cancelar tu cuenta en cualquier momento contactándonos a <a href="mailto:testcraftai@gmail.com" className="text-violet-400 hover:text-violet-300">testcraftai@gmail.com</a>.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">11</span>
              Modificaciones
            </h2>
            <div className="pl-10">
              <p>Nos reservamos el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigencia al ser publicadas en el Servicio. Para cambios sustanciales, te notificaremos por correo electrónico con al menos 30 días de anticipación. El uso continuado del Servicio después de las modificaciones constituye tu aceptación de los nuevos Términos.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">12</span>
              Ley Aplicable y Jurisdicción
            </h2>
            <div className="pl-10">
              <p>Estos Términos se regirán e interpretarán de conformidad con las leyes de la República Argentina. Para cualquier controversia derivada de estos Términos o del uso del Servicio, las partes se someten a la jurisdicción exclusiva de los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero o jurisdicción que pudiera corresponderles.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">13</span>
              Disposiciones Generales
            </h2>
            <div className="pl-10 space-y-2">
              <p><strong className="text-white">13.1 Totalidad del acuerdo:</strong> Estos Términos constituyen el acuerdo completo entre vos y TestCraft AI respecto al uso del Servicio.</p>
              <p><strong className="text-white">13.2 Cesión:</strong> No podés ceder ni transferir tus derechos u obligaciones sin nuestro consentimiento previo por escrito.</p>
              <p><strong className="text-white">13.3 Divisibilidad:</strong> Si alguna disposición fuera declarada inválida, las demás disposiciones continuarán en pleno vigor y efecto.</p>
              <p><strong className="text-white">13.4 Renuncia:</strong> La falta de ejercicio de cualquier derecho no constituirá una renuncia al mismo.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm font-bold">14</span>
              Contacto
            </h2>
            <div className="pl-10">
              <p className="mb-4">Para consultas relacionadas con estos Términos y Condiciones:</p>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-white font-medium">TestCraft AI</p>
                <p className="text-slate-400">Correo electrónico: <a href="mailto:testcraftai@gmail.com" className="text-violet-400 hover:text-violet-300">testcraftai@gmail.com</a></p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-violet-500/20 bg-purple-950/60 backdrop-blur-xl py-8 mt-16 shadow-lg shadow-violet-500/10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2025 TestCraft AI. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="text-violet-400">Términos</Link>
            <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacidad</Link>
            <Link href="/pricing" className="text-slate-500 hover:text-white transition-colors">Precios</Link>
            <Link href="/faq" className="text-slate-500 hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
