'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Database, MemberTier } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { HykoHubLogo } from '@/components/ui/logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboard, ShoppingCart, Briefcase, Settings, LogOut, User as UserIcon, Menu, X, Box, Play, ShieldCheck, Tag, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Profile = Database['public']['Tables']['profiles']['Row']

const TIER_LABELS: Record<MemberTier, string> = {
  level0: 'Membro',
  level1: 'Membro+',
  level2: 'Pro Candidate',
  level3: 'Pro Qualified',
}

const TIER_COLORS: Record<MemberTier, string> = {
  level0: 'bg-muted text-muted-foreground',
  level1: 'bg-primary/10 text-primary',
  level2: 'bg-accent/10 text-accent',
  level3: 'bg-green-500/10 text-green-600',
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/modelos', label: 'Modelos', icon: Box },
  { href: '/videos', label: 'Vídeos', icon: Play },
  { href: '/ofertas', label: 'Ofertas', icon: Tag },
  { href: '/compras', label: 'Coletivas', icon: ShoppingCart },
  { href: '/vire-pro', label: 'Vire Pro', icon: Briefcase },
]

interface DashboardNavProps {
  user: User
  profile: Pick<Profile, 'nome' | 'avatar_url' | 'tier' | 'trust_score' | 'is_pro'> & { is_admin?: boolean | null } | null
}

export function DashboardNav({ user, profile }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const tier = profile?.tier ?? 'level0'
  const nome = profile?.nome ?? user.email?.split('@')[0] ?? 'Membro'
  const initials = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-foreground shrink-0">
          <HykoHubLogo size={30} />
          <span className="hidden sm:inline font-display">Hyko<span className="text-primary">Hub</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {profile?.is_admin && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/admin' || pathname.startsWith('/admin/')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Trust score */}
          {profile && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded-full">
              <span className="text-accent font-semibold">{profile.trust_score}</span>
              <span>pts</span>
            </div>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                  {initials}
                </div>
              </button>
            } />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="font-medium text-foreground truncate">{nome}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <Badge className={`mt-1.5 text-xs px-2 py-0.5 ${TIER_COLORS[tier as MemberTier]}`} variant="secondary">
                  {TIER_LABELS[tier as MemberTier]}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/perfil" />} className="flex items-center gap-2 cursor-pointer">
                <UserIcon className="w-4 h-4" />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/configuracoes" />} className="flex items-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                Configurações
              </DropdownMenuItem>
              {profile?.is_admin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/admin" />} className="flex items-center gap-2 cursor-pointer text-primary">
                    <ShieldCheck className="w-4 h-4" />
                    Painel Admin
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="w-4 h-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {profile?.is_admin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/admin'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
