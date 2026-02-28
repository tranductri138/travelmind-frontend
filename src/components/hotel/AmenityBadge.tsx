import { Wifi, Car, Dumbbell, UtensilsCrossed, Waves, Wind, Coffee, Tv } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  parking: Car,
  gym: Dumbbell,
  restaurant: UtensilsCrossed,
  pool: Waves,
  'air-conditioning': Wind,
  breakfast: Coffee,
  tv: Tv,
}

interface AmenityBadgeProps {
  amenity: string
}

export function AmenityBadge({ amenity }: AmenityBadgeProps) {
  const Icon = amenityIcons[amenity.toLowerCase()]

  return (
    <Badge variant="secondary" className="gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {amenity}
    </Badge>
  )
}
