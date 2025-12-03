import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TestCraft AI - Generador de Casos de Prueba",
  description: "Genera casos de prueba profesionales automáticamente a partir de requisitos o historias de usuario usando inteligencia artificial.",
  keywords: ["QA", "testing", "casos de prueba", "test cases", "automatización", "IA", "inteligencia artificial"],
  authors: [{ name: "TestCraft AI" }],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "TestCraft AI - Generador de Casos de Prueba",
    description: "Genera casos de prueba profesionales automáticamente usando IA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
