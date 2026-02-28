import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookingCard } from '@/components/booking/BookingCard'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { HotelGridSkeleton } from '@/components/common/LoadingSkeleton'
import { CalendarDays } from 'lucide-react'
import { useBookings } from '@/hooks/useBookings'

export function MyBookingsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('all')

  const { data, isLoading } = useBookings({
    page,
    limit: 10,
    status: status === 'all' ? undefined : status,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <HotelGridSkeleton count={3} />
      ) : !data?.data.length ? (
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title="No bookings"
          description="You haven't made any bookings yet."
        />
      ) : (
        <div className="space-y-4">
          {data.data.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
          {data.meta && (
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  )
}
