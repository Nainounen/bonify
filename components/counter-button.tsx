'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { logSale } from '@/app/dashboard/actions'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

export function CounterButton() {
  const [isPending, startTransition] = useTransition()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    setIsAnimating(true)
    
    startTransition(async () => {
      const result = await logSale()
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Contract #${result.newCount} logged! 🎉`)
        
        // Celebrate tier achievements
        if (result.tier && result.newCount === result.tier.contracts_required) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
          toast.success(`🏆 ${result.tier.name} tier unlocked!`, {
            duration: 5000,
          })
        }
      }
      
      setTimeout(() => setIsAnimating(false), 300)
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      size="lg"
      className={`h-32 w-32 rounded-full text-xl font-bold shadow-2xl transition-all hover:scale-105 ${
        isAnimating ? 'scale-95' : ''
      } bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700`}
    >
      <Plus className="h-12 w-12" />
    </Button>
  )
}
