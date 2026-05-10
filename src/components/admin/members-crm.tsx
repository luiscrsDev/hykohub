'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Loader2, Search, X, Users, Star, Printer, BookOpen,
  MapPin, ChevronRight, Save, ShieldCheck, ShieldOff,
} from 'lucide-react'

type Member = {
  id: string; nome: string; email: string
  cidade: string | null; estado: string | null; pais: string | null
  tier: 'level0' | 'level1' | 'level2' | 'level3'
  trust_score: number; is_pro: boolean; is_admin: boolean
  tem_impressora: boolean; interesse_pool: string | null
  interesse_aprendizado: string[] | null; tipos_filamento: string[] | null
  nivel_experiencia: string | null; bio: string | null
  consumo_mensal_kg: number | null; horas_semana: number | null
  admin_notes: string | null; created_at: string
}

type MemberPrinter = {
  id: string; custom_model_name: string | null
  printer_models: { marca: string; modelo: string; slug: string } | null
}

const TIER_LABELS = { level0: 'Membro', level1: 'Membro+', level2: 'Pro Candidate', level3: 'Pro Qualified' }
const TIER_COLORS: Record<string, string> = {
  level0: 'bg-muted text-muted-foreground border-border/40',
  level1: 'bg-primary/10 text-primary border-primary/20',
  level2: 'bg-accent/10 text-accent border-accent/20',
  level3: 'bg-green-500/10 text-green-600 border-green-500/20',
}
const APRENDIZADO_LABELS: Record<string, string> = {
  cursos_online: 'Cursos online',
  mentoria_individual: 'Mentoria individual',
  mentoria_grupo: 'Mentoria em grupo',
  workshops: 'Workshops',
}
const POOL_LABELS: Record<string, string> = { sim: 'Sim', nao: 'Não', talvez: 'Talvez' }
const POOL_COLORS: Record<string, string> = {
  sim: 'bg-green-500/10 text-green-600 border-green-500/20',
  talvez: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  nao: 'bg-muted text-muted-foreground border-border/40',
}

