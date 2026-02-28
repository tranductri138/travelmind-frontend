export interface Room {
  id: string
  hotelId: string
  name: string
  description: string
  type: string
  price: number
  capacity: number
  amenities: string[]
  images: string[]
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateRoomRequest {
  hotelId: string
  name: string
  description: string
  type: string
  price: number
  capacity: number
  amenities?: string[]
  images?: string[]
}

export interface CheckAvailabilityRequest {
  roomId: string
  checkIn: string
  checkOut: string
}

export interface CheckAvailabilityResponse {
  available: boolean
  price: number
  nights: number
  totalPrice: number
}
