import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-slate-500 text-sm">
            © 2025 TestCraft AI. Todos los derechos reservados.
          </p>
          
          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link 
              href="/pricing" 
              className="text-slate-400 hover:text-white transition-colors"
            >
              Precios
            </Link>
            <Link 
              href="/terms" 
              className="text-slate-400 hover:text-white transition-colors"
            >
              Términos
            </Link>
            <Link 
              href="/privacy" 
              className="text-slate-400 hover:text-white transition-colors"
            >
              Privacidad
            </Link>
            <a 
              href="mailto:testcraftia@gmail.com" 
              className="text-slate-400 hover:text-white transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
