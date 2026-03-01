export interface Hotel {
  id: string
  name: string
  description: string
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  stars: number
  rating: number
  reviewCount: number
  priceMin: number
  amenities: string[]
  images: string[]
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateHotelRequest {
  name: string
  description: string
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  stars: number
  amenities?: string[]
  images?: string[]
}

export interface UpdateHotelRequest extends Partial<CreateHotelRequest> {}

export interface SearchHotelParams {
  page?: number
  limit?: number
  q?: string
  city?: string
  country?: string
  minPrice?: number
  maxPrice?: number
  minStars?: number
  minRating?: number
  amenities?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
