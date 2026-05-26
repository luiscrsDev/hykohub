import Link from 'next/link'
import { HykoHubLogo } from '@/components/ui/logo'

export const metadata = { title: 'Política de Privacidade — HykoHub' }

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-foreground">
          <HykoHubLogo size={28} />
          <span>Hyko<span className="text-primary">Hub</span></span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-10">Última atualização: maio de 2026</p>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Quem somos</h2>
            <p className="text-muted-foreground leading-relaxed">
              O HykoHub é uma plataforma comunitária para makers de impressão 3D. Operamos sob as leis de proteção de dados aplicáveis, incluindo a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) para usuários brasileiros e o California Consumer Privacy Act (CCPA) para usuários norte-americanos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Dados que coletamos</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li><strong className="text-foreground">Dados de cadastro:</strong> nome, email, cidade, estado, país e se você possui impressora 3D.</li>
              <li><strong className="text-foreground">Dados de perfil:</strong> bio, experiência, modelos de impressoras, consumo de filamento, fotos e vídeos (opcionais).</li>
              <li><strong className="text-foreground">Dados de uso:</strong> páginas visitadas, interações com conteúdo e preferências de feed.</li>
              <li><strong className="text-foreground">Dados de autenticação:</strong> gerenciados pelo Supabase Auth (Google OAuth ou email/senha).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>Personalizar seu feed com alertas, modelos e vídeos relevantes ao seu equipamento.</li>
              <li>Filtrar compras do grupo e ofertas de parceiros pelo seu país.</li>
              <li>Avaliar elegibilidade para o Programa Pro (Pool Comercial).</li>
              <li>Enviar comunicações relacionadas à plataforma (confirmação de email, atualizações importantes).</li>
              <li>Melhorar a experiência da plataforma com dados agregados e anônimos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Compartilhamento de dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Não vendemos seus dados. Compartilhamos apenas com provedores de infraestrutura essenciais (Supabase para banco de dados e autenticação, Vercel para hospedagem) sob acordos de processamento de dados. Dados do Pool Comercial (Pro) podem ser compartilhados com lojas parceiras para fins operacionais, com seu consentimento explícito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Seus direitos (LGPD / CCPA)</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>Acessar os dados que temos sobre você.</li>
              <li>Corrigir dados incorretos ou desatualizados.</li>
              <li>Solicitar a exclusão da sua conta e dados associados.</li>
              <li>Portabilidade dos seus dados em formato legível.</li>
              <li>Revogar consentimentos previamente concedidos.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Para exercer seus direitos, acesse as configurações da conta ou entre em contato pelo email <span className="text-primary">privacidade@hykohub.com</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Retenção de dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta, os dados são removidos em até 30 dias, exceto onde exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos criptografia em trânsito (HTTPS) e em repouso. O acesso ao banco de dados é protegido por Row Level Security (RLS) do Supabase, garantindo que cada usuário acesse apenas seus próprios dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Alterações nesta política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Notificaremos por email sobre mudanças materiais nesta política com antecedência mínima de 15 dias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dúvidas sobre privacidade: <span className="text-primary">privacidade@hykohub.com</span>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border flex gap-4 text-sm">
          <Link href="/termos" className="text-primary hover:underline">Termos de Uso</Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">Voltar ao login</Link>
        </div>
      </main>
    </div>
  )
}
