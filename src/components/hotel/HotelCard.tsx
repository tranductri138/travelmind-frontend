import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { StarRating } from '@/components/common/StarRating'
import { PriceTag } from '@/components/common/PriceTag'
import { hotelDetailPath } from '@/config/routes'
import type { Hotel } from '@/types/hotel'

interface HotelCardProps {
  hotel: Hotel
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Link to={hotelDetailPath(hotel.id)}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <ImageWithFallback
          src={hotel.images?.[0]}
          alt={hotel.name}
          className="h-48 w-full"
        />
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{hotel.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            {hotel.city}, {hotel.country}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={hotel.rating} size={14} />
            <span className="text-sm text-muted-foreground">({hotel.reviewCount})</span>
          </div>
          <div className="mt-3">
            <PriceTag price={hotel.priceMin} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
