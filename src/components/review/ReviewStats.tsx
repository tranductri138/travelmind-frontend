import { StarRating } from '@/components/common/StarRating'
import type { ReviewStats as ReviewStatsType } from '@/types/review'

interface ReviewStatsProps {
  stats: ReviewStatsType
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  return (
    <div className="flex gap-8 items-start">
      <div className="text-center">
        <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
        <StarRating rating={stats.averageRating} size={18} />
        <p className="text-sm text-muted-foreground mt-1">{stats.totalReviews} reviews</p>
      </div>
      <div className="flex-1 space-y-1">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star] || 0
          const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3">{star}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-right text-muted-foreground">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
