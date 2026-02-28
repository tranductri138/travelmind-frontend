import { apiClient } from './client'
import type { PaymentIntent, CreatePaymentRequest } from '@/types/payment'
import type { ApiResponse } from '@/types/common'

export const paymentApi = {
  createIntent(data: CreatePaymentRequest) {
    return apiClient.post<ApiResponse<PaymentIntent>>('/payments/intent', data)
  },
}
