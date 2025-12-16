'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wifi, Smartphone } from 'lucide-react'

type StatsCardsProps = {
  stats: {
    total: number
    internet: number
    mobile: number
  }
  theme: any
}

export function StatsCards({ stats, theme }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder} h-full`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${theme.text.muted}`}>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-5xl font-bold ${theme.text.primary}`}>
              {stats.total}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder} h-full`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${theme.primary} flex items-center gap-2`}>
              <Wifi className="h-4 w-4" /> Internet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-5xl font-bold ${theme.primary}`}>{stats.internet}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder} h-full`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${theme.secondary} flex items-center gap-2`}>
              <Smartphone className="h-4 w-4" /> Mobile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-5xl font-bold ${theme.secondary}`}>{stats.mobile}</div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
