'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, Save, Plus } from 'lucide-react'
import { setMonthlyTarget, updateEmployee, getShops } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { getCurrentPeriod } from '@/lib/bonus-calculator'

type MonthlyTargetsManagerProps = {
  users: any[]
  theme: any
}

export function MonthlyTargetsManager({ users, theme }: MonthlyTargetsManagerProps) {
  const router = useRouter()
  const { year, month } = getCurrentPeriod()
  const [saving, setSaving] = useState(false)
  const [targets, setTargets] = useState<Record<string, { wireless: number; wireline: number; ytdPercentage?: number }>>({})

  const handleSaveTargets = async () => {
    setSaving(true)

    try {
      for (const user of users) {
        const userTargets = targets[user.id]
        if (userTargets) {
          await setMonthlyTarget({
            employeeId: user.id,
            year,
            month,
            wirelessTarget: userTargets.wireless || 0,
            wirelineTarget: userTargets.wireline || 0,
            shopManagerYtdPercentage: userTargets.ytdPercentage || 0,
          })
        }
      }

      toast.success('Targets saved successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to save targets')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkSet = () => {
    const wireless = prompt('Enter Wireless target for all employees:')
    const wireline = prompt('Enter Wireline target for all employees:')

    if (wireless && wireline) {
      const newTargets: Record<string, { wireless: number; wireline: number; ytdPercentage?: number }> = {}
      users.forEach(user => {
        if (user.role !== 'shop_manager') {
          newTargets[user.id] = {
            wireless: parseInt(wireless),
            wireline: parseInt(wireline),
            ytdPercentage: 0,
          }
        }
      })
      setTargets(newTargets)
    }
  }

  return (
    <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder} h-full`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`${theme.text.primary} flex items-center gap-2`}>
            <Target className="h-5 w-5" />
            Monthly Targets ({new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkSet}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Bulk Set
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTargets}
              disabled={saving || Object.keys(targets).length === 0}
              className="text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              Save All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {users.map((user) => (
            <div key={user.id} className={`p-3 rounded-lg ${theme.cardInactive} border ${theme.cardInactiveBorder}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className={`font-medium text-sm ${theme.text.primary}`}>{user.name}</div>
                  <div className={`text-xs ${theme.text.muted}`}>
                    {user.role === 'shop_manager' ? 'Shop Manager' : user.role === 'internal_sales' ? 'Internal Sales' : 'External Sales'}
                  </div>
                </div>
              </div>

              {user.role !== 'shop_manager' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`text-xs ${theme.text.muted} mb-1 block`}>Wireless Target</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={targets[user.id]?.wireless ?? ''}
                      onChange={(e) => {
                        setTargets(prev => ({
                          ...prev,
                          [user.id]: {
                            wireless: parseInt(e.target.value) || 0,
                            wireline: prev[user.id]?.wireline || 0,
                            ytdPercentage: prev[user.id]?.ytdPercentage || 0,
                          }
                        }))
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${theme.text.muted} mb-1 block`}>Wireline Target</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={targets[user.id]?.wireline ?? ''}
                      onChange={(e) => {
                        setTargets(prev => ({
                          ...prev,
                          [user.id]: {
                            wireless: prev[user.id]?.wireless || 0,
                            wireline: parseInt(e.target.value) || 0,
                            ytdPercentage: prev[user.id]?.ytdPercentage || 0,
                          }
                        }))
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className={`text-xs ${theme.text.muted} mb-1 block`}>YTD Achievement (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="200"
                    placeholder="100"
                    value={targets[user.id]?.ytdPercentage ?? ''}
                    onChange={(e) => {
                      setTargets(prev => ({
                        ...prev,
                        [user.id]: {
                          wireless: prev[user.id]?.wireless || 0,
                          wireline: prev[user.id]?.wireline || 0,
                          ytdPercentage: parseInt(e.target.value) || 0,
                        }
                      }))
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
