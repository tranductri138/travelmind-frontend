import { Link } from 'react-router-dom'
import { CalendarDays, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/format'
import { bookingDetailPath } from '@/config/routes'
import type { Booking } from '@/types/booking'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

interface BookingCardProps {
  booking: Booking
}

export function BookingCard({ booking }: BookingCardProps) {
  return (
    <Link to={bookingDetailPath(booking.id)}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{booking.hotel?.name || 'Hotel'}</h4>
              {booking.hotel && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {booking.hotel.city}, {booking.hotel.country}
                </div>
              )}
            </div>
            <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
            </div>
          </div>
          <div className="mt-2 text-right font-semibold">
            {formatCurrency(booking.totalPrice)}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
