import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomApi } from '@/api/room.api'
import { queryKeys } from '@/config/query-keys'
import type { CheckAvailabilityRequest, CreateRoomRequest } from '@/types/room'

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

export function useCreateRoom(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<CreateRoomRequest, 'hotelId'>) =>
      roomApi.create(hotelId, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.byHotel(hotelId) })
    },
  })
}

export function useDeleteRoom(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomId: string) => roomApi.delete(hotelId, roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.byHotel(hotelId) })
    },
  })
}
