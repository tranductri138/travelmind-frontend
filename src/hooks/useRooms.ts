import { useQuery, useMutation } from '@tanstack/react-query'
import { roomApi } from '@/api/room.api'
import { queryKeys } from '@/config/query-keys'
import type { CheckAvailabilityRequest } from '@/types/room'

export function useRoomsByHotel(hotelId: string) {
  return useQuery({
    queryKey: queryKeys.rooms.byHotel(hotelId),
    queryFn: () => roomApi.listByHotel(hotelId).then((r) => r.data.data),
    enabled: !!hotelId,
  })
}

export function useCheckAvailability() {
  return useMutation({
    mutationFn: (data: CheckAvailabilityRequest) =>
      roomApi.checkAvailability(data).then((r) => r.data.data),
  })
}
