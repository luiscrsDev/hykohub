import { NextRequest, NextResponse } from 'next/server'

function slugToTitle(slug: string): string {
  return slug
    .replace(/^\d+-/, '')           // strip leading id (e.g. "2056363-")
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim()
}

function makerWorldSlug(url: string): string | null {
  const m = url.match(/makerworld\.com\/[a-z-]+\/models\/(\d+-[a-z0-9-]+)/i)
  return m ? slugToTitle(m[1]) : null
}

function extractMeta(html: string) {
  // og:title — handles both property= and name= variants
  const ogTitle =
    html.match(/<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:title["']/i)?.[1]

  // og:image
  const ogImage =
    html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i)?.[1]

  const pageTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]

  // Clean up "Model Name by Author | Site Name" patterns
  let title = ogTitle ?? pageTitle ?? null
  if (title) {
    title = title
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s*\|.*$/, '')       // strip " | Printables.com" etc.
      .replace(/\s+by\s+\S+.*$/i, '') // strip " by Author"
      .replace(/\s+/g, ' ')
      .trim()
  }

  return { title: title || null, image: ogImage ?? null }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ title: null, image: null }, { status: 400 })

  // Makerworld is Cloudflare-protected — extract title from URL slug
  if (/makerworld\.com/i.test(url)) {
    return NextResponse.json({ title: makerWorldSlug(url), image: null })
  }

  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return NextResponse.json({ title: null, image: null })

    const html = await res.text()
    return NextResponse.json(extractMeta(html))
  } catch {
    return NextResponse.json({ title: null, image: null })
  }
}
