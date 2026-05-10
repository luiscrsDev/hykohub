'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { HykoHubLogo } from '@/components/ui/logo'

const ESTADOS_US = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']
const ESTADOS_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const schema = z.object({
  nome: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  cidade: z.string().min(2, 'Informe sua cidade'),
  estado: z.string().min(2, 'Selecione o estado'),
  tem_impressora: z.boolean(),
  lgpd_aceito: z.literal(true, { errorMap: () => ({ message: 'Você precisa aceitar os termos' }) }),
})
type FormData = z.infer<typeof schema>

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tem_impressora: false, lgpd_aceito: undefined },
  })

  const temImpressora = watch('tem_impressora')
  const lgpdAceito = watch('lgpd_aceito')

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nome: data.nome,
          cidade: data.cidade,
          estado: data.estado,
          tem_impressora: data.tem_impressora,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo à comunidade!</h2>
          <p className="text-muted-foreground">Redirecionando para o dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-6 text-foreground">
            <HykoHubLogo size={36} />
            <span className="font-display">Hyko<span className="text-primary">Hub</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Comece em 2 minutos</h1>
          <p className="text-muted-foreground mt-1 text-sm">O que você preenche aqui já vira benefício para você</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" placeholder="Como você quer ser chamado" {...register('nome')} />
              {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="voce@email.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Mínimo 8 caracteres" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" placeholder="Sua cidade" {...register('cidade')} />
                {errors.cidade && <p className="text-xs text-destructive">{errors.cidade.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select onValueChange={v => setValue('estado', v ?? '')} >
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Estados Unidos</div>
                    {ESTADOS_US.map(e => <SelectItem key={e} value={`US-${e}`}>{e}</SelectItem>)}
                    <div className="px-2 py-1 text-xs text-muted-foreground font-medium mt-1">Brasil</div>
                    {ESTADOS_BR.map(e => <SelectItem key={e} value={`BR-${e}`}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.estado && <p className="text-xs text-destructive">{errors.estado.message}</p>}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="tem_impressora"
                  checked={temImpressora}
                  onCheckedChange={v => setValue('tem_impressora', v as boolean)}
                />
                <div>
                  <Label htmlFor="tem_impressora" className="font-medium cursor-pointer">
                    Tenho impressora 3D
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ativa seu feed personalizado por modelo
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="lgpd"
                checked={!!lgpdAceito}
                onCheckedChange={v => setValue('lgpd_aceito', v as true)}
              />
              <Label htmlFor="lgpd" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                Aceito a{' '}
                <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                {' '}e os{' '}
                <Link href="/termos" className="text-primary hover:underline">Termos de Uso</Link>
                {' '}(LGPD/CCPA)
              </Label>
            </div>
            {errors.lgpd_aceito && <p className="text-xs text-destructive -mt-3">{errors.lgpd_aceito.message}</p>}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar na comunidade'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
