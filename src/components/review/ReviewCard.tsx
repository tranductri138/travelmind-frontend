import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StarRating } from '@/components/common/StarRating'
import { formatRelative } from '@/lib/format'
import type { Review } from '@/types/review'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex gap-4 py-4">
      <Avatar>
        <AvatarFallback>{review.user?.name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{review.user?.name || 'Anonymous'}</span>
          <span className="text-sm text-muted-foreground">{formatRelative(review.createdAt)}</span>
        </div>
        <StarRating rating={review.rating} size={14} />
        <p className="mt-2 text-sm">{review.comment}</p>
      </div>
    </div>
  )
}
