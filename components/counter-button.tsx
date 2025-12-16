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
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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
      const result = await logSale()
      
      if (result.error) {
        toast.error(result.error)
      } else {
        // Success toast with sound effect feeling
        toast.success(`🎯 Contract #${result.newCount} logged!`, {
          description: 'Great work! Keep it up!',
        })
        
        // Bigger celebration for tier achievements
        if (result.tier && result.newCount === result.tier.contracts_required) {
          // Multiple confetti bursts
          const duration = 3 * 1000
          const animationEnd = Date.now() + duration
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

          function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min
          }

          const interval: any = setInterval(function() {
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
      
      setTimeout(() => setIsAnimating(false), 400)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`relative h-40 w-40 rounded-full font-bold shadow-2xl transition-all duration-300 ${
        isAnimating 
          ? 'scale-90 rotate-12' 
          : isPending 
          ? 'scale-95 animate-pulse' 
          : 'hover:scale-110 hover:rotate-3'
      } bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden`}
      style={{
        boxShadow: isAnimating 
          ? '0 10px 40px rgba(16, 185, 129, 0.8), 0 0 0 4px rgba(16, 185, 129, 0.3)'
          : '0 20px 60px rgba(16, 185, 129, 0.5), 0 0 0 0 rgba(16, 185, 129, 0.7)',
        animation: isPending ? 'none' : 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        transformOrigin: 'center',
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Glow effect */}
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
      
      {/* Icon */}
      <div className={`relative flex items-center justify-center h-full transition-transform duration-300 ${
        isAnimating ? 'scale-125 rotate-90' : ''
      }`}>
        <Plus className="h-16 w-16 text-white drop-shadow-lg" strokeWidth={3} />
      </div>
      
      <style jsx>{`
        @keyframes pulse-ring {
          0%, 100% {
            box-shadow: 0 20px 60px rgba(16, 185, 129, 0.5), 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          50% {
            box-shadow: 0 20px 60px rgba(16, 185, 129, 0.8), 0 0 0 15px rgba(16, 185, 129, 0);
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
  )
}
