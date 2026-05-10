'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type PrinterModel = Database['public']['Tables']['printer_models']['Row']
type UserPrinterRow = Database['public']['Tables']['user_printers']['Row'] & { printer_models: PrinterModel | null; custom_model_name?: string | null }
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Printer, Save } from 'lucide-react'

const EXPERIENCIA_OPTIONS = [
  { value: 'iniciante', label: 'Iniciante (< 1 ano)' },
  { value: 'intermediario', label: 'Intermediário (1-3 anos)' },
  { value: 'avancado', label: 'Avançado (3+ anos)' },
]

const FILAMENTOS = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon', 'Resina', 'Outros']

const APRENDIZADO_OPTIONS = [
  { value: 'cursos_online', label: '🎓 Cursos online' },
  { value: 'mentoria_individual', label: '👤 Mentoria individual' },
  { value: 'mentoria_grupo', label: '👥 Mentoria em grupo' },
  { value: 'workshops', label: '🛠️ Workshops práticos' },
]

const PAISES = [
  { value: 'Brasil', label: '🇧🇷 Brasil' },
  { value: 'Portugal', label: '🇵🇹 Portugal' },
  { value: 'Estados Unidos', label: '🇺🇸 Estados Unidos' },
  { value: 'Canadá', label: '🇨🇦 Canadá' },
  { value: 'Reino Unido', label: '🇬🇧 Reino Unido' },
  { value: 'Alemanha', label: '🇩🇪 Alemanha' },
  { value: 'França', label: '🇫🇷 França' },
  { value: 'Espanha', label: '🇪🇸 Espanha' },
  { value: 'Itália', label: '🇮🇹 Itália' },
  { value: 'Holanda', label: '🇳🇱 Holanda' },
  { value: 'Suíça', label: '🇨🇭 Suíça' },
  { value: 'Austrália', label: '🇦🇺 Austrália' },
  { value: 'Nova Zelândia', label: '🇳🇿 Nova Zelândia' },
  { value: 'Japão', label: '🇯🇵 Japão' },
  { value: 'Argentina', label: '🇦🇷 Argentina' },
  { value: 'Chile', label: '🇨🇱 Chile' },
  { value: 'México', label: '🇲🇽 México' },
  { value: 'Outro', label: '🌍 Outro' },
]

const schema = z.object({
  nome: z.string().min(2, 'Informe seu nome'),
  pais: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  bio: z.string().max(280, 'Máximo 280 caracteres').optional(),
  nivel_experiencia: z.string().optional(),
  whatsapp: z.string().optional(),
  consumo_mensal_kg: z.coerce.number().min(0).optional(),
  horas_semana: z.coerce.number().min(0).optional(),
})
type FormData = z.infer<typeof schema>

