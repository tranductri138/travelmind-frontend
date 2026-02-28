import { apiClient } from './client'
import type { PaymentInitiation } from '@/types/payment'
import type { ApiResponse } from '@/types/common'

export const paymentApi = {
  initiate(bookingId: string) {
    return apiClient.post<ApiResponse<PaymentInitiation>>(`/payments/initiate/${bookingId}`)
  },

  confirm(transactionId: string) {
    return apiClient.post<ApiResponse<{ status: string; bookingId: string }>>(
      `/payments/confirm/${transactionId}`,
    )
  },
}
