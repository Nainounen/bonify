/**
 * Export data to CSV format
 */

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Format sales data for export
 */
export function formatSalesForExport(sales: any[]) {
  return sales.map(sale => ({
    'Date': new Date(sale.created_at).toLocaleDateString(),
    'Time': new Date(sale.created_at).toLocaleTimeString(),
    'Category': sale.category || 'N/A',
    'Employee': sale.employees?.name || 'Unknown',
    'Tier': sale.bonus_tiers?.name || 'N/A',
    'Bonus Amount': sale.bonus_tiers?.bonus_amount || 0,
  }))
}

/**
 * Format leaderboard data for export
 */
export function formatLeaderboardForExport(leaderboard: any[]) {
  return leaderboard.map((employee, index) => ({
    'Rank': index + 1,
    'Name': employee.name,
    'Email': employee.email,
    'Total Sales': employee.totalSales,
    'Internet Sales': employee.internetSales,
    'Mobile Sales': employee.mobileSales,
    'Current Tier': employee.currentTier?.name || 'Starter',
    'Total Bonus': employee.totalBonus || 0,
  }))
}