export function MembersCrm() {
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [proFilter, setProFilter] = useState<string>('all')
  const [aprendizadoFilter, setAprendizadoFilter] = useState(false)
  const [selected, setSelected] = useState<Member | null>(null)
  const [drawerPrinters, setDrawerPrinters] = useState<MemberPrinter[]>([])
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [editTier, setEditTier] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [savingTier, setSavingTier] = useState(false)
  const [savingPro, setSavingPro] = useState(false)
  const [savingAdmin, setSavingAdmin] = useState(false)

  useEffect(() => { loadMembers() }, [])

  async function loadMembers() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id,nome,email,cidade,estado,pais,tier,trust_score,is_pro,is_admin,tem_impressora,interesse_pool,interesse_aprendizado,tipos_filamento,nivel_experiencia,bio,consumo_mensal_kg,horas_semana,admin_notes,created_at')
      .order('created_at', { ascending: false })
    setMembers((data as Member[]) ?? [])
    setLoading(false)
  }

  async function openDrawer(m: Member) {
    setSelected(m)
    setEditTier(m.tier)
    setNotes(m.admin_notes ?? '')
    setDrawerLoading(true)
    const { data } = await supabase
      .from('user_printers')
      .select('id, custom_model_name, printer_models(marca, modelo, slug)')
      .eq('user_id', m.id)
    setDrawerPrinters((data as MemberPrinter[]) ?? [])
    setDrawerLoading(false)
  }

  function closeDrawer() { setSelected(null); setDrawerPrinters([]) }

  async function saveTier() {
    if (!selected) return
    setSavingTier(true)
    const { error } = await supabase.from('profiles').update({ tier: editTier } as never).eq('id', selected.id)
    setSavingTier(false)
    if (error) { toast.error('Erro ao salvar tier'); return }
    toast.success('Tier atualizado')
    const updated = { ...selected, tier: editTier as Member['tier'] }
    setSelected(updated)
    setMembers(prev => prev.map(m => m.id === selected.id ? updated : m))
  }

  async function togglePro() {
    if (!selected) return
    setSavingPro(true)
    const newVal = !selected.is_pro
    const { error } = await supabase.from('profiles').update({ is_pro: newVal } as never).eq('id', selected.id)
    setSavingPro(false)
    if (error) { toast.error('Erro'); return }
    toast.success(newVal ? 'Membro promovido a Pro' : 'Status Pro removido')
    const updated = { ...selected, is_pro: newVal }
    setSelected(updated)
    setMembers(prev => prev.map(m => m.id === selected.id ? updated : m))
  }

  async function toggleAdmin() {
    if (!selected) return
    setSavingAdmin(true)
    const newVal = !selected.is_admin
    const { error } = await supabase.from('profiles').update({ is_admin: newVal } as never).eq('id', selected.id)
    setSavingAdmin(false)
    if (error) { toast.error('Erro'); return }
    toast.success(newVal ? 'Admin concedido' : 'Admin removido')
    const updated = { ...selected, is_admin: newVal }
    setSelected(updated)
    setMembers(prev => prev.map(m => m.id === selected.id ? updated : m))
  }

  async function saveNotes() {
    if (!selected) return
    setSavingNotes(true)
    const { error } = await supabase.from('profiles').update({ admin_notes: notes || null } as never).eq('id', selected.id)
    setSavingNotes(false)
    if (error) { toast.error('Erro ao salvar notas'); return }
    toast.success('Notas salvas')
    const updated = { ...selected, admin_notes: notes || null }
    setSelected(updated)
    setMembers(prev => prev.map(m => m.id === selected.id ? updated : m))
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return members.filter(m => {
      if (q && !m.nome.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false
      if (tierFilter !== 'all' && m.tier !== tierFilter) return false
      if (proFilter === 'yes' && !m.is_pro) return false
      if (proFilter === 'no' && m.is_pro) return false
      if (aprendizadoFilter && (!m.interesse_aprendizado || m.interesse_aprendizado.length === 0)) return false
      return true
    })
  }, [members, search, tierFilter, proFilter, aprendizadoFilter])

  // Stats
  const stats = useMemo(() => ({
    total: members.length,
    pro: members.filter(m => m.is_pro).length,
    comImpressora: members.filter(m => m.tem_impressora).length,
    interesseAprendizado: members.filter(m => m.interesse_aprendizado && m.interesse_aprendizado.length > 0).length,
  }), [members])

  const initials = (nome: string) =>
    nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Total membros', value: stats.total, color: 'text-primary' },
          { icon: Star, label: 'Pro', value: stats.pro, color: 'text-accent' },
          { icon: Printer, label: 'Com impressora', value: stats.comImpressora, color: 'text-green-500' },
          { icon: BookOpen, label: 'Interesse educação', value: stats.interesseAprendizado, color: 'text-blue-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-card border border-border/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9 h-9 text-sm" placeholder="Buscar por nome ou e-mail…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Todos os tiers</option>
          <option value="level0">Membro</option>
          <option value="level1">Membro+</option>
          <option value="level2">Pro Candidate</option>
          <option value="level3">Pro Qualified</option>
        </select>
        <select
          value={proFilter}
          onChange={e => setProFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Pro e não-Pro</option>
          <option value="yes">Somente Pro</option>
          <option value="no">Somente não-Pro</option>
        </select>
        <button
          onClick={() => setAprendizadoFilter(v => !v)}
          className={`h-9 px-3 rounded-lg border text-sm font-medium transition-colors ${aprendizadoFilter ? 'bg-primary border-primary text-white' : 'bg-card border-border text-muted-foreground hover:border-primary/40'}`}
        >
          🎓 Quer aprender
        </button>
        {(search || tierFilter !== 'all' || proFilter !== 'all' || aprendizadoFilter) && (
          <button onClick={() => { setSearch(''); setTierFilter('all'); setProFilter('all'); setAprendizadoFilter(false) }}
            className="h-9 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">{filtered.length} membro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>

      {/* Member list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum membro encontrado.</p>
          </div>
        ) : filtered.map(m => (
          <button key={m.id} onClick={() => openDrawer(m)}
            className="w-full bg-card border border-border/60 rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors text-left group">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
              {initials(m.nome)}
            </div>
            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-foreground">{m.nome}</p>
                {m.is_pro && <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-1.5 py-0 rounded-full">Pro</span>}
                {m.is_admin && <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-1.5 py-0 rounded-full">Admin</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{m.email}</p>
            </div>
            {/* Meta */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              {(m.cidade || m.pais) && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{m.cidade ?? m.pais}
                </span>
              )}
              <Badge className={`text-xs px-2 py-0 border ${TIER_COLORS[m.tier]}`} variant="secondary">
                {TIER_LABELS[m.tier]}
              </Badge>
              <span className="text-xs text-muted-foreground w-14 text-right">{m.trust_score} pts</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </button>
        ))}
      </div>

      {/* Drawer overlay */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={closeDrawer} />
          <div className="w-full max-w-md bg-background border-l border-border flex flex-col h-full overflow-y-auto">

            {/* Drawer header */}
            <div className="flex items-center justify-between p-5 border-b border-border/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {initials(selected.nome)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selected.nome}</p>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                </div>
              </div>
              <button onClick={closeDrawer} className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-5 space-y-5">

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={`border ${TIER_COLORS[selected.tier]}`} variant="secondary">{TIER_LABELS[selected.tier]}</Badge>
                <Badge className="bg-muted text-muted-foreground border-border/40" variant="secondary">{selected.trust_score} pts</Badge>
                {selected.is_pro && <Badge className="bg-accent/10 text-accent border-accent/20" variant="secondary">Pro</Badge>}
                {selected.is_admin && <Badge className="bg-primary/10 text-primary border-primary/20" variant="secondary">Admin</Badge>}
                {selected.interesse_pool && (
                  <Badge className={`border ${POOL_COLORS[selected.interesse_pool] ?? ''}`} variant="secondary">
                    Pool: {POOL_LABELS[selected.interesse_pool]}
                  </Badge>
                )}
              </div>

              {/* Location + profile */}
              <div className="space-y-1 text-sm">
                {(selected.cidade || selected.pais) && (
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {[selected.cidade, selected.estado, selected.pais].filter(Boolean).join(', ')}
                  </p>
                )}
                {selected.nivel_experiencia && (
                  <p className="text-muted-foreground">Nível: <span className="text-foreground capitalize">{selected.nivel_experiencia}</span></p>
                )}
                {selected.consumo_mensal_kg && (
                  <p className="text-muted-foreground">Consumo: <span className="text-foreground">{selected.consumo_mensal_kg} kg/mês</span></p>
                )}
                {selected.horas_semana && (
                  <p className="text-muted-foreground">Impressão: <span className="text-foreground">{selected.horas_semana}h/semana</span></p>
                )}
                <p className="text-muted-foreground">Membro desde: <span className="text-foreground">{new Date(selected.created_at).toLocaleDateString('pt-BR')}</span></p>
              </div>

              {/* Bio */}
              {selected.bio && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bio</p>
                  <p className="text-sm text-foreground bg-muted/40 rounded-xl p-3 leading-relaxed">{selected.bio}</p>
                </div>
              )}

              {/* Impressoras */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Impressoras</p>
                {drawerLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : drawerPrinters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma cadastrada</p>
                ) : (
                  <div className="space-y-1.5">
                    {drawerPrinters.map(up => (
                      <div key={up.id} className="flex items-center gap-2 text-sm bg-muted/40 rounded-lg px-3 py-2">
                        <Printer className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{up.printer_models?.slug === 'outra' && up.custom_model_name ? up.custom_model_name : `${up.printer_models?.marca} ${up.printer_models?.modelo}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Filamentos */}
              {selected.tipos_filamento && selected.tipos_filamento.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Filamentos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tipos_filamento.map(f => (
                      <span key={f} className="text-xs bg-muted/60 text-foreground px-2 py-1 rounded-full border border-border/40">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interesses aprendizado */}
              {selected.interesse_aprendizado && selected.interesse_aprendizado.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Interesse em aprendizado</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.interesse_aprendizado.map(v => (
                      <span key={v} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">{APRENDIZADO_LABELS[v] ?? v}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── ACTIONS ── */}
              <div className="border-t border-border/60 pt-4 space-y-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Ações admin</p>

                {/* Change tier */}
                <div className="space-y-2">
                  <Label className="text-xs">Tier</Label>
                  <div className="flex gap-2">
                    <select
                      value={editTier}
                      onChange={e => setEditTier(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="level0">Membro</option>
                      <option value="level1">Membro+</option>
                      <option value="level2">Pro Candidate</option>
                      <option value="level3">Pro Qualified</option>
                    </select>
                    <Button size="sm" onClick={saveTier} disabled={savingTier || editTier === selected.tier} className="gap-1.5 shrink-0">
                      {savingTier ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Salvar
                    </Button>
                  </div>
                </div>

                {/* Toggle Pro + Admin */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={selected.is_pro ? 'destructive' : 'outline'}
                    onClick={togglePro}
                    disabled={savingPro}
                    className="gap-1.5"
                  >
                    {savingPro ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
                    {selected.is_pro ? 'Remover Pro' : 'Tornar Pro'}
                  </Button>
                  <Button
                    size="sm"
                    variant={selected.is_admin ? 'destructive' : 'outline'}
                    onClick={toggleAdmin}
                    disabled={savingAdmin}
                    className="gap-1.5"
                  >
                    {savingAdmin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : selected.is_admin ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {selected.is_admin ? 'Rem. Admin' : 'Tornar Admin'}
                  </Button>
                </div>
              </div>

              {/* Admin notes */}
              <div className="space-y-2">
                <Label className="text-xs">Notas internas <span className="text-muted-foreground">(visível só para admins)</span></Label>
                <Textarea
                  rows={3}
                  placeholder="Anotações sobre este membro…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="text-sm resize-none"
                />
                <Button size="sm" variant="outline" onClick={saveNotes} disabled={savingNotes} className="w-full gap-1.5">
                  {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Salvar notas
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
