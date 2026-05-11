import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Users, TrendingDown, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

type GroupPurchase = Database['public']['Tables']['group_purchases']['Row']

const PAIS_LABEL: Record<string, string> = {
  BR: '🇧🇷 Brasil', PT: '🇵🇹 Portugal', US: '🇺🇸 Estados Unidos',
  CA: '🇨🇦 Canadá', GB: '🇬🇧 Reino Unido', DE: '🇩🇪 Alemanha',
  FR: '🇫🇷 França', ES: '🇪🇸 Espanha', IT: '🇮🇹 Itália',
  NL: '🇳🇱 Holanda', CH: '🇨🇭 Suíça', AU: '🇦🇺 Austrália',
  NZ: '🇳🇿 Nova Zelândia', JP: '🇯🇵 Japão', AR: '🇦🇷 Argentina',
  CL: '🇨🇱 Chile', MX: '🇲🇽 México', OTHER: '🌍 Outro',
}

export default async function ComprasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('pais')
    .eq('id', user!.id)
    .single()

  const userPais = profile?.pais ?? null

  let query = supabase
    .from('group_purchases')
    .select('*')
    .order('created_at', { ascending: false })

  if (userPais) {
    query = query.eq('pais', userPais)
  }

  const { data: rawPurchases } = await query
  const purchases = rawPurchases as GroupPurchase[] | null
  const abertas = purchases?.filter(p => p.ativo) ?? []
  const fechadas = purchases?.filter(p => !p.ativo) ?? []

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compras do grupo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            O consumo somado dos membros garante melhores preços. Quem está na plataforma vê o preço reduzido.
          </p>
        </div>
        {userPais && (
          <Badge variant="secondary" className="flex items-center gap-1 shrink-0 mt-1">
            <MapPin className="w-3 h-3" />
            {PAIS_LABEL[userPais] ?? userPais}
          </Badge>
        )}
      </div>

      {/* Aviso sem país */}
      {!userPais && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            Defina seu país no{' '}
            <Link href="/perfil" className="underline underline-offset-2 font-medium">perfil</Link>
            {' '}para ver as compras disponíveis na sua região.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Compras abertas', value: abertas.length, icon: ShoppingCart, color: 'text-primary' },
          { label: 'Membros ativos', value: '1.000+', icon: Users, color: 'text-accent' },
          { label: 'Desconto médio', value: '-15%', icon: TrendingDown, color: 'text-green-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border/60 rounded-xl p-4 flex items-center gap-3">
            <div className={`${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Compras abertas</h2>
        {abertas.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-2xl p-10 text-center">
            <ShoppingCart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">Nenhuma compra aberta</h3>
            <p className="text-sm text-muted-foreground">
              {userPais
                ? `Novas compras para ${userPais} aparecem aqui quando a equipe abre rodadas.`
                : 'Defina seu país no perfil para ver compras da sua região.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {abertas.map(gp => <PurchaseCard key={gp.id} gp={gp} />)}
          </div>
        )}
      </section>

      {/* Closed */}
      {fechadas.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Histórico</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fechadas.map(gp => <PurchaseCard key={gp.id} gp={gp} closed />)}
          </div>
        </section>
      )}
    </div>
  )
}

function PurchaseCard({ gp, closed }: { gp: GroupPurchase; closed?: boolean }) {
  const pct = gp.minimo_adesoes > 0
    ? Math.min(100, Math.round((gp.atual_adesoes / gp.minimo_adesoes) * 100))
    : 0
  const discount = gp.preco_cheio > 0
    ? Math.round(((gp.preco_cheio - gp.preco_grupo) / gp.preco_cheio) * 100)
    : 0

  return (
    <div className={`bg-card border rounded-2xl p-5 flex flex-col gap-4 ${closed ? 'opacity-60 border-border/40' : 'border-border/60 hover:border-primary/30 transition-colors'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground leading-tight">{gp.produto}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{gp.fornecedor}</p>
        </div>
        <Badge
          variant="secondary"
          className={closed ? 'bg-muted text-muted-foreground' : 'bg-accent/10 text-accent border-accent/20'}
        >
          {closed ? 'Encerrada' : 'Aberta'}
        </Badge>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">R$ {gp.preco_grupo?.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground line-through">R$ {gp.preco_cheio?.toFixed(2)}</p>
        </div>
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-sm font-bold">
          -{discount}%
        </Badge>
      </div>

      {!closed && (
        <>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {gp.atual_adesoes}/{gp.minimo_adesoes} membros</span>
              <span className="font-medium text-accent">{pct}% completo</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {gp.prazo_dias && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Prazo: {gp.prazo_dias} dias após atingir mínimo
            </p>
          )}

          <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
            Quero participar
          </Button>
        </>
      )}
    </div>
  )
}
