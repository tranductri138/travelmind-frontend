import { ReviewCard } from './ReviewCard'
import { Separator } from '@/components/ui/separator'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { MessageSquare } from 'lucide-react'
import type { Review } from '@/types/review'

interface ReviewListProps {
  reviews: Review[]
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ReviewList({ reviews, page, totalPages, onPageChange }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-12 w-12" />}
        title="No reviews yet"
        description="Be the first to leave a review!"
      />
    )
  }

  return (
    <div>
      {reviews.map((review, i) => (
        <div key={review.id}>
          <ReviewCard review={review} />
          {i < reviews.length - 1 && <Separator />}
        </div>
      ))}
      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  )
}
