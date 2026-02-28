import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { hotelApi } from '@/api/hotel.api'
import { queryKeys } from '@/config/query-keys'
import type { SearchHotelParams, CreateHotelRequest, UpdateHotelRequest } from '@/types/hotel'

export function useHotels(params?: SearchHotelParams) {
  return useQuery({
    queryKey: queryKeys.hotels.list(params),
    queryFn: () => hotelApi.list(params).then((r) => r.data),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
}

export function useHotelDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.hotels.detail(id),
    queryFn: () => hotelApi.detail(id).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useNearbyHotels(params: { latitude: number; longitude: number; radius?: number }) {
  return useQuery({
    queryKey: queryKeys.hotels.nearby(params),
    queryFn: () => hotelApi.nearby(params).then((r) => r.data.data),
    enabled: !!params.latitude && !!params.longitude,
  })
}

export function useCreateHotel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateHotelRequest) => hotelApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hotels.all }),
  })
}

export function useUpdateHotel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHotelRequest }) =>
      hotelApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.hotels.all })
      qc.invalidateQueries({ queryKey: queryKeys.hotels.detail(id) })
    },
  })
}

export function useDeleteHotel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hotelApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hotels.all }),
  })
}
