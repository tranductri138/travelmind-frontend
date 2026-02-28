import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReviewForm } from '@/components/review/ReviewForm'
import { useBookingDetail } from '@/hooks/useBookings'
import { useCreateReview } from '@/hooks/useReviews'
import { bookingDetailPath } from '@/config/routes'
import { toast } from 'sonner'
import type { CreateReviewInput } from '@/lib/validators'

export function WriteReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking } = useBookingDetail(id!)
  const createReview = useCreateReview()

  const handleSubmit = async (data: CreateReviewInput) => {
    await createReview.mutateAsync(data)
    toast.success('Review submitted!')
    navigate(bookingDetailPath(id!))
  }

  if (!booking) return <div className="container mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Write a Review</h1>
      <p className="text-muted-foreground mb-6">{booking.hotel?.name}</p>

      <Card>
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewForm
            hotelId={booking.hotelId}
            bookingId={booking.id}
            onSubmit={handleSubmit}
            isPending={createReview.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
