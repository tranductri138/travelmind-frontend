import { Star } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StarRatingProps {
  rating: number
  max?: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function StarRating({ rating, max = 5, size = 16, interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating)
        return (
          <Star
            key={i}
            className={cn(
              'transition-colors',
              filled ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30',
              interactive && 'cursor-pointer hover:text-yellow-400',
            )}
            style={{ width: size, height: size }}
            onClick={() => interactive && onChange?.(i + 1)}
          />
        )
      })}
    </div>
  )
}
