'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Loader2, Check, X, Box, Play, Plus,
  ExternalLink, Clock, CheckCircle2, XCircle, Users, ShoppingCart, Trash2, Tag, Star,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PAISES = [
  { value: 'BR', label: '🇧🇷 Brasil' },
  { value: 'PT', label: '🇵🇹 Portugal' },
  { value: 'US', label: '🇺🇸 Estados Unidos' },
  { value: 'CA', label: '🇨🇦 Canadá' },
  { value: 'GB', label: '🇬🇧 Reino Unido' },
  { value: 'DE', label: '🇩🇪 Alemanha' },
  { value: 'FR', label: '🇫🇷 França' },
  { value: 'ES', label: '🇪🇸 Espanha' },
  { value: 'IT', label: '🇮🇹 Itália' },
  { value: 'NL', label: '🇳🇱 Holanda' },
  { value: 'CH', label: '🇨🇭 Suíça' },
  { value: 'AU', label: '🇦🇺 Austrália' },
  { value: 'NZ', label: '🇳🇿 Nova Zelândia' },
  { value: 'JP', label: '🇯🇵 Japão' },
  { value: 'AR', label: '🇦🇷 Argentina' },
  { value: 'CL', label: '🇨🇱 Chile' },
  { value: 'MX', label: '🇲🇽 México' },
  { value: 'OTHER', label: '🌍 Outro' },
]
import { MembersCrm } from '@/components/admin/members-crm'

type AdminTab = 'conteudo' | 'membros' | 'compras' | 'ofertas'

type StlPost = {
  id: string; title: string; description: string | null
  external_link: string | null; thumbnail_url: string | null
  tags: string[]; status: string; created_at: string
  submitted_by: string | null; is_featured: boolean
}
type VideoPost = {
  id: string; title: string; description: string | null
  youtube_url: string; youtube_id: string; tags: string[]
  status: string; created_at: string; submitted_by: string | null
  is_featured: boolean
}
type StatusFilter = 'pending' | 'approved' | 'rejected'

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return m ? m[1] : null
}

async function fetchYoutubeTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
    if (!res.ok) return null
    const data = await res.json()
    return data.title ?? null
  } catch { return null }
}

async function fetchPageMeta(url: string): Promise<{ title: string | null; image: string | null }> {
  try {
    const res = await fetch(`/api/fetch-title?url=${encodeURIComponent(url)}`)
    if (!res.ok) return { title: null, image: null }
    return await res.json()
  } catch { return { title: null, image: null } }
}

