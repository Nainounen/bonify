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
      className={`relative h-40 w-40 rounded-full font-bold shadow-2xl transition-all active:scale-95 ${
        isAnimating ? 'scale-95' : 'hover:scale-105'
      } bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{
        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4), 0 0 0 0 rgba(16, 185, 129, 0.7)',
        animation: isPending ? 'none' : 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    >
      <div className="absolute inset-0 rounded-full bg-white/20 blur-xl"></div>
      <div className="relative flex items-center justify-center h-full">
        <Plus className="h-16 w-16 text-white drop-shadow-lg" strokeWidth={3} />
      </div>
      <style jsx>{`
        @keyframes pulse-ring {
          0%, 100% {
            box-shadow: 0 20px 60px rgba(16, 185, 129, 0.4), 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          50% {
            box-shadow: 0 20px 60px rgba(16, 185, 129, 0.6), 0 0 0 10px rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </button>
  )
}
