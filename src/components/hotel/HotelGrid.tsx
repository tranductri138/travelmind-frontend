import { HotelCard } from './HotelCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Hotel as HotelIcon } from 'lucide-react'
import type { Hotel } from '@/types/hotel'

interface HotelGridProps {
  hotels: Hotel[]
}

export function HotelGrid({ hotels }: HotelGridProps) {
  if (hotels.length === 0) {
    return (
      <EmptyState
        icon={<HotelIcon className="h-12 w-12" />}
        title="No hotels found"
        description="Try adjusting your search filters."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  )
}
