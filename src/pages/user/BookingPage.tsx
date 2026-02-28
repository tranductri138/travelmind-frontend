import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingForm } from '@/components/booking/BookingForm'
import { StripeCheckout } from '@/components/payment/StripeCheckout'
import { RoomList } from '@/components/room/RoomList'
import { useRoomsByHotel } from '@/hooks/useRooms'
import { useCreateBooking } from '@/hooks/useBookings'
import { useHotelDetail } from '@/hooks/useHotels'
import { bookingDetailPath } from '@/config/routes'
import type { Room } from '@/types/room'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

export function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(location.state?.room)
  const [clientSecret, setClientSecret] = useState<string>()
  const [bookingId, setBookingId] = useState<string>()

  const { data: hotel } = useHotelDetail(id!)
  const { data: rooms } = useRoomsByHotel(id!)
  const createBooking = useCreateBooking()

  const handleBookingSubmit = async (data: { roomId: string; checkIn: string; checkOut: string; guests: number }) => {
    const result = await createBooking.mutateAsync(data)
    setClientSecret(result.clientSecret)
    setBookingId(result.booking.id)
  }

  if (clientSecret && bookingId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeCheckout onSuccess={() => navigate(bookingDetailPath(bookingId))} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Book Your Stay</h1>
      {hotel && <p className="text-muted-foreground mb-6">{hotel.name}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {selectedRoom ? (
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingForm
                  room={selectedRoom}
                  onSubmit={handleBookingSubmit}
                  isPending={createBooking.isPending}
                />
              </CardContent>
            </Card>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select a Room</h2>
              <RoomList rooms={rooms || []} onBook={setSelectedRoom} />
            </div>
          )}
        </div>

        <div>
          {selectedRoom && (
            <Card>
              <CardHeader>
                <CardTitle>Room Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{selectedRoom.name}</p>
                <p className="text-sm text-muted-foreground">{selectedRoom.type}</p>
                <p className="text-sm">Up to {selectedRoom.capacity} guests</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
