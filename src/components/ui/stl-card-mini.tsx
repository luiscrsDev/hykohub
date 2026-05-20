'use client'

import { createClient } from '@/lib/supabase/client'
import { Box } from 'lucide-react'

type Props = {
  id: string
  title: string
  thumbnail_url: string | null
  external_link: string | null
  file_url: string | null
}

export function StlCardMini({ id, title, thumbnail_url, external_link, file_url }: Props) {
  const supabase = createClient()
  const url = external_link ?? file_url ?? null

  async function handleClick() {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
    await supabase.rpc('increment_download_count', { post_id: id })
  }

  return (
    <button
      onClick={handleClick}
      className="bg-card border border-border/60 rounded-xl overflow-hidden hover:border-primary/30 transition-colors group text-left w-full"
    >
      <div className="aspect-square bg-muted/40 flex items-center justify-center overflow-hidden">
        {thumbnail_url
          ? <img src={thumbnail_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <Box className="w-8 h-8 text-muted-foreground/30" />}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">{title}</p>
      </div>
    </button>
  )
}
