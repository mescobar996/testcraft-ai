import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-sm">
          © 2024 TestCraft AI. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-6 text-sm">
          <Link 
            href="/pricing" 
            className="text-slate-500 hover:text-white transition-colors"
          >
            Precios
          </Link>
          <Link 
            href="/terms" 
            className="text-slate-500 hover:text-white transition-colors"
          >
            Términos
          </Link>
          <Link 
            href="/privacy" 
            className="text-slate-500 hover:text-white transition-colors"
          >
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
