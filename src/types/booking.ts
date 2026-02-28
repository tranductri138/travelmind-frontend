import type { Hotel } from './hotel'
import type { Room } from './room'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export interface Booking {
  id: string
  userId: string
  hotelId: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: BookingStatus
  hotel?: Hotel
  room?: Room
  createdAt: string
  updatedAt: string
}

export interface CreateBookingRequest {
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
}

export interface CreateBookingResponse {
  booking: Booking
  clientSecret: string
}
