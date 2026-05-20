import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Bell, ShoppingCart, Printer, Star, ChevronRight, Package, Box, Play, MapPin } from 'lucide-react'
import { StlCardMini } from '@/components/ui/stl-card-mini'

const PAIS_LABEL: Record<string, string> = {
  BR: '🇧🇷 Brasil', PT: '🇵🇹 Portugal', US: '🇺🇸 EUA',
  CA: '🇨🇦 Canadá', GB: '🇬🇧 Reino Unido', DE: '🇩🇪 Alemanha',
  FR: '🇫🇷 França', ES: '🇪🇸 Espanha', IT: '🇮🇹 Itália',
  NL: '🇳🇱 Holanda', CH: '🇨🇭 Suíça', AU: '🇦🇺 Austrália',
  NZ: '🇳🇿 Nova Zelândia', JP: '🇯🇵 Japão', AR: '🇦🇷 Argentina',
  CL: '🇨🇱 Chile', MX: '🇲🇽 México', OTHER: '🌍 Outro',
}

type Profile = Database['public']['Tables']['profiles']['Row']
type Alert = Database['public']['Tables']['alerts']['Row']
type GroupPurchase = Database['public']['Tables']['group_purchases']['Row']
type UserPrinter = Database['public']['Tables']['user_printers']['Row'] & {
  printer_models: Database['public']['Tables']['printer_models']['Row'] | null
}
type StlPost = { id: string; title: string; thumbnail_url: string | null; external_link: string | null; file_url: string | null; tags: string[] }
type VideoPost = { id: string; title: string; youtube_id: string; tags: string[] }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = rawProfile as Profile | null

  const { data: rawAlerts } = await supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(5)
  const alerts = rawAlerts as Alert[] | null

  const userPais = profile?.pais ?? null
  let gpQuery = supabase.from('group_purchases').select('*').eq('ativo', true).order('created_at', { ascending: false }).limit(3)
  if (userPais) gpQuery = gpQuery.eq('pais', userPais)
  const { data: rawGroupPurchases } = await gpQuery
  const groupPurchases = rawGroupPurchases as GroupPurchase[] | null

  const { data: rawUserPrinters } = await supabase.from('user_printers').select('*, printer_models(*)').eq('user_id', user.id)
  const userPrinters = rawUserPrinters as UserPrinter[] | null

  const { data: rawStl } = await supabase.from('stl_posts').select('id,title,thumbnail_url,external_link,file_url,tags')
    .eq('status', 'approved').order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(4)
  const stlPosts = rawStl as StlPost[] | null

  const { data: rawVideos } = await supabase.from('video_posts').select('id,title,youtube_id,tags')
    .eq('status', 'approved').order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(3)
  const videoPosts = rawVideos as VideoPost[] | null

  const completeness = calcCompleteness(profile, userPrinters)

  return (
    <div className="space-y-8">

      {/* Completeness bar — top priority when incomplete */}
      {completeness.pct < 100 && (
        <div className="bg-card border border-border/60 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="font-semibold text-foreground">Complete seu perfil</h2>
            <span className="text-sm font-bold text-primary">{completeness.pct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mb-5">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${completeness.pct}%` }} />
          </div>
          <div className="flex items-start gap-0">
            {completeness.steps.map((step, i) => {
              const isNext = !step.done && completeness.steps.slice(0, i).every(s => s.done)
              const isLast = i === completeness.steps.length - 1
              return (
                <Link key={step.label} href={step.href} className="flex-1 group">
                  <div className="flex flex-col items-center text-center px-1">
                    <div className="flex items-center w-full mb-2">
                      <div className={`h-0.5 flex-1 transition-colors ${i === 0 ? 'opacity-0' : step.done ? 'bg-accent' : 'bg-border'}`} />
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                        step.done
                          ? 'bg-accent/20 text-accent'
                          : isNext
                          ? 'bg-primary text-white shadow-md shadow-primary/30 group-hover:shadow-primary/50'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.done ? '✓' : i + 1}
                      </div>
                      <div className={`h-0.5 flex-1 transition-colors ${isLast ? 'opacity-0' : step.done ? 'bg-accent' : 'bg-border'}`} />
                    </div>
                    <span className={`text-xs leading-tight ${
                      step.done ? 'text-muted-foreground' : isNext ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}>{step.label}</span>
                    {isNext && (
                      <span className="text-xs text-primary font-medium mt-1">Fazer agora</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── MAIN AREA: Alerts + Sidebar ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Alerts feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Alertas e novidades
            </h2>
            <span className="text-xs text-muted-foreground">{alerts?.length ?? 0} itens</span>
          </div>
          {!alerts || alerts.length === 0 ? (
            <EmptyFeed hasPrinter={profile?.tem_impressora ?? false} />
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Group purchases */}
          <div className="bg-card border border-border/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" /> Compras do grupo
              </h3>
              <div className="flex items-center gap-2">
                {userPais && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {PAIS_LABEL[userPais] ?? userPais}
                  </Badge>
                )}
                <Link href="/compras">
                  <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary h-auto p-0 gap-1">
                    Ver todas <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
            {!userPais ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300 leading-relaxed">
                  <Link href="/perfil" className="underline underline-offset-2 font-medium">Defina seu país</Link>{' '}
                  no perfil para ver as compras da sua região.
                </p>
              </div>
            ) : !groupPurchases || groupPurchases.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma compra ativa agora.</p>
            ) : (
              <div className="space-y-3">
                {groupPurchases.map((gp) => <GroupPurchaseCard key={gp.id} gp={gp} />)}
              </div>
            )}
          </div>

          {/* Pro pool teaser */}
          {!profile?.is_pro && (
            <div className="bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/20 rounded-2xl p-5">
              <Badge className="mb-3 bg-accent/10 text-accent border-accent/20 text-xs">Pool Comercial</Badge>
              <h3 className="font-semibold text-foreground mb-1">Transforme sua impressora em renda</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Estamos estruturando parcerias com marcas. Quem se qualificar agora entra na fila prioritária.
              </p>
              <Link href="/vire-pro">
                <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-white gap-1.5">
                  Quero ser Pro <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* ── EXPLORE SECTION: 2 columns ── */}
      {((stlPosts && stlPosts.length > 0) || (videoPosts && videoPosts.length > 0)) && (
        <div className="pt-2 border-t border-border/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Explore</p>

          <div className="grid lg:grid-cols-2 gap-6">

            {/* STL column */}
            {stlPosts && stlPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Box className="w-4 h-4 text-primary" /> Modelos em destaque
                  </h3>
                  <Link href="/modelos">
                    <Button variant="ghost" size="sm" className="text-xs text-primary h-auto p-0 gap-1">
                      Ver todos <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {stlPosts.map(p => (
                    <StlCardMini
                      key={p.id}
                      id={p.id}
                      title={p.title}
                      thumbnail_url={p.thumbnail_url}
                      external_link={p.external_link}
                      file_url={p.file_url}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Videos column */}
            {videoPosts && videoPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" /> Vídeos recentes
                  </h3>
                  <Link href="/videos">
                    <Button variant="ghost" size="sm" className="text-xs text-primary h-auto p-0 gap-1">
                      Ver todos <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-col gap-2.5">
                  {videoPosts.map(v => (
                    <Link key={v.id} href="/videos">
                      <div className="bg-card border border-border/60 rounded-xl overflow-hidden hover:border-primary/30 transition-colors group flex gap-3 p-2">
                        <div className="relative w-28 shrink-0 rounded-lg overflow-hidden aspect-video bg-muted">
                          <img src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`} alt={v.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <Play className="w-3 h-3 text-white fill-white" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <p className="text-xs font-medium text-foreground line-clamp-3 leading-snug">{v.title}</p>
                          {v.tags.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{v.tags.slice(0, 2).join(' · ')}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}

function EmptyFeed({ hasPrinter }: { hasPrinter: boolean }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-10 text-center">
      <Bell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
      <h3 className="font-medium text-foreground mb-1">Feed personalizado chegando</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {hasPrinter
          ? 'Alertas de firmware, dicas e STLs curados aparecerão aqui conforme você completa seu perfil.'
          : 'Adicione sua impressora no perfil para ativar o feed personalizado por modelo.'}
      </p>
      {!hasPrinter && (
        <Link href="/perfil" className="mt-4 inline-block">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Printer className="w-4 h-4" /> Adicionar impressora
          </Button>
        </Link>
      )}
    </div>
  )
}

function AlertCard({ alert }: { alert: Alert }) {
  const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
    firmware: { icon: Star, color: 'text-blue-500', label: 'Firmware' },
    seguranca: { icon: Bell, color: 'text-destructive', label: 'Segurança' },
    otimizacao: { icon: Star, color: 'text-accent', label: 'Otimização' },
    manutencao: { icon: Package, color: 'text-amber-500', label: 'Manutenção' },
  }
  const config = typeConfig[alert.categoria] ?? { icon: Bell, color: 'text-muted-foreground', label: alert.categoria }
  const Icon = config.icon

  return (
    <div className="bg-card border border-border/60 rounded-xl p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${config.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant="secondary" className="text-xs px-1.5 py-0">{config.label}</Badge>
            {alert.is_featured && (
              <Badge className="text-xs px-1.5 py-0 bg-primary/10 text-primary border-primary/20">Destaque</Badge>
            )}
          </div>
          <h4 className="font-medium text-foreground text-sm">{alert.titulo}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.descricao}</p>
          {alert.link_externo && (
            <a
              href={alert.link_externo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
            >
              Ver mais <ArrowRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function GroupPurchaseCard({ gp }: { gp: GroupPurchase }) {
  const pct = gp.minimo_adesoes > 0
    ? Math.min(100, Math.round((gp.atual_adesoes / gp.minimo_adesoes) * 100))
    : 0

  return (
    <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight truncate">{gp.produto}</p>
          <p className="text-xs text-muted-foreground">{gp.fornecedor}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-accent">${gp.preco_grupo?.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground line-through">${gp.preco_cheio?.toFixed(2)}</p>
        </div>
      </div>
      <div className="w-full bg-background rounded-full h-1.5 mb-1">
        <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{gp.atual_adesoes}/{gp.minimo_adesoes} membros</span>
        <span className="text-accent font-medium">{pct}%</span>
      </div>
    </div>
  )
}

function calcCompleteness(
  profile: Profile | null,
  printers: UserPrinter[] | null
): { pct: number; nextUnlock: string; steps: { label: string; done: boolean; href: string }[] } {
  const steps = [
    { label: 'Dados básicos', done: !!(profile?.nome && (profile as any)?.pais && profile?.cidade), href: '/perfil#basico' },
    { label: 'Impressora cadastrada', done: !!(printers && printers.length > 0), href: '/perfil#impressoras' },
    { label: 'Bio & experiência', done: !!(profile?.nivel_experiencia), href: '/perfil#bio' },
    { label: 'Consumo mensal', done: !!(profile?.consumo_mensal_kg), href: '/perfil#operacao' },
    { label: 'Interesse Pro', done: profile?.interesse_pool === 'sim' || profile?.interesse_pool === 'talvez', href: '/vire-pro' },
  ]
  const done = steps.filter(s => s.done).length
  const pct = Math.round((done / steps.length) * 100)

  const next = steps.find(s => !s.done)
  const unlockMessages: Record<string, string> = {
    'Impressora cadastrada': 'Adicione sua impressora para ativar o feed personalizado',
    'Bio & experiência': 'Complete seu perfil para ganhar trust score',
    'Consumo mensal': 'Informe seu consumo para entrar nas compras do grupo',
    'Interesse Pro': 'Marque interesse no Pool Pro para entrar na fila',
  }
  const nextUnlock = next ? (unlockMessages[next.label] ?? `Próximo: ${next.label}`) : 'Perfil completo!'

  return { pct, nextUnlock, steps }
}
