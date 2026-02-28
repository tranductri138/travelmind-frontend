export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  HOTELS: '/hotels',
  HOTEL_DETAIL: '/hotels/:id',
  HOTEL_BOOK: '/hotels/:id/book',

  SEARCH: '/search',

  BOOKINGS: '/bookings',
  BOOKING_DETAIL: '/bookings/:id',
  BOOKING_REVIEW: '/bookings/:id/review',

  PROFILE: '/profile',
  CHAT: '/chat',

  ADMIN: '/admin',
  ADMIN_HOTELS: '/admin/hotels',
  ADMIN_HOTEL_NEW: '/admin/hotels/new',
  ADMIN_HOTEL_EDIT: '/admin/hotels/:id/edit',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_CRAWLER: '/admin/crawler',
} as const

export function hotelDetailPath(id: string) {
  return `/hotels/${id}`
}

export function hotelBookPath(id: string) {
  return `/hotels/${id}/book`
}

export function bookingDetailPath(id: string) {
  return `/bookings/${id}`
}

export function bookingReviewPath(id: string) {
  return `/bookings/${id}/review`
}

export function adminHotelEditPath(id: string) {
  return `/admin/hotels/${id}/edit`
}
