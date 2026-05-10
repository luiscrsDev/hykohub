import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700', '800'] })

export const metadata: Metadata = {
  title: 'HykoHub — Comunidade Maker de Impressão 3D',
  description: 'A HykoHub reúne makers brasileiros que imprimem no Mundo. Aprenda, troque, compre em grupo e transforme criatividade em soluções reais.',
  keywords: ['impressão 3D', 'maker', 'comunidade', 'fabricação digital', 'Bambu', 'Creality', 'Prusa'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
