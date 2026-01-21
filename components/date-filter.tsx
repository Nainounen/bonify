'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from 'react'
import { getCurrentPeriod } from '@/lib/bonus-calculator'

export function DateFilter({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = getCurrentPeriod()

  // Initialize from URL or current date
  const [year, setYear] = useState(searchParams.get('year') || current.year.toString())
  const [month, setMonth] = useState(searchParams.get('month') || current.month.toString())

  // Generate last 12 months for dropdown
  const months = []
  for (let i = 0; i < 12; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    })
  }

  // Handle change
  const handleChange = (value: string) => {
    const parts = value.split('-')
    if (parts.length !== 2) return

    const y = parts[0] || ''
    const m = parts[1] || ''

    if (!y || !m) return;

    setYear(y)
    setMonth(m)

    const params = new URLSearchParams(searchParams)
    params.set('year', y)
    params.set('month', m)
    router.push(`?${params.toString()}`)
    router.refresh()
  }

  return (
    <Select
      value={`${year}-${month}`}
      onValueChange={handleChange}
    >
      <SelectTrigger className={`w-50 ${className}`}>
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {months.map((m) => (
          <SelectItem key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
