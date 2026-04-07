import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'TestCraft AI - Generador de Casos de Prueba con IA',
    template: '%s | TestCraft AI'
  },
  description: 'Genera casos de prueba profesionales automáticamente con IA. Herramienta gratuita para QAs Junior.',
  keywords: ['casos de prueba', 'testing QA', 'inteligencia artificial', 'QA automation', 'test cases'],
  authors: [{ name: 'TestCraft AI Team' }],
  creator: 'TestCraft AI',
  publisher: 'TestCraft AI',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://testcraft-ai-five.vercel.app'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'TestCraft AI - Generador de Casos de Prueba con IA',
    description: 'Genera casos de prueba profesionales automáticamente con IA.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://testcraft-ai-five.vercel.app',
    siteName: 'TestCraft AI',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TestCraft AI',
    description: 'Genera casos de prueba profesionales automáticamente con IA.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
