import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StarRating } from '@/components/common/StarRating'
import { createReviewSchema, type CreateReviewInput } from '@/lib/validators'

interface ReviewFormProps {
  hotelId: string
  bookingId: string
  onSubmit: (data: CreateReviewInput) => void
  isPending?: boolean
}

export function ReviewForm({ hotelId, bookingId, onSubmit, isPending }: ReviewFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: { hotelId, bookingId, rating: 0, comment: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Rating</Label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <StarRating rating={field.value} interactive size={32} onChange={field.onChange} />
          )}
        />
        {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Review</Label>
        <Textarea
          id="comment"
          placeholder="Share your experience..."
          rows={5}
          {...register('comment')}
        />
        {errors.comment && <p className="text-sm text-destructive">{errors.comment.message}</p>}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}
