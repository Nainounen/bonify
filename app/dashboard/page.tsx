import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmployeeStats } from './actions'
import { signOut } from '../login/actions'
import { CounterButton } from '@/components/counter-button'
import { TierBadge } from '@/components/tier-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { LogOut, TrendingUp, DollarSign, Target } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const stats = await getEmployeeStats()

  if (stats.error || !stats.employee) {
    return <div>Error loading stats</div>
  }

  const progressToNext = stats.nextTier
    ? ((stats.totalSales - (stats.currentTier?.contracts_required || 0)) /
        (stats.nextTier.contracts_required - (stats.currentTier?.contracts_required || 0))) *
      100
    : 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto max-w-6xl p-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome, {stats.employee.name}! 👋</h1>
            <p className="text-slate-400">Track your sales and earn bonuses</p>
          </div>
          <form action={signOut}>
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>

        {/* Main Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                Keep selling to unlock bonuses!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                {stats.currentTier ? (
                  <TierBadge
                    name={stats.currentTier.name}
                    color={stats.currentTier.color}
                    icon={stats.currentTier.icon}
                    size="lg"
                  />
                ) : (
                  <span className="text-muted-foreground">No tier yet</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bonuses Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">CHF {stats.totalBonus.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Amazing work! 🎉
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Counter Section */}
        <Card className="mb-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="mb-2 text-xl font-semibold">Log a New Contract</h2>
            <p className="mb-8 text-center text-sm text-muted-foreground">
              Press the button below when you close a sale
            </p>
            <CounterButton />
          </CardContent>
        </Card>

        {/* Progress to Next Tier */}
        {stats.nextTier && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Progress to {stats.nextTier.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {stats.totalSales} / {stats.nextTier.contracts_required} contracts
                  </span>
                  <span className="font-semibold">
                    {stats.nextTier.contracts_required - stats.totalSales} remaining
                  </span>
                </div>
                <Progress value={progressToNext} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <TierBadge
                    name={stats.currentTier?.name || 'Starter'}
                    color={stats.currentTier?.color || '#94a3b8'}
                    icon={stats.currentTier?.icon || 'Star'}
                    size="sm"
                  />
                  <span className="text-muted-foreground">→</span>
                  <TierBadge
                    name={stats.nextTier.name}
                    color={stats.nextTier.color}
                    icon={stats.nextTier.icon}
                    size="sm"
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Next bonus: <span className="font-semibold">CHF {stats.nextTier.bonus_amount}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Tiers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bonus Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.tiers.map((tier, index) => {
                const isUnlocked = stats.totalSales >= tier.contracts_required
                return (
                  <div key={tier.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TierBadge
                          name={tier.name}
                          color={tier.color}
                          icon={tier.icon}
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {tier.contracts_required} contracts
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Bonus: CHF {tier.bonus_amount}
                          </p>
                        </div>
                      </div>
                      <div>
                        {isUnlocked ? (
                          <span className="text-sm font-semibold text-green-600">✓ Unlocked</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Locked</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
