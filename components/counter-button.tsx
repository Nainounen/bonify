'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Wifi, Smartphone } from 'lucide-react'
import { logSale } from '@/app/dashboard/actions'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { GlobalTheme, themes, getTheme } from '@/lib/themes'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'

export function CounterButton({
  category: controlledCategory,
  onCategoryChange,
  theme
}: {
  category?: 'Internet' | 'Mobile',
  onCategoryChange?: (category: 'Internet' | 'Mobile') => void,
  theme?: GlobalTheme
} = {}) {
  const [isPending, startTransition] = useTransition()
  const [isAnimating, setIsAnimating] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [internalCategory, setInternalCategory] = useState<'Internet' | 'Mobile'>('Internet')

  const category = controlledCategory ?? internalCategory
  const setCategory = onCategoryChange ?? setInternalCategory
  const safeTheme = theme || getTheme('default')
  const currentVariant = safeTheme.variants[category]

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Check rate limit
    if (!rateLimiter.check('sale', RATE_LIMITS.SALE)) {
      const resetTime = Math.ceil(rateLimiter.getResetTime('sale', RATE_LIMITS.SALE) / 1000)
      toast.error(`Please wait ${resetTime} seconds before logging another sale`)
      return
    }

    setIsAnimating(true)

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rippleId = Date.now()
    setRipples(prev => [...prev, { id: rippleId, x, y }])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId))
    }, 600)

    // Small confetti burst on every click
    confetti({
      particleCount: 20,
      spread: 40,
      origin: {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
      ticks: 100,
      gravity: 1.2,
      scalar: 0.8
    })

    startTransition(async () => {
      const result = await logSale(category)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${category} Contract #${result.newCount} logged! 🎉`, {
          description: 'Great work! Keep it up!',
        })

        // Celebrate tier achievements
        if (result.tier && result.newCount === result.tier.contracts_required) {
          // Multiple confetti bursts
          const duration = 3 * 1000
          const animationEnd = Date.now() + duration
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

          function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min
          }

          const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
              return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            })
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            })
          }, 250)

          toast.success(`🏆 ${result.tier.name} Tier Unlocked!`, {
            description: `Bonus: CHF ${result.tier.bonus_amount}`,
            duration: 6000,
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
            ? `${safeTheme.variants.Internet.accent} text-white shadow-lg`
            : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          style={category === 'Internet' ? { boxShadow: `0 10px 15px -3px rgba(${safeTheme.variants.Internet.glowColor}, 0.25)` } : undefined}
        >
          <Wifi className="h-4 w-4" />
          Internet
        </button>
        <button
          onClick={() => setCategory('Mobile')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${category === 'Mobile'
            ? `${safeTheme.variants.Mobile.accent} text-white shadow-lg`
            : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          style={category === 'Mobile' ? { boxShadow: `0 10px 15px -3px rgba(${safeTheme.variants.Mobile.glowColor}, 0.25)` } : undefined}
        >
          <Smartphone className="h-4 w-4" />
          Mobile
        </button>
      </div>

      <button
        onClick={handleClick}
        disabled={isPending}
        className={`relative h-48 w-48 rounded-full font-bold shadow-2xl transition-all active:scale-95 ${isAnimating ? 'scale-95' : 'hover:scale-105'
          } ${currentVariant.buttonGradient} disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden`}
        style={{
          boxShadow: `0 20px 60px rgba(${currentVariant.glowColor}, 0.4), 0 0 0 0 rgba(${currentVariant.glowColor}, 0.7)`,
          animation: isPending ? 'none' : 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      >
        <div className="absolute inset-0 rounded-full bg-white/20 blur-xl"></div>

        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/40 animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
            }}
          />
        ))}

        <div className="relative flex flex-col items-center justify-center h-full text-white">
          <Plus className={`h-16 w-16 mb-2 drop-shadow-lg transition-transform duration-500 ${isAnimating ? 'rotate-180' : ''}`} strokeWidth={3} />
          <span className="text-sm font-medium uppercase tracking-wider opacity-90">Add Sale</span>
          <span className="text-xs opacity-75 mt-1 font-medium">{category}</span>
        </div>
        <style jsx>{`
          @keyframes pulse-ring {
            0%, 100% {
              box-shadow: 0 20px 60px rgba(${currentVariant.glowColor}, 0.4), 0 0 0 0 rgba(${currentVariant.glowColor}, 0.7);
            }
            50% {
              box-shadow: 0 20px 60px rgba(${currentVariant.glowColor}, 0.6), 0 0 0 20px rgba(255, 255, 255, 0);
            }
          }

          @keyframes ripple {
            0% {
                width: 0;
                height: 0;
                opacity: 0.5;
            }
            100% {
                width: 300px;
                height: 300px;
                margin-left: -150px;
                margin-top: -150px;
                opacity: 0;
            }
            }
            
            .animate-ripple {
            animation: ripple 0.6s ease-out;
            }
        `}</style>
      </button>
    </div>
  )
}
