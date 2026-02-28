import { useState } from 'react'
import { format } from 'date-fns'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AvailabilityCalendar } from '@/components/room/AvailabilityCalendar'
import { PriceBreakdown } from '@/components/room/PriceBreakdown'
import type { Room } from '@/types/room'

interface BookingFormProps {
  room: Room
  onSubmit: (data: { roomId: string; checkIn: string; checkOut: string; guests: number }) => void
  isPending?: boolean
}

export function BookingForm({ room, onSubmit, isPending }: BookingFormProps) {
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(1)

  const nights = checkIn && checkOut
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkIn || !checkOut) return
    onSubmit({
      roomId: room.id,
      checkIn: format(checkIn, 'yyyy-MM-dd'),
      checkOut: format(checkOut, 'yyyy-MM-dd'),
      guests,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AvailabilityCalendar
        checkIn={checkIn}
        checkOut={checkOut}
        onCheckInChange={setCheckIn}
        onCheckOutChange={setCheckOut}
      />

      <div className="space-y-2">
        <Label htmlFor="guests">Number of Guests</Label>
        <Input
          id="guests"
          type="number"
          min={1}
          max={room.capacity}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        />
      </div>

      {nights > 0 && <PriceBreakdown pricePerNight={room.price} nights={nights} />}

      <Button type="submit" className="w-full" disabled={!checkIn || !checkOut || isPending}>
        {isPending ? 'Processing...' : 'Proceed to Payment'}
      </Button>
    </form>
  )
}
