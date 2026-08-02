'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, Play, Star, ExternalLink, Lightbulb, Wrench } from 'lucide-react'
import { CATEGORIA_LABELS, NIVEL_LABELS, thumbnailFor } from '@/lib/video-labels'

type VideoPost = {
  id: string
  title: string
  description: string | null
  platform: string
  youtube_url: string | null
  youtube_id: string | null
  source_url: string | null
  thumbnail_url: string | null
  author_handle: string | null
  problem_category: string | null
  problem_statement: string | null
  solution_summary: string | null
  level: string | null
  tags: string[]
  is_featured: boolean
  created_at: string
}

function isEmbeddable(v: VideoPost): boolean {
  return v.platform === 'youtube' && !!v.youtube_id
}

export default function VideosPage() {
  // useSearchParams precisa de um limite de Suspense no App Router
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <VideosContent />
    </Suspense>
  )
}

function VideosContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoIdNaUrl = searchParams.get('v')

  const [videos, setVideos] = useState<VideoPost[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<VideoPost | null>(null)
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState<string | null>(null)

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
      // Abre o vídeo indicado no endereço (ex: /videos?v=abc). Sem isso,
      // qualquer card da home caía sempre no primeiro da lista.
      if (vids.length > 0) {
        setActive(vids.find(v => v.id === videoIdNaUrl) ?? vids[0])
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Trocar de vídeo na lista atualiza o endereço, para o link poder ser copiado
  // e para o botão "voltar" do navegador funcionar como esperado.
  function selecionar(v: VideoPost) {
    setActive(v)
    router.replace(`/videos?v=${v.id}`, { scroll: false })
  }

  // Quando o endereço muda (voltar/avançar), acompanha o vídeo indicado
  useEffect(() => {
    if (!videoIdNaUrl || videos.length === 0) return
    const alvo = videos.find(v => v.id === videoIdNaUrl)
    if (alvo && alvo.id !== active?.id) setActive(alvo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoIdNaUrl, videos])

  // Categorias que realmente existem no acervo, com a contagem de cada uma.
  // Nada de mostrar filtro vazio: só aparece o que tem vídeo.
  const categorias = useMemo(() => {
    const contagem = new Map<string, number>()
    for (const v of videos) {
      if (v.problem_category && CATEGORIA_LABELS[v.problem_category]) {
        contagem.set(v.problem_category, (contagem.get(v.problem_category) ?? 0) + 1)
      }
    }
    return [...contagem.entries()]
      .sort((a, b) => CATEGORIA_LABELS[a[0]].localeCompare(CATEGORIA_LABELS[b[0]]))
  }, [videos])

  const filtered = videos.filter(v => {
    if (categoria && v.problem_category !== categoria) return false
    const q = search.toLowerCase()
    if (!q) return true
    return (
      v.title.toLowerCase().includes(q) ||
      (v.problem_statement ?? '').toLowerCase().includes(q) ||
      (v.solution_summary ?? '').toLowerCase().includes(q) ||
      (v.tags ?? []).some(t => t.toLowerCase().includes(q))
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const activeThumb = active ? thumbnailFor(active) : null

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
                {isEmbeddable(active) ? (
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
                ) : (
                  /* Conteúdo de fora do YouTube (ex: Reels): capa + link para o post original */
                  <a
                    href={active.source_url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-video w-full rounded-2xl overflow-hidden bg-muted"
                  >
                    {activeThumb ? (
                      <img src={activeThumb} alt={active.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 transition-colors group-hover:bg-black/55">
                      <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                      <span className="text-xs font-medium text-white/90 flex items-center gap-1">
                        Assistir no Instagram <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                )}

                <div>
                  <div className="flex items-start gap-2 mb-1">
                    <h2 className="font-semibold text-foreground text-lg leading-tight flex-1">{active.title}</h2>
                    {active.is_featured && (
                      <Badge className="bg-accent text-accent-foreground text-xs gap-1 shrink-0 mt-0.5">
                        <Star className="w-3 h-3" /> Destaque
                      </Badge>
                    )}
                  </div>

                  {active.author_handle && (
                    <p className="text-xs text-muted-foreground mb-2">por {active.author_handle}</p>
                  )}

                  {/* Curadoria: qual problema o vídeo resolve e como */}
                  {(active.problem_statement || active.solution_summary) && (
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3 mt-3">
                      {active.problem_statement && (
                        <div className="flex gap-2.5">
                          <Lightbulb className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-foreground">Resolve</p>
                            <p className="text-sm text-muted-foreground">{active.problem_statement}</p>
                          </div>
                        </div>
                      )}
                      {active.solution_summary && (
                        <div className="flex gap-2.5">
                          <Wrench className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-foreground">Como</p>
                            <p className="text-sm text-muted-foreground">{active.solution_summary}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {active.description && (
                    <p className="text-sm text-muted-foreground mt-3">{active.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-3">
                    {active.problem_category && CATEGORIA_LABELS[active.problem_category] && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {CATEGORIA_LABELS[active.problem_category]}
                      </Badge>
                    )}
                    {active.level && NIVEL_LABELS[active.level] && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {NIVEL_LABELS[active.level]}
                      </Badge>
                    )}
                    {(active.tags ?? []).map(t => (
                      <Badge key={t} variant="secondary" className="text-xs px-1.5 py-0">{t}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Lista lateral */}
          <div className="space-y-3">
            <Input
              placeholder="Buscar por título ou problema..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm"
            />

            {/* Filtro por tipo de problema que o vídeo resolve */}
            {categorias.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategoria(null)}
                  className={`text-xs px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                    categoria === null
                      ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                      : 'border-border/60 text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  Todos ({videos.length})
                </button>
                {categorias.map(([codigo, total]) => (
                  <button
                    key={codigo}
                    type="button"
                    onClick={() => setCategoria(categoria === codigo ? null : codigo)}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                      categoria === codigo
                        ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                        : 'border-border/60 text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {CATEGORIA_LABELS[codigo]} ({total})
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">
                Nenhum vídeo encontrado com esse filtro.
              </p>
            )}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map(v => {
                const thumb = thumbnailFor(v)
                return (
                  <button
                    key={v.id}
                    onClick={() => selecionar(v)}
                    className={`w-full text-left flex gap-3 p-2 rounded-xl transition-colors ${
                      active?.id === v.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative shrink-0 w-24 aspect-video rounded-lg overflow-hidden bg-muted">
                      {thumb ? (
                        <img src={thumb} alt={v.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-snug line-clamp-2 ${active?.id === v.id ? 'text-primary' : 'text-foreground'}`}>
                        {v.title}
                      </p>
                      {v.problem_statement ? (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{v.problem_statement}</p>
                      ) : (v.tags ?? []).length > 0 ? (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.tags.join(' · ')}</p>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
