import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLeaderboard } from './actions'
import { ListView } from '@/components/list-view'

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { year, month, filter, shopId } = await searchParams
  const y = year ? parseInt(year as string) : undefined
  const m = month ? parseInt(month as string) : undefined

  // Validate filter type
  const validFilters = ['my_shop', 'region', 'specific_shop']
  const filterType = (validFilters.includes(filter as string) ? filter : 'my_shop') as 'my_shop' | 'region' | 'specific_shop'

  const result = await getLeaderboard(y, m, filterType, shopId as string)

  if ('error' in result || !result.leaderboard) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">Error loading leaderboard</div>
  }

  const { leaderboard, userContext } = result

  return <ListView user={user} leaderboard={leaderboard} userContext={userContext} />
}
