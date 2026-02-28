export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  hotels: {
    all: ['hotels'] as const,
    list: (params?: object) => ['hotels', 'list', params] as const,
    detail: (id: string) => ['hotels', 'detail', id] as const,
    nearby: (params?: object) => ['hotels', 'nearby', params] as const,
  },
  rooms: {
    byHotel: (hotelId: string) => ['rooms', 'byHotel', hotelId] as const,
    availability: (roomId: string, params?: Record<string, unknown>) =>
      ['rooms', 'availability', roomId, params] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (params?: Record<string, unknown>) => ['bookings', 'list', params] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
  },
  reviews: {
    byHotel: (hotelId: string, params?: Record<string, unknown>) =>
      ['reviews', 'byHotel', hotelId, params] as const,
  },
  search: {
    fullText: (query: string) => ['search', 'fullText', query] as const,
    semantic: (query: string) => ['search', 'semantic', query] as const,
  },
}
