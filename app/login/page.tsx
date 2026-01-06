'use client'

import { useState, useEffect } from 'react'
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/logo'
import { themes, type GlobalTheme } from '@/lib/themes'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState('default')

  useEffect(() => {
    const savedTheme = localStorage.getItem('bonify-theme') || 'default'
    setTheme(savedTheme)
  }, [])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const currentTheme = (themes[theme as keyof typeof themes] || themes.default) as GlobalTheme
  const background = currentTheme.variants.Internet.background

  return (
    <div className={`flex min-h-screen items-center justify-center ${background} p-3 sm:p-4 md:p-6 safe-top safe-bottom`}>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2 sm:space-y-3 text-center pb-4 sm:pb-6">
          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center">
            <Logo className="h-14 w-14 sm:h-16 sm:w-16 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl">Bonify</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sign in to track your bonus progress
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form action={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold touch-manipulation" disabled={loading}>
              {loading ? 'Loading...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