const STATUS_OPTIONS: { key: StatusFilter; label: string; icon: any; colors: string }[] = [
  { key: 'pending',  label: 'Pendentes', icon: Clock,         colors: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { key: 'approved', label: 'Aprovados', icon: CheckCircle2,  colors: 'bg-green-500/10 text-green-400 border-green-500/30' },
  { key: 'rejected', label: 'Rejeitados', icon: XCircle,      colors: 'bg-destructive/10 text-destructive border-destructive/30' },
]

export default function AdminPage() {
  const supabase = createClient()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab, setTab] = useState<AdminTab>('conteudo')

  // STL
  const [stlFilter, setStlFilter] = useState<StatusFilter>('pending')
  const [stlPosts, setStlPosts] = useState<StlPost[]>([])
  const [stlLoading, setStlLoading] = useState(false)
  const [showAddStl, setShowAddStl] = useState(false)
  const [sTitle, setSTitle] = useState('')
  const [sLink, setSLink] = useState('')
  const [sThumb, setSThumb] = useState('')
  const [sDesc, setSDesc] = useState('')
  const [sTags, setSTags] = useState('')
  const [sFeatured, setSFeatured] = useState(false)
  const [sSaving, setSSaving] = useState(false)

  // Compras coletivas
  const [compras, setCompras] = useState<any[]>([])
  const [comprasLoading, setComprasLoading] = useState(false)
  const [showAddCompra, setShowAddCompra] = useState(false)
  const [cProduto, setCProduto] = useState('')
  const [cFornecedor, setCFornecedor] = useState('')
  const [cPais, setCPais] = useState('')
  const [cPrecoCheio, setCPrecoCheio] = useState('')
  const [cPrecoGrupo, setCPrecoGrupo] = useState('')
  const [cPrecoPro, setCPrecoPro] = useState('')
  const [cMinimo, setCMinimo] = useState('')
  const [cPrazo, setCPrazo] = useState('')
  const [cImagem, setCImagem] = useState('')
  const [cSaving, setCSaving] = useState(false)

  // Ofertas de parceiros
  const [ofertas, setOfertas] = useState<any[]>([])
  const [ofertasLoading, setOfertasLoading] = useState(false)
  const [showAddOferta, setShowAddOferta] = useState(false)
  const [oProduto, setOProduto] = useState('')
  const [oParceiro, setOParceiro] = useState('')
  const [oDescricao, setODescricao] = useState('')
  const [oPais, setOPais] = useState('')
  const [oPrecoOriginal, setOPrecoOriginal] = useState('')
  const [oPrecoOferta, setOPrecoOferta] = useState('')
  const [oDescontoPercentual, setODescontoPercentual] = useState('')
  const [oTipoOferta, setOTipoOferta] = useState<'preco' | 'percentual'>('preco')
  const [oLinkCompra, setOLinkCompra] = useState('')
  const [oImagem, setOImagem] = useState('')
  const [oCategoria, setOCategoria] = useState('')
  const [oPrazoFim, setOPrazoFim] = useState('')
  const [oDestaque, setODestaque] = useState(false)
  const [oSaving, setOSaving] = useState(false)

  // Video
  const [videoFilter, setVideoFilter] = useState<StatusFilter>('pending')
  const [videoPosts, setVideoPosts] = useState<VideoPost[]>([])
  const [videoLoading, setVideoLoading] = useState(false)
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [vTitle, setVTitle] = useState('')
  const [vUrl, setVUrl] = useState('')
  const [vDesc, setVDesc] = useState('')
  const [vTags, setVTags] = useState('')
  const [vFeatured, setVFeatured] = useState(false)
  const [vSaving, setVSaving] = useState(false)
  const [vFetching, setVFetching] = useState(false)
  const [sFetching, setSFetching] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setChecking(false); return }
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      setIsAdmin(!!(data as any)?.is_admin)
      setChecking(false)
    }
    checkAdmin()
  }, [])

  useEffect(() => { if (isAdmin) loadStl() }, [isAdmin, stlFilter])
  useEffect(() => { if (isAdmin) loadVideos() }, [isAdmin, videoFilter])
  useEffect(() => { if (isAdmin && tab === 'compras') loadCompras() }, [isAdmin, tab])
  useEffect(() => { if (isAdmin && tab === 'ofertas') loadOfertas() }, [isAdmin, tab])

  async function loadStl() {
    setStlLoading(true)
    const { data } = await supabase.from('stl_posts').select('*')
      .eq('status', stlFilter).order('created_at', { ascending: false })
    setStlPosts((data as StlPost[]) ?? [])
    setStlLoading(false)
  }

  async function loadVideos() {
    setVideoLoading(true)
    const { data } = await supabase.from('video_posts').select('*')
      .eq('status', videoFilter).order('created_at', { ascending: false })
    setVideoPosts((data as VideoPost[]) ?? [])
    setVideoLoading(false)
  }

  async function loadCompras() {
    setComprasLoading(true)
    const { data } = await supabase.from('group_purchases').select('*').order('created_at', { ascending: false })
    setCompras(data ?? [])
    setComprasLoading(false)
  }

  async function loadOfertas() {
    setOfertasLoading(true)
    const { data } = await supabase.from('partner_offers').select('*').order('created_at', { ascending: false })
    setOfertas(data ?? [])
    setOfertasLoading(false)
  }

  async function handleAddOferta() {
    if (!oProduto.trim() || !oParceiro.trim() || !oPais.trim()) {
      toast.error('Preencha produto, parceiro e país')
      return
    }
    if (oTipoOferta === 'preco' && !oPrecoOferta) {
      toast.error('Informe o preço da oferta')
      return
    }
    if (oTipoOferta === 'percentual' && !oDescontoPercentual) {
      toast.error('Informe o percentual de desconto')
      return
    }
    setOSaving(true)
    const { error } = await supabase.from('partner_offers').insert({
      produto: oProduto.trim(),
      parceiro: oParceiro.trim(),
      descricao: oDescricao.trim() || null,
      pais: oPais.trim().toUpperCase(),
      preco_original: oPrecoOriginal ? parseFloat(oPrecoOriginal) : null,
      preco_oferta: oTipoOferta === 'preco' && oPrecoOferta ? parseFloat(oPrecoOferta) : null,
      desconto_percentual: oTipoOferta === 'percentual' && oDescontoPercentual ? parseFloat(oDescontoPercentual) : null,
      link_compra: oLinkCompra.trim() || null,
      imagem_url: oImagem.trim() || null,
      categoria: oCategoria.trim() || null,
      prazo_fim: oPrazoFim || null,
      destaque: oDestaque,
      ativo: true,
    } as never)
    setOSaving(false)
    if (error) { toast.error('Erro ao cadastrar oferta'); return }
    toast.success('Oferta publicada!')
    setOProduto(''); setOParceiro(''); setODescricao(''); setOPais('')
    setOPrecoOriginal(''); setOPrecoOferta(''); setODescontoPercentual('')
    setOTipoOferta('preco'); setOLinkCompra('')
    setOImagem(''); setOCategoria(''); setOPrazoFim(''); setODestaque(false)
    setShowAddOferta(false)
    loadOfertas()
  }

  async function toggleOfertaAtivo(id: string, ativo: boolean) {
    await supabase.from('partner_offers').update({ ativo } as never).eq('id', id)
    setOfertas(prev => prev.map(o => o.id === id ? { ...o, ativo } : o))
  }

  async function toggleOfertaDestaque(id: string, destaque: boolean) {
    await supabase.from('partner_offers').update({ destaque } as never).eq('id', id)
    setOfertas(prev => prev.map(o => o.id === id ? { ...o, destaque } : o))
  }

  async function deleteOferta(id: string) {
    if (!confirm('Excluir esta oferta?')) return
    const { error } = await supabase.from('partner_offers').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir'); return }
    toast.success('Oferta excluída')
    setOfertas(prev => prev.filter(o => o.id !== id))
  }

  async function handleAddCompra() {
    if (!cProduto.trim() || !cFornecedor.trim() || !cPais.trim() ||
        !cPrecoCheio || !cPrecoGrupo || !cMinimo || !cPrazo) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setCSaving(true)
    const { error } = await supabase.from('group_purchases').insert({
      produto: cProduto.trim(),
      fornecedor: cFornecedor.trim(),
      pais: cPais.trim().toUpperCase(),
      preco_cheio: parseFloat(cPrecoCheio),
      preco_grupo: parseFloat(cPrecoGrupo),
      preco_pro: cPrecoPro ? parseFloat(cPrecoPro) : null,
      minimo_adesoes: parseInt(cMinimo),
      prazo_dias: parseInt(cPrazo),
      imagem_url: cImagem.trim() || null,
      ativo: true,
    })
    setCSaving(false)
    if (error) { toast.error('Erro ao cadastrar'); return }
    toast.success('Compra coletiva publicada!')
    setCProduto(''); setCFornecedor(''); setCPais(''); setCPrecoCheio('')
    setCPrecoGrupo(''); setCPrecoPro(''); setCMinimo(''); setCPrazo(''); setCImagem('')
    setShowAddCompra(false)
    loadCompras()
  }

  async function toggleCompraAtivo(id: string, ativo: boolean) {
    await supabase.from('group_purchases').update({ ativo }).eq('id', id)
    setCompras(prev => prev.map(c => c.id === id ? { ...c, ativo } : c))
  }

  async function deleteCompra(id: string) {
    if (!confirm('Excluir esta compra coletiva?')) return
    const { error } = await supabase.from('group_purchases').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir'); return }
    toast.success('Compra excluída')
    setCompras(prev => prev.filter(c => c.id !== id))
  }

  // STL actions
  async function updateStlStatus(id: string, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('stl_posts').update({ status } as never).eq('id', id)
    if (error) { toast.error('Erro'); return }
    toast.success(status === 'approved' ? 'Aprovado!' : 'Rejeitado')
    setStlPosts(prev => prev.filter(p => p.id !== id))
  }
  async function toggleStlFeatured(id: string, is_featured: boolean) {
    await supabase.from('stl_posts').update({ is_featured } as never).eq('id', id)
    setStlPosts(prev => prev.map(p => p.id === id ? { ...p, is_featured } : p))
  }
  async function deleteStl(id: string) {
    if (!confirm('Excluir este modelo permanentemente?')) return
    const { error } = await supabase.from('stl_posts').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir'); return }
    toast.success('Modelo excluído')
    setStlPosts(prev => prev.filter(p => p.id !== id))
  }
  async function handleAddStl() {
    if (!sTitle.trim() || !sLink.trim()) { toast.error('Título e link são obrigatórios'); return }
    setSSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('stl_posts').insert({
      title: sTitle.trim(), description: sDesc.trim() || null,
      external_link: sLink.trim(), thumbnail_url: sThumb.trim() || null,
      tags: sTags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'approved', submitted_by: user?.id ?? null, is_featured: sFeatured,
    } as never)
    setSSaving(false)
    if (error) { toast.error('Erro ao adicionar'); return }
    toast.success('Modelo publicado!')
    setSTitle(''); setSLink(''); setSThumb(''); setSDesc(''); setSTags(''); setSFeatured(false); setShowAddStl(false)
    if (stlFilter === 'approved') loadStl()
  }

  // Video actions
  async function updateVideoStatus(id: string, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('video_posts').update({ status } as never).eq('id', id)
    if (error) { toast.error('Erro'); return }
    toast.success(status === 'approved' ? 'Aprovado!' : 'Rejeitado')
    setVideoPosts(prev => prev.filter(p => p.id !== id))
  }
  async function toggleVideoFeatured(id: string, is_featured: boolean) {
    await supabase.from('video_posts').update({ is_featured } as never).eq('id', id)
    setVideoPosts(prev => prev.map(p => p.id === id ? { ...p, is_featured } : p))
  }
  async function deleteVideo(id: string) {
    if (!confirm('Excluir este vídeo permanentemente?')) return
    const { error } = await supabase.from('video_posts').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir'); return }
    toast.success('Vídeo excluído')
    setVideoPosts(prev => prev.filter(p => p.id !== id))
  }
  async function handleAddVideo() {
    const ytId = extractYoutubeId(vUrl.trim())
    if (!vTitle.trim() || !ytId) { toast.error('Cole um link YouTube válido'); return }
    setVSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('video_posts').insert({
      title: vTitle.trim(), description: vDesc.trim() || null,
      youtube_url: vUrl.trim(), youtube_id: ytId,
      tags: vTags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'approved', submitted_by: user?.id ?? null, is_featured: vFeatured,
    } as never)
    setVSaving(false)
    if (error) { toast.error('Erro ao adicionar'); return }
    toast.success('Vídeo publicado!')
    setVTitle(''); setVUrl(''); setVDesc(''); setVTags(''); setVFeatured(false); setShowAddVideo(false)
    if (videoFilter === 'approved') loadVideos()
  }

  if (checking) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  )

  if (!isAdmin) return (
    <div className="flex items-center justify-center py-20 text-center">
      <div>
        <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
        <h2 className="font-bold text-foreground text-lg">Acesso negado</h2>
        <p className="text-sm text-muted-foreground mt-1">Você não tem permissão para acessar esta área.</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie conteúdo e membros da comunidade</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/40 rounded-xl w-fit border border-border/40">
        {([
          { key: 'conteudo', label: 'Conteúdo', icon: Box },
          { key: 'ofertas', label: 'Ofertas', icon: Tag },
          { key: 'compras', label: 'Coletivas', icon: ShoppingCart },
          { key: 'membros', label: 'Membros', icon: Users },
        ] as { key: AdminTab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'membros' && <MembersCrm />}

      {tab === 'ofertas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" /> Ofertas de parceiros
            </h2>
            <Button size="sm" onClick={() => setShowAddOferta(v => !v)}
              variant={showAddOferta ? 'outline' : 'default'} className="gap-1.5 h-8 text-xs">
              {showAddOferta ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddOferta ? 'Cancelar' : 'Nova oferta'}
            </Button>
          </div>

          {showAddOferta && (
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Produto <span className="text-destructive">*</span></Label>
                  <Input className="h-8 text-sm" placeholder="Ex: Filamento PETG Premium 1kg" value={oProduto} onChange={e => setOProduto(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Parceiro / Marca <span className="text-destructive">*</span></Label>
                  <Input className="h-8 text-sm" placeholder="Ex: Polymaker" value={oParceiro} onChange={e => setOParceiro(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">País <span className="text-destructive">*</span></Label>
                  <Select value={oPais} onValueChange={v => setOPais(v ?? '')}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PAISES.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Tipo de oferta <span className="text-destructive">*</span></Label>
                  <div className="flex gap-1 p-1 bg-muted/40 rounded-lg w-fit border border-border/40">
                    <button type="button" onClick={() => setOTipoOferta('preco')}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${oTipoOferta === 'preco' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      Preço fixo
                    </button>
                    <button type="button" onClick={() => setOTipoOferta('percentual')}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${oTipoOferta === 'percentual' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      % Desconto
                    </button>
                  </div>
                </div>
                {oTipoOferta === 'preco' ? (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Preço original <span className="text-muted-foreground">(opcional)</span></Label>
                      <Input className="h-8 text-sm" type="number" step="0.01" placeholder="0.00" value={oPrecoOriginal} onChange={e => setOPrecoOriginal(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Preço da oferta <span className="text-destructive">*</span></Label>
                      <Input className="h-8 text-sm" type="number" step="0.01" placeholder="0.00" value={oPrecoOferta} onChange={e => setOPrecoOferta(e.target.value)} />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Desconto (%) <span className="text-destructive">*</span></Label>
                    <Input className="h-8 text-sm" type="number" min="1" max="100" placeholder="Ex: 20" value={oDescontoPercentual} onChange={e => setODescontoPercentual(e.target.value)} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs">Categoria <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input className="h-8 text-sm" placeholder="Ex: Filamento, Acessório..." value={oCategoria} onChange={e => setOCategoria(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Válido até <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input className="h-8 text-sm" type="date" value={oPrazoFim} onChange={e => setOPrazoFim(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Link de compra <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input className="h-8 text-sm" placeholder="https://..." value={oLinkCompra} onChange={e => setOLinkCompra(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Imagem URL <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input className="h-8 text-sm" placeholder="https://..." value={oImagem} onChange={e => setOImagem(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Descrição <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input className="h-8 text-sm" placeholder="Breve descrição da oferta..." value={oDescricao} onChange={e => setODescricao(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setODestaque(v => !v)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${oDestaque ? 'bg-primary border-primary' : 'border-border'}`}>
                  {oDestaque && <Check className="w-2.5 h-2.5 text-white" />}
                </button>
                <span className="text-xs text-muted-foreground cursor-pointer" onClick={() => setODestaque(v => !v)}>Destacar oferta</span>
              </div>
              <Button size="sm" onClick={handleAddOferta} disabled={oSaving} className="w-full gap-2 h-8">
                {oSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Publicar oferta
              </Button>
            </div>
          )}

          {ofertasLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : ofertas.length === 0 ? (
            <div className="bg-card border border-border/60 rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma oferta cadastrada.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ofertas.map(o => (
                <div key={o.id} className="bg-card border border-border/60 rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{o.produto}</p>
                      <Badge variant="outline" className="text-xs shrink-0">{o.pais}</Badge>
                      {o.destaque && <Badge className="text-xs shrink-0 bg-accent/10 text-accent border-accent/20"><Star className="w-2.5 h-2.5 mr-1" />Destaque</Badge>}
                      <Badge className={`text-xs shrink-0 ${o.ativo ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted text-muted-foreground'}`}>
                        {o.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {o.parceiro}
                      {o.desconto_percentual ? ` · ${o.desconto_percentual}% OFF` : o.preco_oferta ? ` · ${o.preco_oferta?.toFixed(2)}${o.preco_original ? ` (de ${o.preco_original?.toFixed(2)})` : ''}` : ''}
                      {o.categoria ? ` · ${o.categoria}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => toggleOfertaDestaque(o.id, !o.destaque)}
                      className="px-2 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground hover:text-foreground border border-border/40 transition-colors">
                      {o.destaque ? 'Remover ★' : '★ Destacar'}
                    </button>
                    <button onClick={() => toggleOfertaAtivo(o.id, !o.ativo)}
                      className="px-2 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground hover:text-foreground border border-border/40 transition-colors">
                      {o.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onClick={() => deleteOferta(o.id)}
                      className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'compras' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" /> Compras coletivas
            </h2>
            <Button size="sm" onClick={() => setShowAddCompra(v => !v)}
              variant={showAddCompra ? 'outline' : 'default'} className="gap-1.5 h-8 text-xs">
              {showAddCompra ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddCompra ? 'Cancelar' : 'Nova compra'}
            </Button>
          </div>

          {showAddCompra && (
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Produto <span className="text-destructive">*</span></Label>
                  <Input className="h-8 text-sm" placeholder="Ex: Filamento PLA Premium 1kg" value={cProduto} onChange={e => setCProduto(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Fornecedor <span className="text-destructive">*</span></Label>
                  <Input className="h-8 text-sm" placeholder="Ex: Polymaker" value={cFornecedor} onChange={e => setCFornecedor(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">País <span className="text-destructive">*</span></Label>
                  <Select value={cPais} onValueChange={v => setCPais(v ?? '')}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PAISES.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Preço cheio (R$) <span className="text-destructive">*</span></Label>
                  <Input className="h-8 text-sm" type="number" step="0.01" placeholder="0.00" value={cPrecoCheio} onChange={e => setCPrecoCheio(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Preço grupo (R$) <span className="text-destructive">*</span></Label>
                  <Input className="h-8 text-sm" type="number" step="0.01" placeholder="0.00" value={cPrecoGrupo} onChange={e => setCPrecoGrupo(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Preço Pro (R$) <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input className="h-8 text-sm" type="number" step="0.01" placeholder="0.00" value={cPrecoPro} onChange={e => setCPrecoPro(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Mínimo de adesões <span className="text-destructive">*</span></Label>
                  <Input className="h-8 text-sm" type="number" placeholder="50" value={cMinimo} onChange={e => setCMinimo(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Prazo (dias) <span className="text-destructive">*</span></Label>
                  <Input className="h-8 text-sm" type="number" placeholder="30" value={cPrazo} onChange={e => setCPrazo(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Imagem URL <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input className="h-8 text-sm" placeholder="https://..." value={cImagem} onChange={e => setCImagem(e.target.value)} />
                </div>
              </div>
              <Button size="sm" onClick={handleAddCompra} disabled={cSaving} className="w-full gap-2 h-8">
                {cSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Publicar compra
              </Button>
            </div>
          )}

          {comprasLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : compras.length === 0 ? (
            <div className="bg-card border border-border/60 rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma compra coletiva cadastrada.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {compras.map(c => (
                <div key={c.id} className="bg-card border border-border/60 rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{c.produto}</p>
                      <Badge variant="outline" className="text-xs shrink-0">{c.pais}</Badge>
                      <Badge className={`text-xs shrink-0 ${c.ativo ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted text-muted-foreground'}`}>
                        {c.ativo ? 'Aberta' : 'Encerrada'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.fornecedor} · R$ {c.preco_grupo?.toFixed(2)} (grupo) · {c.atual_adesoes}/{c.minimo_adesoes} adesões</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => toggleCompraAtivo(c.id, !c.ativo)}
                      className="px-2 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground hover:text-foreground border border-border/40 transition-colors">
                      {c.ativo ? 'Encerrar' : 'Reabrir'}
                    </button>
                    <button onClick={() => deleteCompra(c.id)}
                      className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'conteudo' && <div className="grid lg:grid-cols-2 gap-6 items-start">

        {/* ── STL COLUMN ── */}
        <div className="space-y-4">
          {/* Column header */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Box className="w-4 h-4 text-primary" /> Modelos STL
            </h2>
            <Button size="sm" onClick={() => setShowAddStl(v => !v)}
              variant={showAddStl ? 'outline' : 'default'} className="gap-1.5 h-8 text-xs">
              {showAddStl ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddStl ? 'Cancelar' : 'Adicionar'}
            </Button>
          </div>

          {/* Add STL form */}
          {showAddStl && (
            <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Link externo</Label>
                <div className="relative">
                  <Input
                    className="h-8 text-sm pr-8"
                    placeholder="https://www.printables.com/model/..."
                    value={sLink}
                    onChange={e => setSLink(e.target.value)}
                    onBlur={async () => {
                      if (!sLink.trim()) return
                      setSFetching(true)
                      const meta = await fetchPageMeta(sLink.trim())
                      if (meta.title && !sTitle) setSTitle(meta.title)
                      if (meta.image && !sThumb) setSThumb(meta.image)
                      setSFetching(false)
                    }}
                  />
                  {sFetching && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2" />}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Título</Label>
                <Input className="h-8 text-sm" placeholder="Preenchido automaticamente" value={sTitle} onChange={e => setSTitle(e.target.value)} />
              </div>
              {sThumb && (
                <div className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-xl">
                  <img src={sThumb} alt="" className="w-20 h-14 rounded-lg object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  <p className="text-xs text-muted-foreground line-clamp-2">Thumbnail detectada automaticamente</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Thumbnail URL <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input className="h-8 text-sm" placeholder="Preenchido automaticamente" value={sThumb} onChange={e => setSThumb(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tags</Label>
                  <Input className="h-8 text-sm" placeholder="Bambu, suporte, PLA" value={sTags} onChange={e => setSTags(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setSFeatured(v => !v)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${sFeatured ? 'bg-primary border-primary' : 'border-border'}`}>
                  {sFeatured && <Check className="w-2.5 h-2.5 text-white" />}
                </button>
                <span className="text-xs text-muted-foreground cursor-pointer" onClick={() => setSFeatured(v => !v)}>Destaque</span>
              </div>
              <Button size="sm" onClick={handleAddStl} disabled={sSaving || sFetching} className="w-full gap-2 h-8">
                {sSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Publicar
              </Button>
            </div>
          )}

          {/* Status filter */}
          <StatusBar value={stlFilter} onChange={setStlFilter} />

          {/* STL list */}
          {stlLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : stlPosts.length === 0 ? (
            <EmptyState filter={stlFilter} type="modelo" />
          ) : (
            <div className="space-y-2">
              {stlPosts.map(post => (
                <div key={post.id} className="bg-card border border-border/60 rounded-xl p-3 flex gap-3">
                  {post.thumbnail_url
                    ? <img src={post.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    : <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center shrink-0"><Box className="w-5 h-5 text-muted-foreground/40" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                      {post.is_featured && <Badge className="text-xs px-1 py-0 bg-accent/10 text-accent border-accent/20 shrink-0">★</Badge>}
                    </div>
                    {post.external_link && (
                      <a href={post.external_link} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{post.external_link.replace(/^https?:\/\/(www\.)?/, '')}</span>
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(post.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <ActionButtons
                    filter={stlFilter}
                    isFeatured={post.is_featured}
                    onApprove={() => updateStlStatus(post.id, 'approved')}
                    onReject={() => updateStlStatus(post.id, 'rejected')}
                    onToggleFeatured={() => toggleStlFeatured(post.id, !post.is_featured)}
                    onDelete={() => deleteStl(post.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── VIDEO COLUMN ── */}
        <div className="space-y-4">
          {/* Column header */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" /> Vídeos
            </h2>
            <Button size="sm" onClick={() => setShowAddVideo(v => !v)}
              variant={showAddVideo ? 'outline' : 'default'} className="gap-1.5 h-8 text-xs">
              {showAddVideo ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddVideo ? 'Cancelar' : 'Adicionar'}
            </Button>
          </div>

          {/* Add video form */}
          {showAddVideo && (
            <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Link YouTube</Label>
                <div className="relative">
                  <Input
                    className="h-8 text-sm pr-8"
                    placeholder="https://youtube.com/watch?v=..."
                    value={vUrl}
                    onChange={e => setVUrl(e.target.value)}
                    onBlur={async () => {
                      const ytId = extractYoutubeId(vUrl)
                      if (!ytId || vTitle) return
                      setVFetching(true)
                      const title = await fetchYoutubeTitle(vUrl)
                      if (title) setVTitle(title)
                      setVFetching(false)
                    }}
                  />
                  {vFetching && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2" />}
                </div>
              </div>
              {vUrl && extractYoutubeId(vUrl) && (
                <div className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-xl">
                  <img src={`https://img.youtube.com/vi/${extractYoutubeId(vUrl)}/mqdefault.jpg`} alt="" className="w-20 rounded-lg aspect-video object-cover" />
                  <p className="text-xs text-foreground font-medium line-clamp-2">{vTitle || 'Carregando título…'}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Título</Label>
                <Input className="h-8 text-sm" placeholder="Preenchido automaticamente" value={vTitle} onChange={e => setVTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tags</Label>
                  <Input className="h-8 text-sm" placeholder="calibração, tutorial" value={vTags} onChange={e => setVTags(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Descrição</Label>
                  <Input className="h-8 text-sm" placeholder="Opcional" value={vDesc} onChange={e => setVDesc(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setVFeatured(v => !v)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${vFeatured ? 'bg-primary border-primary' : 'border-border'}`}>
                  {vFeatured && <Check className="w-2.5 h-2.5 text-white" />}
                </button>
                <span className="text-xs text-muted-foreground cursor-pointer" onClick={() => setVFeatured(v => !v)}>Destaque</span>
              </div>
              <Button size="sm" onClick={handleAddVideo} disabled={vSaving || vFetching} className="w-full gap-2 h-8">
                {vSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Publicar
              </Button>
            </div>
          )}

          {/* Status filter */}
          <StatusBar value={videoFilter} onChange={setVideoFilter} />

          {/* Video list */}
          {videoLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : videoPosts.length === 0 ? (
            <EmptyState filter={videoFilter} type="vídeo" />
          ) : (
            <div className="space-y-2">
              {videoPosts.map(post => (
                <div key={post.id} className="bg-card border border-border/60 rounded-xl p-3 flex gap-3">
                  <div className="relative shrink-0 w-20 aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={`https://img.youtube.com/vi/${post.youtube_id}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{post.title}</p>
                      {post.is_featured && <Badge className="text-xs px-1 py-0 bg-accent/10 text-accent border-accent/20 shrink-0">★</Badge>}
                    </div>
                    {post.tags.length > 0 && (
                      <p className="text-xs text-muted-foreground truncate">{post.tags.join(' · ')}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(post.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <ActionButtons
                    filter={videoFilter}
                    isFeatured={post.is_featured}
                    onApprove={() => updateVideoStatus(post.id, 'approved')}
                    onReject={() => updateVideoStatus(post.id, 'rejected')}
                    onToggleFeatured={() => toggleVideoFeatured(post.id, !post.is_featured)}
                    onDelete={() => deleteVideo(post.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>}

    </div>
  )
}

function StatusBar({ value, onChange }: { value: StatusFilter; onChange: (v: StatusFilter) => void }) {
  return (
    <div className="flex gap-1.5">
      {STATUS_OPTIONS.map(({ key, label, icon: Icon, colors }) => (
        <button key={key} onClick={() => onChange(key)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            value === key ? colors : 'bg-muted/40 text-muted-foreground border-border/40 hover:border-primary/20'
          }`}>
          <Icon className="w-3 h-3" /> {label}
        </button>
      ))}
    </div>
  )
}

function ActionButtons({ filter, isFeatured, onApprove, onReject, onToggleFeatured, onDelete }: {
  filter: StatusFilter; isFeatured: boolean
  onApprove: () => void; onReject: () => void
  onToggleFeatured: () => void; onDelete: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      {filter === 'pending' && (
        <>
          <button onClick={onApprove} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-600/10 text-green-400 hover:bg-green-600/20 border border-green-600/20 transition-colors">
            <Check className="w-3 h-3" /> Aprovar
          </button>
          <button onClick={onReject} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors">
            <X className="w-3 h-3" /> Rejeitar
          </button>
        </>
      )}
      {filter === 'approved' && (
        <button onClick={onToggleFeatured} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground hover:text-foreground border border-border/40 transition-colors">
          {isFeatured ? 'Remover ★' : '★ Destacar'}
        </button>
      )}
      {filter === 'rejected' && (
        <button onClick={onApprove} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-600/10 text-green-400 hover:bg-green-600/20 border border-green-600/20 transition-colors">
          <Check className="w-3 h-3" /> Aprovar
        </button>
      )}
      <button onClick={onDelete} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors">
        <X className="w-3 h-3" /> Excluir
      </button>
    </div>
  )
}

function EmptyState({ filter, type }: { filter: StatusFilter; type: string }) {
  const msg = filter === 'pending' ? `Nenhum ${type} aguardando aprovação.`
    : filter === 'approved' ? `Nenhum ${type} aprovado ainda.`
    : `Nenhum ${type} rejeitado.`
  return (
    <div className="bg-card border border-border/60 rounded-xl p-8 text-center">
      <p className="text-sm text-muted-foreground">{msg}</p>
    </div>
  )
}
