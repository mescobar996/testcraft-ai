import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from '@/components/Providers'
import { CursorTrail } from '@/components/CursorTrail'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { MercadoPagoAnnouncement } from '@/components/MercadoPagoAnnouncement'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'TestCraft AI - Generador de Casos de Prueba con Inteligencia Artificial',
    template: '%s | TestCraft AI'
  },
  description: 'Genera casos de prueba profesionales automáticamente con IA. Optimiza tu proceso de QA con TestCraft AI. Planes desde $0/mes.',
  keywords: [
    'casos de prueba',
    'testing QA',
    'inteligencia artificial',
    'automatización de testing',
    'QA automation',
    'test cases',
    'software testing',
    'Jira integration',
    'TestRail'
  ],
  authors: [{ name: 'TestCraft AI Team' }],
  creator: 'TestCraft AI',
  publisher: 'TestCraft AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://testcraft-ai-five.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TestCraft AI - Generador de Casos de Prueba con IA',
    description: 'Genera casos de prueba profesionales automáticamente con IA. Ahorra tiempo y mejora la calidad de tu software.',
    url: 'https://testcraft-ai-five.vercel.app',
    siteName: 'TestCraft AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TestCraft AI - Generador de Casos de Prueba',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TestCraft AI - Generador de Casos de Prueba con IA',
    description: 'Genera casos de prueba profesionales automáticamente con IA. Ahorra tiempo y mejora la calidad de tu software.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Google Analytics - Solo si está configurado */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}

        {/* Microsoft Clarity - Solo si está configurado */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `,
            }}
          />
        )}

        {/* Hotjar - Solo si está configurado */}
        {process.env.NEXT_PUBLIC_HOTJAR_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              `,
            }}
          />
        )}
      </head>
      <body className={inter.className}>
        <CursorTrail />
        <AnimatedBackground />
        <Providers>
          <MercadoPagoAnnouncement />
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}