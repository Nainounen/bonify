'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { deleteAllSales } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type DangerZoneProps = {
  theme: any
}

export function DangerZone({ theme }: DangerZoneProps) {
  const [isDeletingSales, setIsDeletingSales] = useState(false)
  const router = useRouter()

  const handleDeleteAllSales = async () => {
    if (!confirm('Are you sure you want to DELETE ALL SALES? This cannot be undone.')) return

    setIsDeletingSales(true)
    const result = await deleteAllSales()
    setIsDeletingSales(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('All sales deleted successfully')
      router.refresh()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
      className="self-start"
    >
      <Card className={`${theme.card} backdrop-blur-xl border-red-500/30`}>
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription className={theme.text.muted}>
            Irreversible actions. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm ${theme.text.secondary}`}>
            Deleting all sales will reset the leaderboard and all user progress. This action cannot be undone.
          </div>
          <Button
            variant="destructive"
            onClick={handleDeleteAllSales}
            disabled={isDeletingSales}
            className="w-full"
          >
            {isDeletingSales ? 'Deleting...' : 'Delete All Sales Database'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
