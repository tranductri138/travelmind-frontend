import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BookingTimeline } from '@/components/booking/BookingTimeline'
import { CancelDialog } from '@/components/booking/CancelDialog'
import { useBookingDetail, useCancelBooking } from '@/hooks/useBookings'
import { formatDate, formatCurrency } from '@/lib/format'
import { bookingReviewPath } from '@/config/routes'

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: booking, isLoading } = useBookingDetail(id!)
  const cancelBooking = useCancelBooking()

  if (isLoading) return <div className="container mx-auto px-4 py-8">Loading...</div>
  if (!booking) return <div className="container mx-auto px-4 py-8">Booking not found</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Booking Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>{booking.hotel?.name || 'Hotel'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <BookingTimeline status={booking.status} />

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Check-in</p>
              <p className="font-medium">{formatDate(booking.checkIn)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Check-out</p>
              <p className="font-medium">{formatDate(booking.checkOut)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Guests</p>
              <p className="font-medium">{booking.guests}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Room</p>
              <p className="font-medium">{booking.room?.name || 'N/A'}</p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold">{formatCurrency(booking.totalPrice)}</span>
          </div>

          <div className="flex gap-4">
            {booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? (
              <CancelDialog
                onConfirm={() => cancelBooking.mutate(booking.id)}
                isPending={cancelBooking.isPending}
              />
            ) : null}
            {booking.status === 'COMPLETED' && (
              <Link to={bookingReviewPath(booking.id)}>
                <Button variant="outline">Write Review</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
