'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAdminStats() {
  const supabase = await createClient()

  const { data: sales, error } = await supabase
    .from('sales')
    .select('category, created_at, employee_id, employees(name)')

  if (error) {
    console.error('Error fetching sales:', error)
    return { internet: 0, mobile: 0, total: 0, salesByDate: [], salesByUserAndDate: [] }
  }

  const internet = sales.filter((s: any) => s.category === 'Internet').length
  const mobile = sales.filter((s: any) => s.category === 'Mobile').length

  // Group sales by date for the chart (aggregate view)
  const salesByDateMap = sales.reduce((acc: any, sale: any) => {
    const date = new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (!acc[date]) {
      acc[date] = { date, internet: 0, mobile: 0 }
    }
    if (sale.category === 'Internet') acc[date].internet++
    if (sale.category === 'Mobile') acc[date].mobile++
    return acc
  }, {})

  const salesByDate = Object.values(salesByDateMap).sort((a: any, b: any) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ).slice(-7) // Last 7 days

  // Group sales by user, date, and category for individual user trend lines
  const salesByUserMap: any = {}
  
  sales.forEach((sale: any) => {
    const date = new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const userName = sale.employees?.name || 'Unknown'
    const key = `${userName}-${sale.category}`
    
    if (!salesByUserMap[key]) {
      salesByUserMap[key] = {
        userName,
        category: sale.category,
        salesByDate: {}
      }
    }
    
    if (!salesByUserMap[key].salesByDate[date]) {
      salesByUserMap[key].salesByDate[date] = 0
    }
    
    salesByUserMap[key].salesByDate[date]++
  })

  // Convert to array format suitable for recharts
  const salesByUserAndDate = Object.values(salesByUserMap).map((userData: any) => {
    const dates = Object.keys(userData.salesByDate).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    ).slice(-7)
    
    return {
      userName: userData.userName,
      category: userData.category,
      data: dates.map(date => ({
        date,
        count: userData.salesByDate[date]
      }))
    }
  })

  return {
    internet,
    mobile,
    total: sales.length,
    salesByDate,
    salesByUserAndDate
  }
}

export async function getUsers() {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('employees')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return users
}

export async function deleteAllSales() {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sales')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // First delete their sales
  const { error: salesError } = await supabase
    .from('sales')
    .delete()
    .eq('employee_id', userId)

  if (salesError) {
    return { error: salesError.message }
  }

  // Then delete the employee record
  const { error: userError } = await supabase
    .from('employees')
    .delete()
    .eq('id', userId)

  if (userError) {
    return { error: userError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
