import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login'],
        disallow: ['/dashboard', '/perfil', '/admin', '/compras', '/ofertas', '/modelos', '/videos', '/vire-pro', '/configuracoes', '/auth'],
      },
    ],
    sitemap: 'https://www.hykohub.com/sitemap.xml',
  }
}
