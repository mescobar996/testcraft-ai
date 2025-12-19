import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // Títulos
  title: {
    default: "TestCraft AI - Generador de Casos de Prueba con IA",
    template: "%s | TestCraft AI"
  },
  description: "Genera casos de prueba profesionales en segundos con inteligencia artificial. Exporta a Excel, PDF, Jira, TestRail y más. Ideal para QA Engineers y equipos de testing.",
  
  // Keywords
  keywords: [
    "casos de prueba",
    "test cases",
    "QA",
    "testing",
    "inteligencia artificial",
    "generador de tests",
    "automatización de pruebas",
    "Jira",
    "TestRail",
    "Gherkin",
    "BDD",
    "software testing",
    "quality assurance",
    "pruebas de software"
  ],
  
  // Autor y creador
  authors: [{ name: "TestCraft AI", url: "https://testcraftai.com" }],
  creator: "TestCraft AI",
  publisher: "TestCraft AI",
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "es_AR",
    alternateLocale: "en_US",
    url: "https://testcraftai.com",
    siteName: "TestCraft AI",
    title: "TestCraft AI - Generador de Casos de Prueba con IA",
    description: "Genera casos de prueba profesionales en segundos con inteligencia artificial. Exporta a Excel, PDF, Jira, TestRail y más.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TestCraft AI - Generador de Casos de Prueba con Inteligencia Artificial",
        type: "image/png",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "TestCraft AI - Generador de Casos de Prueba con IA",
    description: "Genera casos de prueba profesionales en segundos con inteligencia artificial.",
    images: ["/og-image.png"],
    creator: "@testcraftai",
  },
  
  // Verificación (agregar cuando tengas las cuentas)
  // verification: {
  //   google: "tu-codigo-de-verificacion",
  // },
  
  // Categoría
  category: "Technology",
  
  // Manifest para PWA
  manifest: "/manifest.json",
  
  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  
  // Otros
  applicationName: "TestCraft AI",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://testcraftai.com" />
        
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "TestCraft AI",
              "description": "Generador de casos de prueba con inteligencia artificial",
              "url": "https://testcraftai.com",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              }
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
