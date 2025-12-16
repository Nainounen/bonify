'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { RefreshCw, Palette, Check, Download, LayoutDashboard, Trophy, LogOut } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@/app/login/actions'
import { themes } from '@/lib/themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AdminHeaderProps = {
  theme: any
  currentThemeId: string
  onThemeChange: (themeId: string) => void
  onExport: () => void
  onRefresh: () => void
}

export function AdminHeader({ theme, currentThemeId, onThemeChange, onExport, onRefresh }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`text-2xl sm:text-3xl md:text-4xl font-bold ${theme.text.primary}`}
      >
        Admin Command Center
      </motion.h1>
      <div className="flex gap-1.5 sm:gap-2">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className={`${theme.card} ${theme.cardBorder} ${theme.text.primary} hover:${theme.glass} h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}>
            <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </Link>
        <Link href="/list">
          <Button variant="outline" size="icon" className={`${theme.card} ${theme.cardBorder} ${theme.text.primary} hover:${theme.glass} h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}>
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button suppressHydrationWarning variant="outline" size="icon" className={`${theme.card} ${theme.cardBorder} ${theme.text.primary} hover:${theme.glass} h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}>
              <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-white">
            {Object.values(themes).map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${t.variants.Internet.accent.replace('bg-', 'from-').replace('text-', 'from-')} to-slate-900`} />
                  <span className={currentThemeId === t.id ? 'font-bold text-white' : 'text-white/70'}>
                    {t.name}
                  </span>
                  {currentThemeId === t.id && <Check className="h-3 w-3 ml-auto" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon" onClick={onExport} className={`${theme.card} ${theme.cardBorder} ${theme.text.primary} hover:${theme.glass} h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}>
          <Download className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={onRefresh} className={`${theme.card} ${theme.cardBorder} ${theme.text.primary} hover:${theme.glass} h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}>
          <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <form action={signOut} className="hidden sm:block">
          <Button variant="outline" className={`${theme.card} ${theme.cardBorder} ${theme.text.primary} hover:${theme.glass} hover:text-red-400 touch-manipulation`}>Sign Out</Button>
        </form>
        <form action={signOut} className="sm:hidden">
          <Button variant="outline" size="icon" className={`${theme.card} ${theme.cardBorder} ${theme.text.primary} hover:${theme.glass} hover:text-red-400 h-9 w-9 touch-manipulation`}>
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
