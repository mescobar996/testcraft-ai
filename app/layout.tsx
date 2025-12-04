import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TestCraft AI - Generador de Casos de Prueba",
  description: "Generá casos de prueba profesionales a partir de requisitos usando IA",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TestCraft AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-white antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
