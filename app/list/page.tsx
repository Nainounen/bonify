import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLeaderboard } from './actions'
import { ListView } from '@/components/list-view'

export default async function ListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getLeaderboard()

  if ('error' in result || !result.leaderboard) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">Error loading leaderboard</div>
  }

  const { leaderboard } = result

  return <ListView user={user} leaderboard={leaderboard} />
}
