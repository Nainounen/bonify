import { Badge } from '@/components/ui/badge'
import * as Icons from 'lucide-react'

interface TierBadgeProps {
  name: string
  color: string
  icon: string
  size?: 'sm' | 'md' | 'lg'
}

export function TierBadge({ name, color, icon, size = 'md' }: TierBadgeProps) {
  // Dynamically get the icon component
  const IconComponent = (Icons as any)[icon] || Icons.Star
  
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1.5 px-3',
    lg: 'text-base py-2 px-4',
  }
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <Badge
      className={`${sizeClasses[size]} font-semibold`}
      style={{ backgroundColor: color, color: '#fff' }}
    >
      <IconComponent className={`${iconSizes[size]} mr-1.5`} />
      {name}
    </Badge>
  )
}
