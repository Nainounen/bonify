'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { getTheme } from '@/lib/themes'

// Read theme synchronously from localStorage to avoid flash
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'default'
  return localStorage.getItem('bonify-theme') || 'default'
}

export function DashboardSkeleton() {
  const [themeId] = useState(getInitialTheme)
  const theme = getTheme(themeId).variants.Internet

  return (
    <div className={`min-h-screen transition-colors duration-700 ${theme.background}`}>
      {/* Header Bar */}
      <div className={`sticky top-0 z-50 border-b ${theme.navBar} ${theme.navBarBorder}`}>
        <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div>
            <Skeleton className={`h-5 w-32 mb-1 ${theme.card}`} />
            <Skeleton className={`h-4 w-24 ${theme.card}`} />
          </div>
          <Skeleton className={`h-9 w-9 rounded ${theme.card}`} />
        </div>
      </div>

      <div className="w-full pb-20">
        <div className="container mx-auto max-w-7xl px-4 lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Main Content */}
        <div className="mx-auto max-w-2xl lg:max-w-none lg:col-span-8 xl:col-span-9">
        {/* Hero Stats Section */}
        <div className="py-8 text-center">
          <Skeleton className={`h-8 w-48 mx-auto mb-6 ${theme.card}`} />
          <Skeleton className={`h-16 w-32 mx-auto mb-2 ${theme.card}`} />
          <Skeleton className={`h-4 w-24 mx-auto mb-8 ${theme.card}`} />

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <Skeleton className={`h-8 w-24 mx-auto mb-1 ${theme.card}`} />
              <Skeleton className={`h-3 w-16 mx-auto ${theme.card}`} />
            </div>
            <div className={`h-12 w-px ${theme.divider}`}></div>
            <div className="text-center">
              <Skeleton className={`h-8 w-24 mx-auto mb-1 ${theme.card}`} />
              <Skeleton className={`h-3 w-16 mx-auto ${theme.card}`} />
            </div>
          </div>
        </div>

        {/* Counter Button */}
        <div className="flex flex-col items-center justify-center mb-12">
          <Skeleton className={`h-4 w-32 mb-6 ${theme.card}`} />
          <Skeleton className={`h-32 w-32 rounded-full ${theme.card}`} />
        </div>

        {/* Progress Card */}
        <Skeleton className={`h-48 w-full rounded-3xl ${theme.card} mb-12`} />

        {/* Tiers List */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className={`h-24 w-full rounded-2xl ${theme.card}`} />
          ))}
        </div>
        </div>
        {/* End Main Content */}

        {/* Desktop-only Side Panel Skeleton */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 space-y-4">
            <Skeleton className={`h-48 w-full rounded-3xl ${theme.card}`} />
            <Skeleton className={`h-96 w-full rounded-3xl ${theme.card}`} />
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export function AdminSkeleton() {
  const [themeId] = useState(getInitialTheme)
  const theme = getTheme(themeId).variants.Internet

  return (
    <div className={`min-h-screen p-8 transition-colors duration-700 ${theme.background} ${theme.text.primary}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className={`h-10 w-64 ${theme.card}`} />
          <div className="flex gap-2">
            <Skeleton className={`h-9 w-9 rounded ${theme.card}`} />
            <Skeleton className={`h-9 w-24 rounded ${theme.card}`} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className={`h-32 w-full rounded-xl ${theme.card}`} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className={`h-96 w-full rounded-xl ${theme.card}`} />
          <Skeleton className={`h-96 w-full rounded-xl ${theme.card}`} />
        </div>
      </div>
    </div>
  )
}

export function LeaderboardSkeleton() {
  const [themeId] = useState(getInitialTheme)
  const theme = getTheme(themeId).variants.Internet

  return (
    <div className={`min-h-screen transition-colors duration-700 ${theme.background}`}>
      <div className={`sticky top-0 z-50 border-b ${theme.navBar} ${theme.navBarBorder}`}>
        <div className="container mx-auto max-w-2xl px-4 py-3">
          <Skeleton className={`h-5 w-32 ${theme.card}`} />
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center mb-8">
          <Skeleton className={`h-16 w-16 rounded-full mx-auto mb-4 ${theme.card}`} />
          <Skeleton className={`h-8 w-48 mx-auto mb-2 ${theme.card}`} />
          <Skeleton className={`h-4 w-64 mx-auto ${theme.card}`} />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className={`h-24 w-full rounded-2xl ${theme.card}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
