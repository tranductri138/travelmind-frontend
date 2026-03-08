import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { bookingApi } from '@/api/booking.api'
import { queryKeys } from '@/config/query-keys'
import type { CreateBookingRequest } from '@/types/booking'

export function useBookings(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params),
    queryFn: () => bookingApi.list(params).then((r) => r.data),
    placeholderData: keepPreviousData,
  })
}

export function useAdminBookings(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: [...queryKeys.bookings.all, 'admin', params],
    queryFn: () => bookingApi.listAdmin(params).then((r) => r.data),
    placeholderData: keepPreviousData,
  })
}

export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => bookingApi.detail(id).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingApi.create(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.bookings.all }),
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all })
      qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) })
    },
  })
}

export function useDeleteBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.bookings.all }),
  })
}
