import { Users } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PriceTag } from '@/components/common/PriceTag'
import { AmenityBadge } from '@/components/hotel/AmenityBadge'
import type { Room } from '@/types/room'

interface RoomCardProps {
  room: Room
  onBook?: (room: Room) => void
}

export function RoomCard({ room, onBook }: RoomCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-lg">{room.name}</h4>
            <Badge variant="outline" className="mt-1">{room.type}</Badge>
          </div>
          <PriceTag price={room.price} />
        </div>
        <p className="text-sm text-muted-foreground mt-2">{room.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Up to {room.capacity} guests</span>
        </div>
        {room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {room.amenities.map((a) => (
              <AmenityBadge key={a} amenity={a} />
            ))}
          </div>
        )}
      </CardContent>
      {onBook && (
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            disabled={!room.isAvailable}
            onClick={() => onBook(room)}
          >
            {room.isAvailable ? 'Book Now' : 'Unavailable'}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
