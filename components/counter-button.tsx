'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Wifi, Smartphone } from 'lucide-react'
import { logSale } from '@/app/dashboard/actions'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

export function CounterButton() {
  const [isPending, startTransition] = useTransition()
  const [isAnimating, setIsAnimating] = useState(false)
  const [category, setCategory] = useState<'Internet' | 'Mobile'>('Internet')

  const handleClick = () => {
    setIsAnimating(true)

    startTransition(async () => {
      const result = await logSale(category)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${category} Contract #${result.newCount} logged! 🎉`)

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
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center p-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
        <button
          onClick={() => setCategory('Internet')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${category === 'Internet'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
        >
          <Wifi className="h-4 w-4" />
          Internet
        </button>
        <button
          onClick={() => setCategory('Mobile')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${category === 'Mobile'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
              : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
        >
          <Smartphone className="h-4 w-4" />
          Mobile
        </button>
      </div>

      <button
        onClick={handleClick}
        disabled={isPending}
        className={`relative h-48 w-48 rounded-full font-bold shadow-2xl transition-all active:scale-95 ${isAnimating ? 'scale-95' : 'hover:scale-105'
          } ${category === 'Internet'
            ? 'bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-indigo-500/40'
            : 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 shadow-purple-500/40'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{
          boxShadow: category === 'Internet'
            ? '0 20px 60px rgba(99, 102, 241, 0.4), 0 0 0 0 rgba(99, 102, 241, 0.7)'
            : '0 20px 60px rgba(168, 85, 247, 0.4), 0 0 0 0 rgba(168, 85, 247, 0.7)',
          animation: isPending ? 'none' : 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      >
        <div className="absolute inset-0 rounded-full bg-white/20 blur-xl"></div>
        <div className="relative flex flex-col items-center justify-center h-full text-white">
          <Plus className={`h-16 w-16 mb-2 drop-shadow-lg transition-transform duration-500 ${isAnimating ? 'rotate-180' : ''}`} strokeWidth={3} />
          <span className="text-sm font-medium uppercase tracking-wider opacity-90">Add Sale</span>
          <span className="text-xs opacity-75 mt-1 font-medium">{category}</span>
        </div>
        <style jsx>{`
          @keyframes pulse-ring {
            0%, 100% {
              box-shadow: 0 20px 60px ${category === 'Internet' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(168, 85, 247, 0.4)'}, 0 0 0 0 ${category === 'Internet' ? 'rgba(99, 102, 241, 0.7)' : 'rgba(168, 85, 247, 0.7)'};
            }
            50% {
              box-shadow: 0 20px 60px ${category === 'Internet' ? 'rgba(99, 102, 241, 0.6)' : 'rgba(168, 85, 247, 0.6)'}, 0 0 0 20px rgba(255, 255, 255, 0);
            }
          }
        `}</style>
      </button>
    </div>
  )
}
