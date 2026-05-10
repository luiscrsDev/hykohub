'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, Play, Star } from 'lucide-react'

type VideoPost = {
  id: string
  title: string
  description: string | null
  youtube_url: string
  youtube_id: string
  tags: string[]
  is_featured: boolean
  created_at: string
}

export default function VideosPage() {
  const supabase = createClient()
  const [videos, setVideos] = useState<VideoPost[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<VideoPost | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('video_posts')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
      const vids = (data as VideoPost[]) ?? []
      setVideos(vids)
      if (vids.length > 0) setActive(vids[0])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vídeos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Tutoriais, timelapses e dicas curados pela equipe Hyko HUB</p>
      </div>

      {videos.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-2xl p-12 text-center">
          <Play className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">Nenhum vídeo ainda</h3>
          <p className="text-sm text-muted-foreground">Em breve a equipe publicará vídeos sobre impressão 3D.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Player principal */}
          <div className="lg:col-span-2 space-y-3">
            {active && (
              <>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
                  <iframe
                    key={active.youtube_id}
                    src={`https://www.youtube.com/embed/${active.youtube_id}?autoplay=0&rel=0`}
                    title={active.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <div className="flex items-start gap-2 mb-1">
                    <h2 className="font-semibold text-foreground text-lg leading-tight flex-1">{active.title}</h2>
                    {active.is_featured && (
                      <Badge className="bg-accent text-accent-foreground text-xs gap-1 shrink-0 mt-0.5">
                        <Star className="w-3 h-3" /> Destaque
                      </Badge>
                    )}
                  </div>
                  {active.description && (
                    <p className="text-sm text-muted-foreground">{active.description}</p>
                  )}
                  {active.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {active.tags.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs px-1.5 py-0">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Lista lateral */}
          <div className="space-y-3">
            <Input
              placeholder="Buscar vídeos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm"
            />
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map(v => (
                <button
                  key={v.id}
                  onClick={() => setActive(v)}
                  className={`w-full text-left flex gap-3 p-2 rounded-xl transition-colors ${
                    active?.id === v.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative shrink-0 w-24 aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium leading-snug line-clamp-2 ${active?.id === v.id ? 'text-primary' : 'text-foreground'}`}>
                      {v.title}
                    </p>
                    {v.tags.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.tags.join(' · ')}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
