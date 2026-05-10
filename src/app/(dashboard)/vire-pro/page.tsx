'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, Zap, Shield, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react'

const BED_SIZES = ['150x150', '220x220', '235x235', '256x256', '300x300', '350x350', '400x400+']
const POS_PROCESSAMENTO = ['Lixamento', 'Pintura', 'Acetona', 'UV Resin', 'Inserção de metal', 'Não faço']
const PERFIL_OPTIONS = [
  { value: 'hobby', label: 'Hobby — Imprimo por prazer, sem fins comerciais' },
  { value: 'varejo_eventual', label: 'Varejo eventual — Vendo peças ocasionalmente' },
  { value: 'atacado', label: 'Atacado — Tenho operação dedicada a produção' },
]

export default function VireProPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [bedSize, setBedSize] = useState('')
  const [pos, setPos] = useState<string[]>([])
  const [perfilOp, setPerfilOp] = useState('')
  const [interesse, setInteresse] = useState('')
  const [cnpjCpf, setCnpjCpf] = useState('')
  const [enderecoCompleto, setEnderecoCompleto] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: rawP } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const p = rawP as Profile | null
      if (p) {
        setProfile(p)
        setBedSize(p.bed_size_max ?? '')
        setPos(p.faz_pos_processamento ?? [])
        setPerfilOp(p.perfil_operacao ?? '')
        setInteresse(p.interesse_pool ?? '')
        setCnpjCpf(p.cnpj_cpf ?? '')
        setEnderecoCompleto(p.endereco_completo ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  function togglePos(item: string) {
    setPos(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    const update: Database['public']['Tables']['profiles']['Update'] = {
      bed_size_max: bedSize || null,
      faz_pos_processamento: pos.length > 0 ? pos : null,
      perfil_operacao: (perfilOp as any) || null,
      interesse_pool: (interesse as any) || null,
      cnpj_cpf: cnpjCpf || null,
      endereco_completo: enderecoCompleto || null,
    }
    const { error } = await supabase.from('profiles').update(update as never).eq('id', userId)

    setSaving(false)
    if (error) {
      toast.error('Erro ao salvar')
    } else {
      toast.success('Informações salvas — você está na fila prioritária!')
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isProQualified = profile?.is_pro
  const hasInterest = profile?.interesse_pool === 'sim'

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Badge className="mb-3 bg-accent/10 text-accent border-accent/20">Pool Comercial Pro</Badge>
        <h1 className="text-2xl font-bold text-foreground">Transforme sua impressora em renda</h1>
        <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
          Estamos em conversas avançadas com parceiros para um piloto de produção sob demanda.
          Quando o piloto começar, chamamos primeiro quem estiver na fila qualificada.
        </p>
      </div>

      {isProQualified ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h2 className="font-bold text-foreground text-lg">Você é Pro Qualified!</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Você está na fila prioritária. Vamos te contatar quando os primeiros jobs estiverem disponíveis.
          </p>
        </div>
      ) : (
        <>
          {/* Steps */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: Zap, step: '1', label: 'Marque interesse', desc: 'Preencha suas capacidades abaixo', done: hasInterest },
              { icon: Shield, step: '2', label: 'Faça o curso', desc: 'Módulo de QC, embalagem e despacho', done: false },
              { icon: Briefcase, step: '3', label: 'Passe nos pilotos', desc: '1-3 jobs de baixo volume', done: false },
            ].map(({ icon: Icon, step, label, desc, done }) => (
              <div key={step} className={`p-4 rounded-xl border ${done ? 'bg-accent/5 border-accent/30' : 'bg-muted/40 border-border/40'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-accent" />
                    : <Icon className="w-4 h-4 text-muted-foreground" />
                  }
                  <span className={`text-xs font-semibold ${done ? 'text-accent' : 'text-muted-foreground'}`}>Passo {step}</span>
                </div>
                <p className="font-medium text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Interesse */}
            <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Qual seu nível de interesse?</h2>
              <div className="space-y-2">
                {[
                  { value: 'sim', label: 'Sim, quero entrar na fila Pro', desc: 'Vou preencher todos os campos de capacidade' },
                  { value: 'talvez', label: 'Talvez, quero entender melhor', desc: 'Me notifique quando houver mais detalhes' },
                  { value: 'nao', label: 'Não por enquanto', desc: 'Só quero usar a comunidade por ora' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setInteresse(opt.value)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      interesse === opt.value
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-muted/40 border-border/40 hover:border-primary/20'
                    }`}
                  >
                    <p className={`font-medium text-sm ${interesse === opt.value ? 'text-primary' : 'text-foreground'}`}>{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Capacidade técnica */}
            {(interesse === 'sim') && (
              <>
                <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">Capacidade técnica</h2>
                  <div className="space-y-1.5">
                    <Label>Maior bed size disponível</Label>
                    <Select value={bedSize} onValueChange={v => setBedSize(v ?? '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o bed size" />
                      </SelectTrigger>
                      <SelectContent>
                        {BED_SIZES.map(s => <SelectItem key={s} value={s}>{s} mm</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pós-processamento que faz</Label>
                    <div className="flex flex-wrap gap-2">
                      {POS_PROCESSAMENTO.map(item => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => togglePos(item)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            pos.includes(item)
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-muted/40 text-muted-foreground border-border/40 hover:border-primary/20'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Perfil de operação</Label>
                    <div className="space-y-2">
                      {PERFIL_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPerfilOp(opt.value)}
                          className={`w-full text-left p-3 rounded-xl border transition-colors text-sm ${
                            perfilOp === opt.value
                              ? 'bg-primary/10 border-primary/30 text-primary'
                              : 'bg-muted/40 border-border/40 text-foreground hover:border-primary/20'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Dados legais */}
                <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">Dados para faturamento</h2>
                  <p className="text-xs text-muted-foreground -mt-2">Opcional agora — obrigatório na hora do primeiro job</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="cnpj">CPF ou CNPJ</Label>
                    <Input
                      id="cnpj"
                      placeholder="000.000.000-00 ou 00.000.000/0001-00"
                      value={cnpjCpf}
                      onChange={e => setCnpjCpf(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="endereco">Endereço completo para despacho</Label>
                    <Input
                      id="endereco"
                      placeholder="Rua, número, bairro, cidade, CEP"
                      value={enderecoCompleto}
                      onChange={e => setEnderecoCompleto(e.target.value)}
                    />
                  </div>
                </section>
              </>
            )}

            <Button
              onClick={handleSave}
              disabled={saving || !interesse}
              className="w-full h-11 gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {interesse === 'sim' ? 'Entrar na fila Pro' : 'Salvar preferência'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
