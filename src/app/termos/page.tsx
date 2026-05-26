import Link from 'next/link'
import { HykoHubLogo } from '@/components/ui/logo'

export const metadata = { title: 'Termos de Uso — HykoHub' }

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-foreground">
          <HykoHubLogo size={28} />
          <span>Hyko<span className="text-primary">Hub</span></span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-10">Última atualização: maio de 2026</p>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Aceitação dos termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao criar uma conta no HykoHub, você concorda com estes Termos de Uso e com nossa <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>. Se não concordar, não utilize a plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. O que é o HykoHub</h2>
            <p className="text-muted-foreground leading-relaxed">
              O HykoHub é uma plataforma comunitária para makers de impressão 3D que oferece feed personalizado de conteúdo, compras do grupo, ofertas de parceiros, catálogo de modelos STL e um programa profissional (Pool Comercial) para impressores qualificados gerarem renda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Conta e elegibilidade</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>Você deve ter ao menos 18 anos para criar uma conta.</li>
              <li>As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.</li>
              <li>Você é responsável pela segurança da sua senha e por todas as atividades realizadas na sua conta.</li>
              <li>É proibido criar múltiplas contas ou compartilhar credenciais de acesso.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Regras de conduta</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>Não publique conteúdo ofensivo, discriminatório, falso ou que viole direitos de terceiros.</li>
              <li>Não utilize a plataforma para spam, phishing ou qualquer atividade ilícita.</li>
              <li>Respeite os demais membros da comunidade.</li>
              <li>Não tente acessar áreas restritas ou dados de outros usuários.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Compras do grupo e ofertas</h2>
            <p className="text-muted-foreground leading-relaxed">
              As compras do grupo e ofertas de parceiros são facilitadas pelo HykoHub, mas a relação comercial é entre você e o fornecedor. O HykoHub não se responsabiliza por atrasos, defeitos ou problemas na entrega de produtos. Recomendamos verificar as condições de cada oferta antes de participar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Pool Comercial (Programa Pro)</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>A participação no Pool Comercial é por convite, mediante qualificação técnica e acordo formal.</li>
              <li>Os membros Pro devem manter padrão de qualidade e cumprir os prazos acordados com as lojas parceiras.</li>
              <li>O HykoHub pode remover membros do programa em caso de violações recorrentes.</li>
              <li>Remunerações são definidas por contrato específico entre o membro Pro e as lojas parceiras.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Propriedade intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              O conteúdo criado pelos usuários (fotos, vídeos, descrições) permanece de propriedade do autor. Ao publicar na plataforma, você concede ao HykoHub licença não exclusiva para exibir e distribuir o conteúdo dentro da plataforma. Os modelos STL disponíveis seguem as licenças indicadas em cada item (ex.: CC-BY-NC).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Suspensão e encerramento</h2>
            <p className="text-muted-foreground leading-relaxed">
              O HykoHub pode suspender ou encerrar contas que violem estes termos, sem aviso prévio em casos graves. Você pode encerrar sua conta a qualquer momento nas configurações da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Limitação de responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O HykoHub é fornecido "como está". Não garantimos disponibilidade ininterrupta ou ausência de erros. Em nenhum caso o HykoHub será responsável por danos indiretos, incidentais ou consequentes decorrentes do uso da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Lei aplicável</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes termos são regidos pelas leis brasileiras para usuários do Brasil. Disputas serão resolvidas no foro da comarca de São Paulo, SP. Para usuários internacionais, aplicam-se as leis do país de residência conforme exigido pela legislação local.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dúvidas sobre estes termos: <span className="text-primary">contato@hykohub.com</span>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border flex gap-4 text-sm">
          <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">Voltar ao login</Link>
        </div>
      </main>
    </div>
  )
}
