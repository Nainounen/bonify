/**
 * Bonus Calculator Library
 * Implements the Top Seller Incentive bonus logic based on ZER (Zielerreichung/Target Achievement)
 */

export type EmployeeRole = 'internal_sales' | 'external_sales' | 'shop_manager' | 'regional_manager'

export type BonusRates = {
  wireless_level1: number // CHF per order (100-120% ZER)
  wireless_level2: number // CHF per order (>120% ZER)
  wireline_level1: number // CHF per order (100-120% ZER)
  wireline_level2: number // CHF per order (>120% ZER)
  monthly_cap: number // Max CHF per month
}

// Bonus rates by role
export const BONUS_RATES: Record<EmployeeRole, BonusRates> = {
  internal_sales: {
    wireless_level1: 30,
    wireless_level2: 60,
    wireline_level1: 50,
    wireline_level2: 100,
    monthly_cap: 1600,
  },
  external_sales: {
    wireless_level1: 15,
    wireless_level2: 30,
    wireline_level1: 25,
    wireline_level2: 50,
    monthly_cap: 800,
  },
  shop_manager: {
    wireless_level1: 0, // Not used for managers
    wireless_level2: 0,
    wireline_level1: 0,
    wireline_level2: 0,
    monthly_cap: 0, // Managers have different logic
  },
  regional_manager: {
    wireless_level1: 0,
    wireless_level2: 0,
    wireline_level1: 0,
    wireline_level2: 0,
    monthly_cap: 0,
  },
}

// Shop manager gets CHF 50 per percentage point above 100% gZER
export const MANAGER_BONUS_PER_POINT = 50
export const MANAGER_MAX_ZER = 200 // Cap at 200% gZER

/**
 * Calculate ZER percentage for a category
 */
export function calculateZER(actualCount: number, targetCount: number): number {
  if (targetCount === 0) return 0
  return (actualCount / targetCount) * 100
}

/**
 * Calculate orders per level based on ZER
 * Level 1: Orders between 100% and 120% (orders beyond target up to 120%)
 * Level 2: Orders beyond 120%
 */
export function calculateOrdersByLevel(
  actualCount: number,
  targetCount: number
): { level1: number; level2: number } {
  if (targetCount === 0 || actualCount <= targetCount) {
    return { level1: 0, level2: 0 }
  }

  const zer = calculateZER(actualCount, targetCount)
  const excessOrders = actualCount - targetCount

  if (zer <= 120) {
    // All excess orders are Level 1
    return { level1: excessOrders, level2: 0 }
  }

  // Calculate Level 1 orders (from 100% to 120%)
  const level1Target = targetCount * 1.2
  const level1Orders = Math.floor(level1Target - targetCount)

  // Remaining orders are Level 2
  const level2Orders = actualCount - Math.floor(level1Target)

  return { level1: level1Orders, level2: level2Orders }
}

/**
 * Calculate bonus for a sales employee (internal or external)
 */
export function calculateEmployeeBonus(params: {
  role: EmployeeRole
  wirelessCount: number
  wirelineCount: number
  wirelessTarget: number
  wirelineTarget: number
  employmentPercentage: number
}): {
  wirelessZER: number
  wirelineZER: number
  level1WirelessOrders: number
  level1WirelineOrders: number
  level2WirelessOrders: number
  level2WirelineOrders: number
  totalBonus: number
  cappedBonus: number
  proRataCap: number
} {
  const {
    role,
    wirelessCount,
    wirelineCount,
    wirelessTarget,
    wirelineTarget,
    employmentPercentage,
  } = params

  // Calculate ZER percentages
  const wirelessZER = calculateZER(wirelessCount, wirelessTarget)
  const wirelineZER = calculateZER(wirelineCount, wirelineTarget)

  // Calculate orders by level
  const wirelessLevels = calculateOrdersByLevel(wirelessCount, wirelessTarget)
  const wirelineLevels = calculateOrdersByLevel(wirelineCount, wirelineTarget)

  // Get bonus rates for role
  const rates = BONUS_RATES[role]

  // Calculate bonus amounts
  const wirelessBonus =
    wirelessLevels.level1 * rates.wireless_level1 +
    wirelessLevels.level2 * rates.wireless_level2
  const wirelineBonus =
    wirelineLevels.level1 * rates.wireline_level1 +
    wirelineLevels.level2 * rates.wireline_level2

  const totalBonus = wirelessBonus + wirelineBonus

  // Apply pro-rata cap based on employment percentage
  const proRataCap = (rates.monthly_cap * employmentPercentage) / 100
  const cappedBonus = Math.min(totalBonus, proRataCap)

  return {
    wirelessZER,
    wirelineZER,
    level1WirelessOrders: wirelessLevels.level1,
    level1WirelineOrders: wirelineLevels.level1,
    level2WirelessOrders: wirelessLevels.level2,
    level2WirelineOrders: wirelineLevels.level2,
    totalBonus,
    cappedBonus,
    proRataCap,
  }
}

/**
 * Calculate shop-wide gZER (average ZER of all employees)
 */
export function calculateShopGZER(employeeZERs: {
  wirelessZER: number
  wirelineZER: number
}[]): number {
  if (employeeZERs.length === 0) return 0

  // Average of all wireless and wireline ZERs
  const totalZER = employeeZERs.reduce(
    (sum, emp) => sum + emp.wirelessZER + emp.wirelineZER,
    0
  )

  return totalZER / (employeeZERs.length * 2) // Divide by 2 because each employee has 2 ZERs
}

/**
 * Calculate bonus for a shop manager based on shop gZER
 */
export function calculateShopManagerBonus(shopGZER: number): {
  shopGZER: number
  bonusAmount: number
  pointsAbove100: number
} {
  // Cap at 200%
  const cappedGZER = Math.min(shopGZER, MANAGER_MAX_ZER)

  // Bonus only applies for ZER > 100%
  if (cappedGZER <= 100) {
    return {
      shopGZER,
      bonusAmount: 0,
      pointsAbove100: 0,
    }
  }

  const pointsAbove100 = cappedGZER - 100
  const bonusAmount = pointsAbove100 * MANAGER_BONUS_PER_POINT

  return {
    shopGZER,
    bonusAmount,
    pointsAbove100,
  }
}

/**
 * Helper to get current month/year
 */
export function getCurrentPeriod(): { year: number; month: number } {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // JS months are 0-indexed
  }
}

/**
 * Format ZER percentage for display
 */
export function formatZER(zer: number): string {
  return `${zer.toFixed(1)}%`
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `CHF ${amount.toFixed(2)}`
}

/**
 * Get ZER status color
 */
export function getZERColor(zer: number): 'red' | 'yellow' | 'green' {
  if (zer < 100) return 'red'
  if (zer <= 120) return 'yellow'
  return 'green'
}
