import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tag, MapPin, ExternalLink, Clock, Star } from 'lucide-react'
import Link from 'next/link'

type PartnerOffer = Database['public']['Tables']['partner_offers']['Row']

const PAIS_LABEL: Record<string, string> = {
  BR: '🇧🇷 Brasil', PT: '🇵🇹 Portugal', US: '🇺🇸 Estados Unidos',
  CA: '🇨🇦 Canadá', GB: '🇬🇧 Reino Unido', DE: '🇩🇪 Alemanha',
  FR: '🇫🇷 França', ES: '🇪🇸 Espanha', IT: '🇮🇹 Itália',
  NL: '🇳🇱 Holanda', CH: '🇨🇭 Suíça', AU: '🇦🇺 Austrália',
  NZ: '🇳🇿 Nova Zelândia', JP: '🇯🇵 Japão', AR: '🇦🇷 Argentina',
  CL: '🇨🇱 Chile', MX: '🇲🇽 México', OTHER: '🌍 Outro',
}

export default async function OfertasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('pais')
    .eq('id', user!.id)
    .single()

  const userPais = profile?.pais ?? null

  let query = supabase
    .from('partner_offers')
    .select('*')
    .eq('ativo', true)
    .order('destaque', { ascending: false })
    .order('created_at', { ascending: false })

  if (userPais) query = query.eq('pais', userPais)

  const { data: rawOffers } = await query
  const offers = rawOffers as PartnerOffer[] | null

  const destaque = offers?.filter(o => o.destaque) ?? []
  const normais = offers?.filter(o => !o.destaque) ?? []

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ofertas de parceiros</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Descontos exclusivos negociados pela Hyko com marcas parceiras. Direto para você.
          </p>
        </div>
        {userPais && (
          <Badge variant="secondary" className="flex items-center gap-1 shrink-0 mt-1">
            <MapPin className="w-3 h-3" />
            {PAIS_LABEL[userPais] ?? userPais}
          </Badge>
        )}
      </div>

      {!userPais && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            Defina seu país no{' '}
            <Link href="/perfil" className="underline underline-offset-2 font-medium">perfil</Link>
            {' '}para ver ofertas disponíveis na sua região.
          </p>
        </div>
      )}

      {offers?.length === 0 && (
        <div className="bg-card border border-border/60 rounded-2xl p-10 text-center">
          <Tag className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">Nenhuma oferta ativa</h3>
          <p className="text-sm text-muted-foreground">
            {userPais
              ? `Novas ofertas para ${PAIS_LABEL[userPais] ?? userPais} aparecem aqui quando parcerias são fechadas.`
              : 'Defina seu país no perfil para ver ofertas da sua região.'}
          </p>
        </div>
      )}

      {destaque.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-accent" /> Em destaque
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destaque.map(o => <OfferCard key={o.id} offer={o} featured />)}
          </div>
        </section>
      )}

      {normais.length > 0 && (
        <section>
          {destaque.length > 0 && (
            <h2 className="text-lg font-semibold text-foreground mb-4">Todas as ofertas</h2>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {normais.map(o => <OfferCard key={o.id} offer={o} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function OfferCard({ offer, featured }: { offer: PartnerOffer; featured?: boolean }) {
  const discount = offer.preco_original && offer.preco_original > 0
    ? Math.round(((offer.preco_original - offer.preco_oferta) / offer.preco_original) * 100)
    : null

  const expiresAt = offer.prazo_fim ? new Date(offer.prazo_fim) : null
  const isExpiringSoon = expiresAt
    ? (expiresAt.getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000
    : false

  return (
    <div className={`bg-card border rounded-2xl overflow-hidden flex flex-col gap-0 transition-colors ${
      featured
        ? 'border-accent/30 hover:border-accent/50'
        : 'border-border/60 hover:border-primary/30'
    }`}>
      {offer.imagem_url && (
        <div className="aspect-video bg-muted/40 overflow-hidden">
          <img
            src={offer.imagem_url}
            alt={offer.produto}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-foreground leading-tight">{offer.produto}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{offer.parceiro}</p>
            {offer.categoria && (
              <Badge variant="secondary" className="mt-1.5 text-xs px-1.5 py-0">{offer.categoria}</Badge>
            )}
          </div>
          {featured && (
            <Badge className="bg-accent/10 text-accent border-accent/20 shrink-0">
              <Star className="w-3 h-3 mr-1" /> Destaque
            </Badge>
          )}
        </div>

        {offer.descricao && (
          <p className="text-xs text-muted-foreground leading-relaxed -mt-1">{offer.descricao}</p>
        )}

        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-2xl font-bold text-foreground">R$ {offer.preco_oferta.toFixed(2)}</p>
            {offer.preco_original && (
              <p className="text-xs text-muted-foreground line-through">R$ {offer.preco_original.toFixed(2)}</p>
            )}
          </div>
          {discount !== null && discount > 0 && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-sm font-bold">
              -{discount}%
            </Badge>
          )}
        </div>

        {expiresAt && (
          <p className={`text-xs flex items-center gap-1 ${isExpiringSoon ? 'text-amber-400' : 'text-muted-foreground'}`}>
            <Clock className="w-3 h-3" />
            {isExpiringSoon ? 'Expira em breve · ' : 'Válido até '}
            {expiresAt.toLocaleDateString('pt-BR')}
          </p>
        )}

        {offer.link_compra ? (
          <a href={offer.link_compra} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="w-full bg-primary hover:bg-primary/90 gap-1.5">
              Ver oferta <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" className="w-full" disabled>
            Em breve
          </Button>
        )}
      </div>
    </div>
  )
}
