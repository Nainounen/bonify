'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, LayoutDashboard, Trophy, LogOut } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@/app/login/actions'
import { DateFilter } from '@/components/date-filter'

type AdminHeaderProps = {
  theme: any
  onExport: () => void
  onRefresh: () => void
}

export function AdminHeader({ theme, onExport, onRefresh }: AdminHeaderProps) {
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
        <DateFilter />
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
