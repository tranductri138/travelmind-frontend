import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewApi } from '@/api/review.api'
import { queryKeys } from '@/config/query-keys'
import type { CreateReviewRequest } from '@/types/review'

export function useReviewsByHotel(
  hotelId: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: queryKeys.reviews.byHotel(hotelId, params),
    queryFn: () => reviewApi.listByHotel(hotelId, params).then((r) => r.data),
    enabled: !!hotelId,
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewApi.create(data).then((r) => r.data.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['reviews', 'byHotel', variables.hotelId] })
    },
  })
}
