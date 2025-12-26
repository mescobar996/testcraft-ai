import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Preguntas Frecuentes (FAQ) | TestCraft AI",
  description: "Respuestas a las preguntas más comunes sobre TestCraft AI",
};

const faqContent = [
  {
    question: "¿Qué es TestCraft AI?",
    answer: "TestCraft AI es un generador de casos de prueba basado en inteligencia artificial que toma un requisito de usuario (o una imagen) y produce casos de prueba completos, incluyendo casos positivos, negativos y de borde, en segundos.",
  },
  {
    question: "¿Qué tipos de casos de prueba genera?",
    answer: "Genera casos de prueba funcionales, de usabilidad y de rendimiento (a nivel de sugerencia), cubriendo escenarios positivos, negativos y de borde para asegurar una cobertura exhaustiva.",
  },
  {
    question: "¿Qué formatos de exportación soporta?",
    answer: "Actualmente, soporta la exportación a Excel, PDF (para Test Plans), Gherkin (para BDD) y copia directa al portapapeles.",
  },
  {
    question: "¿Necesito registrarme para usar TestCraft AI?",
    answer: "Sí. Para acceder a las funcionalidades, incluso en el Plan Gratuito, debe iniciar sesión con su cuenta de Google.",
  },
  {
    question: "¿Cómo se calcula el 'Uso Diario'?",
    answer: "El uso diario se refiere a la cantidad de veces que ha presionado el botón 'Generar Casos de Prueba' en un período de 24 horas. El Plan Gratuito tiene un límite de 20 generaciones por día.",
  },
  {
    question: "¿Mis datos y casos de prueba están seguros?",
    answer: "Sí. Utilizamos Supabase para la autenticación y almacenamiento seguro de datos. Sus casos de prueba son privados y solo usted tiene acceso a ellos.",
  },
  {
    question: "¿Cuánto cuesta el Plan Pro?",
    answer: "El Plan Pro tiene un costo de $5 USD por mes.",
  },
  {
    question: "¿Qué significa 'Generación desde Imagen'?",
    answer: "Es una función exclusiva del Plan Pro que le permite subir una captura de pantalla de una interfaz de usuario o un diagrama, y la IA analizará la imagen para generar casos de prueba relevantes basados en los elementos visuales detectados.",
  },
  {
    question: "¿Qué es el 'Test Plan PDF profesional'?",
    answer: "Es una opción de exportación del Plan Pro que organiza los casos de prueba generados en un documento PDF con formato ejecutivo, ideal para compartir con gerentes o clientes.",
  },
  {
    question: "¿Cómo puedo contactar al soporte técnico?",
    answer: "Si es usuario del Plan Gratuito, puede contactarnos a través de testcraftai@gmail.com. Si es usuario Pro, tiene acceso a soporte prioritario con respuesta garantizada en 24 horas.",
  },
  {
    question: "¿Dónde puedo reportar un error o sugerir una mejora?",
    answer: "Agradecemos sus comentarios. Puede reportar errores o sugerir mejoras a través de testcraftai@gmail.com.",
  },
];

export default function FAQPage() {
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
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Preguntas Frecuentes (FAQ)</h1>
            <p className="text-gray-400">Respuestas a las dudas más comunes sobre TestCraft AI</p>
          </div>
        </div>

        <div className="space-y-6">
          {faqContent.map((item, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-2">{item.question}</h2>
              <p className="text-gray-300">{item.answer}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-violet-500/20 bg-purple-950/60 backdrop-blur-xl py-8 mt-16 shadow-lg shadow-violet-500/10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2025 TestCraft AI. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Términos</Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacidad</Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Precios</Link>
            <Link href="/faq" className="text-violet-400">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
