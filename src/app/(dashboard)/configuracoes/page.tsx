'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, KeyRound, ShieldCheck, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email)
      setLoading(false)
    })
  }, [])

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) {
      toast.error('Senhas não coincidem')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Mínimo 8 caracteres')
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Senha alterada com sucesso')
      setNewPassword('')
      setConfirmPassword('')
    }
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
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie sua conta e privacidade</p>
      </div>

      {/* Account */}
      <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-foreground">Conta</h2>
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={email} disabled className="bg-muted/40 text-muted-foreground" />
        </div>
        <div className="border-t border-border/40 pt-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Alterar senha</p>
          <div className="space-y-1.5">
            <Label htmlFor="nova-senha">Nova senha</Label>
            <Input
              id="nova-senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirma-senha">Confirmar nova senha</Label>
            <Input
              id="confirma-senha"
              type="password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={handlePasswordChange}
            disabled={saving || !newPassword || !confirmPassword}
            size="sm"
            variant="outline"
            className="gap-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Salvar nova senha
          </Button>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-foreground">Privacidade (LGPD/CCPA)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Seus dados são usados exclusivamente para personalizar seu feed, calcular compras em grupo e, se você optar, viabilizar o Pool Pro.
          Nunca vendemos dados para terceiros.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/privacidade" className="text-sm text-primary hover:underline">
            Política de Privacidade
          </Link>
          <Link href="/termos" className="text-sm text-primary hover:underline">
            Termos de Uso
          </Link>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-destructive" />
          <h2 className="font-semibold text-destructive">Zona de risco</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Para excluir sua conta e todos os seus dados, entre em contato via{' '}
          <a href="mailto:info@hykohub.com" className="text-primary hover:underline">info@hykohub.com</a>.
          Processamos solicitações em até 30 dias conforme LGPD/CCPA.
        </p>
      </section>
    </div>
  )
}
