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

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const cadastroSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  cidade: z.string().min(2, 'Informe sua cidade'),
  estado: z.string().min(2, 'Selecione o estado'),
  tem_impressora: z.boolean(),
  lgpd_aceito: z.literal(true, { errorMap: () => ({ message: 'Você precisa aceitar os termos' }) }),
})

type LoginData = z.infer<typeof loginSchema>
type CadastroData = z.infer<typeof cadastroSchema>

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const cadastroForm = useForm<CadastroData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { tem_impressora: false, lgpd_aceito: undefined },
  })

  const temImpressora = cadastroForm.watch('tem_impressora')
  const lgpdAceito = cadastroForm.watch('lgpd_aceito')

  async function loginWithGoogle() {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    if (error) toast.error('Erro ao entrar com Google: ' + error.message)
  }

  async function onLogin(data: LoginData) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      toast.error('Email ou senha incorretos')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function onCadastro(data: CadastroData) {
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
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Comece em 2 minutos'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {mode === 'login' ? 'Entre na sua conta' : 'O que você preenche aqui já vira benefício para você'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">

          {/* Toggle */}
          <div className="flex rounded-xl bg-muted p-1 gap-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode('cadastro')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'cadastro'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-2"
            onClick={loginWithGoogle}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-card px-3">ou</span></div>
          </div>

          {/* Login form */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="voce@email.com" {...loginForm.register('email')} />
                {loginForm.formState.errors.email && <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password">Senha</Label>
                <Input id="login-password" type="password" placeholder="••••••••" {...loginForm.register('password')} />
                {loginForm.formState.errors.password && <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
              </Button>
            </form>
          )}

          {/* Cadastro form */}
          {mode === 'cadastro' && (
            <form onSubmit={cadastroForm.handleSubmit(onCadastro)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" placeholder="Como você quer ser chamado" {...cadastroForm.register('nome')} />
                {cadastroForm.formState.errors.nome && <p className="text-xs text-destructive">{cadastroForm.formState.errors.nome.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cad-email">Email</Label>
                <Input id="cad-email" type="email" placeholder="voce@email.com" {...cadastroForm.register('email')} />
                {cadastroForm.formState.errors.email && <p className="text-xs text-destructive">{cadastroForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cad-password">Senha</Label>
                <Input id="cad-password" type="password" placeholder="Mínimo 8 caracteres" {...cadastroForm.register('password')} />
                {cadastroForm.formState.errors.password && <p className="text-xs text-destructive">{cadastroForm.formState.errors.password.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" placeholder="Sua cidade" {...cadastroForm.register('cidade')} />
                  {cadastroForm.formState.errors.cidade && <p className="text-xs text-destructive">{cadastroForm.formState.errors.cidade.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <Select onValueChange={v => cadastroForm.setValue('estado', v ?? '')}>
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
                  {cadastroForm.formState.errors.estado && <p className="text-xs text-destructive">{cadastroForm.formState.errors.estado.message}</p>}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="tem_impressora"
                    checked={temImpressora}
                    onCheckedChange={v => cadastroForm.setValue('tem_impressora', v as boolean)}
                  />
                  <div>
                    <Label htmlFor="tem_impressora" className="font-medium cursor-pointer">Tenho impressora 3D</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Ativa seu feed personalizado por modelo</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="lgpd"
                  checked={!!lgpdAceito}
                  onCheckedChange={v => cadastroForm.setValue('lgpd_aceito', v as true)}
                />
                <Label htmlFor="lgpd" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                  Aceito a{' '}
                  <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                  {' '}e os{' '}
                  <Link href="/termos" className="text-primary hover:underline">Termos de Uso</Link>
                  {' '}(LGPD/CCPA)
                </Label>
              </div>
              {cadastroForm.formState.errors.lgpd_aceito && <p className="text-xs text-destructive -mt-2">{cadastroForm.formState.errors.lgpd_aceito.message}</p>}
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar conta'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
