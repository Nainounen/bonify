import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="container mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-32 mb-1 bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/10" />
          </div>
          <Skeleton className="h-9 w-9 rounded bg-white/10" />
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 pb-20">
        {/* Hero Stats Section */}
        <div className="py-8 text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-6 bg-white/10" />
          <Skeleton className="h-16 w-32 mx-auto mb-2 bg-white/10" />
          <Skeleton className="h-4 w-24 mx-auto mb-8 bg-white/10" />

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <Skeleton className="h-8 w-24 mx-auto mb-1 bg-white/10" />
              <Skeleton className="h-3 w-16 mx-auto bg-white/10" />
            </div>
            <div className="h-12 w-px bg-white/20"></div>
            <div className="text-center">
              <Skeleton className="h-8 w-24 mx-auto mb-1 bg-white/10" />
              <Skeleton className="h-3 w-16 mx-auto bg-white/10" />
            </div>
          </div>
        </div>

        {/* Counter Button */}
        <div className="flex flex-col items-center justify-center mb-12">
          <Skeleton className="h-4 w-32 mb-6 bg-white/10" />
          <Skeleton className="h-32 w-32 rounded-full bg-white/10" />
        </div>

        {/* Progress Card */}
        <Skeleton className="h-48 w-full rounded-3xl bg-white/10 mb-12" />

        {/* Tiers List */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 bg-white/10" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded bg-white/10" />
            <Skeleton className="h-9 w-24 rounded bg-white/10" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl bg-white/10" />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full rounded-xl bg-white/10" />
          <Skeleton className="h-96 w-full rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  )
}

export function LeaderboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="container mx-auto max-w-2xl px-4 py-3">
          <Skeleton className="h-5 w-32 bg-white/10" />
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center mb-8">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4 bg-white/10" />
          <Skeleton className="h-8 w-48 mx-auto mb-2 bg-white/10" />
          <Skeleton className="h-4 w-64 mx-auto bg-white/10" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  )
}
