import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HykoHubLogo } from '@/components/ui/logo'
import { ArrowRight, Users, ShoppingCart, Briefcase, MapPin, Zap, Shield } from 'lucide-react'

const CITIES = ['Orlando', 'Boston', 'Atlanta', 'São Paulo', 'Rio de Janeiro', 'Porto Alegre', 'Recife']

const PILLARS = [
  {
    icon: Users,
    title: 'Comunidade & Aprendizado',
    description: 'Feed personalizado pelo seu modelo de impressora. Alertas de firmware, dicas de manutenção e STLs curados por brasileiros que entendem seu contexto.',
    cta: 'Explorar comunidade',
  },
  {
    icon: ShoppingCart,
    title: 'Compra em Grupo',
    description: 'O consumo somado dos membros garante -15% em PLA hoje. Quem está cadastrado vê o preço reduzido. Quem não está, paga cheio.',
    cta: 'Ver compras ativas',
  },
  {
    icon: Briefcase,
    title: 'Pool Comercial Pro',
    description: "Transforme sua impressora em renda recorrente. Jobs de marcas como Lowe's alocados para Pros qualificados conforme capacidade real.",
    cta: 'Quero ser Pro',
  },
]

const TESTIMONIALS = [
  { nome: 'Rafael M.', cidade: 'São Paulo', texto: 'Economizei $42 só no primeiro mês comprando filamento pelo grupo. Vale muito.' },
  { nome: 'Camila S.', cidade: 'Orlando', texto: 'O alerta de recall da Bambu chegou antes de qualquer grupo de WhatsApp. Salvou minha impressora.' },
  { nome: 'Diego A.', cidade: 'Porto Alegre', texto: 'Em 3 meses virei Pro e já peguei 4 jobs. A renda cobre o custo do filamento e mais.' },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
            <HykoHubLogo size={34} />
            <span className="font-display">Hyko<span className="text-primary">Hub</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#comunidade" className="hover:text-foreground transition-colors">Comunidade</Link>
            <Link href="#pool-pro" className="hover:text-foreground transition-colors">Pool Pro</Link>
            <Link href="#aprenda" className="hover:text-foreground transition-colors">Aprenda</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Entrar na comunidade
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-accent/5 pt-20 pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-5 text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                IMPRIMA. FABRIQUE. PROTOTIPE.{' '}
                <span className="text-primary">COLABORE.</span>
              </p>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
                Crie. Conecte.{' '}
                <span className="text-primary">Transforme.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                Comunidade maker e tech que conecta pessoas, ideias e ferramentas para transformar criatividade em soluções reais.{' '}
                <strong className="text-foreground">Comece em 2 minutos.</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/cadastro">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-base gap-2 w-full sm:w-auto">
                    Entrar na comunidade
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#pool-pro">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base w-full sm:w-auto">
                    Quero conhecer o pool comercial
                  </Button>
                </Link>
              </div>
            </div>

            {/* Social proof cities */}
            <div className="mt-16 flex flex-wrap justify-center gap-3">
              {CITIES.map(city => (
                <span key={city} className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {city}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 3 Pillars */}
        <section id="comunidade" className="py-24 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {PILLARS.map(({ icon: Icon, title, description, cta }) => (
                <div key={title} className="group flex flex-col gap-5 p-8 rounded-2xl border border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-card">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                  <Link href="/cadastro" className="mt-auto">
                    <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/5 p-0 h-auto gap-1.5">
                      {cta} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              O que membros estão dizendo
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(({ nome, cidade, texto }) => (
                <div key={nome} className="p-6 rounded-2xl bg-card border border-border/60">
                  <p className="text-muted-foreground leading-relaxed mb-5">&ldquo;{texto}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                      {nome[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{nome}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{cidade}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pool Pro section */}
        <section id="pool-pro" className="py-24 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-6 bg-accent/10 text-accent border-accent/20">Pool Comercial Pro</Badge>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Estamos em conversas avançadas com Lowe&apos;s para um piloto de produção sob demanda
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Não temos data fechada — pedidos B2B grandes seguem ritmo do cliente, não do nosso.{' '}
                O que sabemos é que, quando o piloto começar, vamos chamar primeiro quem já estiver Pro qualified.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
                {[
                  { icon: Zap, label: 'Marque interesse', desc: 'Desbloqueie os campos de capacidade no cadastro' },
                  { icon: Shield, label: 'Faça o curso', desc: 'Módulo prático de QC, embalagem e despacho' },
                  { icon: Briefcase, label: 'Passe nos pilotos', desc: '1 a 3 jobs de baixo volume para qualificação' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex gap-3 p-4 rounded-xl bg-muted/40 border border-border/40">
                    <Icon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/cadastro">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white h-12 px-8 gap-2">
                  Quero estar nessa fila
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-primary">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Comece agora. Leva menos de 2 minutos.
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              Você só preenche o que faz sentido para você — quem quer só aprender, preenche menos. Quem quer renda, preenche mais.
            </p>
            <Link href="/cadastro">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-8 gap-2 font-semibold">
                Entrar na comunidade
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 font-display text-foreground font-semibold">
            <HykoHubLogo size={22} />
            Hyko<span className="text-primary">Hub</span>
          </span>
          <div className="flex gap-6">
            <Link href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="mailto:info@hykohub.com" className="hover:text-foreground transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
