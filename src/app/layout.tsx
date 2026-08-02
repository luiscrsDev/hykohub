import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700', '800'] })

export const metadata: Metadata = {
  title: 'HykoHub — Comunidade Maker de Impressão 3D',
  description: 'A HykoHub reúne makers brasileiros que imprimem no Mundo. Aprenda, troque, compre em grupo e transforme criatividade em soluções reais.',
  keywords: ['impressão 3D', 'maker', 'comunidade', 'fabricação digital', 'Bambu', 'Creality', 'Prusa'],
  metadataBase: new URL('https://www.hykohub.com'),
  openGraph: {
    title: 'HykoHub — Comunidade Maker de Impressão 3D',
    description: 'Aprenda, compre em grupo e transforme sua impressora em renda. A comunidade para quem imprime a sério.',
    url: 'https://www.hykohub.com',
    siteName: 'HykoHub',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HykoHub — Comunidade Maker de Impressão 3D',
    description: 'Aprenda, compre em grupo e transforme sua impressora em renda.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
