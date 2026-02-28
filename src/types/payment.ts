export interface PaymentInitiation {
  transactionId: string
  amount: number
  currency: string
  bankInfo: {
    bankName: string
    accountNumber: string
    accountHolder: string
    routingCode: string
  }
}

export interface CreatePaymentRequest {
  bookingId: string
}
