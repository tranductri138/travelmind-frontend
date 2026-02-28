import type { User } from './user'

export interface Review {
  id: string
  userId: string
  hotelId: string
  bookingId: string
  rating: number
  comment: string
  user?: User
  createdAt: string
  updatedAt: string
}

export interface CreateReviewRequest {
  hotelId: string
  bookingId: string
  rating: number
  comment: string
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  distribution: Record<number, number>
}
