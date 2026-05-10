'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ExternalLink, Download, Plus, X, Loader2, Box, Star } from 'lucide-react'

type StlPost = {
  id: string
  title: string
  description: string | null
  external_link: string | null
  file_url: string | null
  thumbnail_url: string | null
  tags: string[]
  compatibilidade: string[]
  is_featured: boolean
  download_count: number
  created_at: string
}

export default function ModelosPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<StlPost[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [link, setLink] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('stl_posts')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
      setPosts((data as StlPost[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit() {
    if (!link.trim() || !title.trim()) {
      toast.error('Preencha título e link')
      return
    }
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }

    const { error } = await supabase.from('stl_posts').insert({
      title: title.trim(),
      description: description.trim() || null,
      external_link: link.trim(),
      submitted_by: user.id,
      status: 'pending',
    } as never)

    setSubmitting(false)
    if (error) {
      toast.error('Erro ao enviar')
    } else {
      toast.success('Enviado para aprovação! Avisaremos quando publicado.')
      setLink(''); setTitle(''); setDescription(''); setShowForm(false)
    }
  }

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    p.compatibilidade.some(c => c.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modelos 3D</h1>
          <p className="text-sm text-muted-foreground mt-0.5">STLs e arquivos curados pela comunidade</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)} variant={showForm ? 'outline' : 'default'} size="sm" className="gap-1.5">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Indicar modelo'}
        </Button>
      </div>

      {/* Submit form */}
      {showForm && (
        <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Indicar um modelo</h2>
          <p className="text-xs text-muted-foreground -mt-2">Cole o link do Printables, Thingiverse ou MakerWorld. Nossa equipe revisa e publica.</p>
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input placeholder="Ex: Suporte para Bambu Lab A1" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Link externo</Label>
            <Input placeholder="https://www.printables.com/model/..." value={link} onChange={e => setLink(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição <span className="text-muted-foreground">(opcional)</span></Label>
            <Input placeholder="Por que você indica esse modelo?" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Enviar para aprovação
          </Button>
        </div>
      )}

      {/* Search */}
      <Input
        placeholder="Buscar por nome, tag ou impressora..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-2xl p-12 text-center">
          <Box className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">Nenhum modelo ainda</h3>
          <p className="text-sm text-muted-foreground">Seja o primeiro a indicar um modelo para a comunidade!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(post => (
            <StlCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

function StlCard({ post }: { post: StlPost }) {
  const thumb = post.thumbnail_url ?? null

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors group">
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-muted/50 relative overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Box className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        {post.is_featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-accent text-accent-foreground text-xs gap-1">
              <Star className="w-3 h-3" /> Destaque
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{post.title}</h3>
        {post.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{post.description}</p>
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">{tag}</Badge>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Download className="w-3 h-3" /> {post.download_count}
          </span>
          {(post.external_link || post.file_url) && (
            <a
              href={post.external_link ?? post.file_url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              Ver modelo <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
