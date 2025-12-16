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
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`relative h-32 w-32 rounded-full font-bold shadow-xl transition-all active:scale-95 ${
        isAnimating ? 'scale-95' : 'hover:scale-105'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{
        background: 'linear-gradient(135deg, #0445c8 0%, #0e6eec 100%)',
        boxShadow: '0 10px 30px rgba(4, 69, 200, 0.5)'
      }}
    >
      <div className="relative flex items-center justify-center h-full">
        <Plus className="h-12 w-12 text-white" strokeWidth={2.5} />
      </div>
    </button>
  )
}