export default function PerfilPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [filamentos, setFilamentos] = useState<string[]>([])
  const [aprendizado, setAprendizado] = useState<string[]>([])
  const [printers, setPrinters] = useState<any[]>([])
  const [allModels, setAllModels] = useState<any[]>([])
  const [addingPrinter, setAddingPrinter] = useState(false)
  const [selectedModel, setSelectedModel] = useState('')
  const [customModelName, setCustomModelName] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const bio = watch('bio') ?? ''

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: rawProfile }, { data: rawPrinters }, { data: rawModels }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_printers').select('*, printer_models(*)').eq('user_id', user.id),
        supabase.from('printer_models').select('*').order('marca'),
      ])
      const profile = rawProfile as Profile | null
      const userPrinters = rawPrinters as UserPrinterRow[] | null
      const models = rawModels as PrinterModel[] | null

      if (profile) {
        setValue('nome', profile.nome)
        setValue('pais', (profile as any).pais ?? '')
        setValue('cidade', profile.cidade ?? '')
        setValue('estado', profile.estado ?? '')
        setValue('bio', profile.bio ?? undefined)
        setValue('nivel_experiencia', profile.nivel_experiencia ?? '')
        setValue('whatsapp', profile.whatsapp ?? '')
        setValue('consumo_mensal_kg', profile.consumo_mensal_kg ?? undefined)
        setValue('horas_semana', profile.horas_semana ?? undefined)
        setFilamentos(profile.tipos_filamento ?? [])
        setAprendizado(profile.interesse_aprendizado ?? [])
      }

      setPrinters(userPrinters ?? [])
      setAllModels(models ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function onSubmit(data: FormData) {
    if (!userId) return
    setSaving(true)
    const update: any = {
      nome: data.nome,
      pais: data.pais || null,
      cidade: data.cidade || null,
      estado: data.estado || null,
      bio: data.bio || null,
      nivel_experiencia: data.nivel_experiencia || null,
      whatsapp: data.whatsapp || null,
      consumo_mensal_kg: data.consumo_mensal_kg || null,
      horas_semana: data.horas_semana || null,
      tipos_filamento: filamentos.length > 0 ? filamentos : null,
      interesse_aprendizado: aprendizado.length > 0 ? aprendizado : null,
    }
    const { error } = await supabase.from('profiles').update(update).eq('id', userId)

    setSaving(false)
    if (error) {
      toast.error('Erro ao salvar perfil')
    } else {
      toast.success('Perfil salvo!')
      router.push('/dashboard')
    }
  }

  const isOutra = allModels.find(m => m.id === selectedModel)?.slug === 'outra'

  async function addPrinter() {
    if (!selectedModel || !userId) return
    if (isOutra && !customModelName.trim()) {
      toast.error('Informe o nome da impressora')
      return
    }
    setAddingPrinter(true)
    const payload: Record<string, unknown> = { user_id: userId, printer_model_id: selectedModel }
    if (isOutra) payload.custom_model_name = customModelName.trim()

    const { data: rawData, error } = await supabase
      .from('user_printers')
      .insert(payload as never)
      .select('*, printer_models(*)')
      .single()
    const data = rawData as UserPrinterRow | null

    setAddingPrinter(false)
    if (error) {
      toast.error('Erro ao adicionar impressora')
    } else {
      const updated = [...printers, data]
      setPrinters(updated)
      setSelectedModel('')
      setCustomModelName('')
      toast.success('Impressora adicionada')
      await supabase.from('profiles').update({ tem_impressora: true } as never).eq('id', userId)
    }
  }

  async function removePrinter(id: string) {
    const { error } = await supabase.from('user_printers').delete().eq('id', id)
    if (!error) {
      const remaining = printers.filter(p => p.id !== id)
      setPrinters(remaining)
      toast.success('Impressora removida')
      if (remaining.length === 0) {
        await supabase.from('profiles').update({ tem_impressora: false } as never).eq('id', userId)
      }
    }
  }

  function toggleFilamento(f: string) {
    setFilamentos(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    )
  }

  function toggleAprendizado(v: string) {
    setAprendizado(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete seu perfil para desbloquear mais benefícios</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Básico */}
        <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Informações básicas</h2>
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" {...register('nome')} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>País</Label>
            <Select onValueChange={v => setValue('pais', v ?? '')} defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu país">
                  {(value: string | null) => {
                    if (!value) return null
                    return PAISES.find(p => p.value === value)?.label ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAISES.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" placeholder="São Paulo" {...register('cidade')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estado">Estado / Província</Label>
              <Input id="estado" placeholder="SP" {...register('estado')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio <span className="text-muted-foreground text-xs">({bio.length}/280)</span></Label>
            <Textarea id="bio" rows={3} placeholder="Conte um pouco sobre você e seu setup..." {...register('bio')} />
            {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nível de experiência</Label>
              <Select onValueChange={v => setValue('nivel_experiencia', v ?? '')} defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCIA_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
              <Input id="whatsapp" placeholder="+55 11 99999-9999" {...register('whatsapp')} />
            </div>
          </div>
        </section>

        {/* Impressoras */}
        <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Minhas impressoras</h2>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Cada impressora cadastrada ativa alertas de firmware e manutenção específicos para seu modelo.
          </p>

          {printers.length > 0 && (
            <div className="space-y-2">
              {printers.map(up => (
                <div key={up.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {up.printer_models?.slug === 'outra' && up.custom_model_name
                        ? up.custom_model_name
                        : `${up.printer_models?.marca} ${up.printer_models?.modelo}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {up.printer_models?.slug === 'outra' ? 'Modelo personalizado' : up.printer_models?.bed_size}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePrinter(up.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex gap-2">
              <Select value={selectedModel} onValueChange={v => { setSelectedModel(v ?? ''); setCustomModelName('') }}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione o modelo">
                    {(value: string | null) => {
                      if (!value) return null
                      const m = allModels.find(x => x.id === value)
                      return m ? (m.slug === 'outra' ? 'Outra (não listada)' : `${m.marca} ${m.modelo}`) : null
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allModels.filter(m => m.slug !== 'outra').map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.marca} {m.modelo}
                    </SelectItem>
                  ))}
                  {allModels.filter(m => m.slug === 'outra').map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      Outra (não listada)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={addPrinter}
                disabled={!selectedModel || addingPrinter || (isOutra && !customModelName.trim())}
                className="gap-1.5 shrink-0"
              >
                {addingPrinter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Adicionar
              </Button>
            </div>
            {isOutra && (
              <Input
                placeholder="Nome da impressora (ex: Anycubic Kobra 2 Neo)"
                value={customModelName}
                onChange={e => setCustomModelName(e.target.value)}
              />
            )}
          </div>
        </section>

        {/* Filamentos */}
        <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Filamentos que usa</h2>
          <p className="text-xs text-muted-foreground -mt-2">Usado para calibrar compras em grupo</p>
          <div className="flex flex-wrap gap-2">
            {FILAMENTOS.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFilamento(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filamentos.includes(f)
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-muted/40 text-muted-foreground border-border/40 hover:border-primary/20'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Aprendizado */}
        <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-foreground">Cursos e mentorias</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Quais formatos de aprendizado te interessam? (selecione todos que quiser)</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {APRENDIZADO_OPTIONS.map(opt => {
              const selected = aprendizado.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleAprendizado(opt.value)}
                  className={`relative flex flex-col gap-1.5 px-4 py-4 rounded-xl text-left border-2 transition-all duration-150 ${
                    selected
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-muted/40 border-border/40 text-muted-foreground hover:border-primary/40 hover:bg-muted/70'
                  }`}
                >
                  <span className="text-xl leading-none">{opt.label.split(' ')[0]}</span>
                  <span className={`text-sm font-medium leading-tight ${selected ? 'text-white' : 'text-foreground'}`}>
                    {opt.label.split(' ').slice(1).join(' ')}
                  </span>
                  {selected && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Operação */}
        <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Volume de operação</h2>
          <p className="text-xs text-muted-foreground -mt-2">Permite entrar nas compras do grupo com volume certo</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="consumo">Consumo mensal (kg)</Label>
              <Input id="consumo" type="number" step="0.1" min="0" placeholder="ex: 2.5" {...register('consumo_mensal_kg')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="horas">Horas/semana imprimindo</Label>
              <Input id="horas" type="number" min="0" placeholder="ex: 20" {...register('horas_semana')} />
            </div>
          </div>
        </section>

        <Button type="submit" className="w-full h-11 gap-2" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar perfil
        </Button>
      </form>
    </div>
  )
}
