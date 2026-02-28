# Context: Payment (LianLian Bank)

## Flow đặt phòng → thanh toán
```
1. BookingPage (user chọn phòng + điền form)
   └→ POST /bookings                    → { bookingId, ... }

2. POST /payments/initiate/:bookingId   → { transactionId, paymentUrl?, ... }

3. LianLianCheckout component
   - Hiển thị form xác nhận thanh toán
   - User điền thông tin thẻ / xác nhận

4. POST /payments/confirm/:transactionId → { status: 'SUCCESS' | 'FAILED' }

5. Redirect → /bookings/:bookingId (BookingDetailPage)
```

## API (`src/api/payment.api.ts`)
```ts
paymentApi.initiate(bookingId)          // POST /payments/initiate/:bookingId
paymentApi.confirm(transactionId)       // POST /payments/confirm/:transactionId
```

## Components (`src/components/payment/`)
- `LianLianCheckout` — nhận `transactionId` prop, hiển thị form, gọi `confirm()`
- `PaymentStatus` — hiển thị trạng thái SUCCESS / FAILED / PENDING

## State machine trong BookingPage (`src/pages/user/BookingPage.tsx`)
```
step 1: 'SELECT_ROOM'   → RoomList, user chọn phòng
step 2: 'BOOKING_FORM'  → BookingForm, user điền ngày/guests
step 3: 'PAYMENT'       → LianLianCheckout, xác nhận thanh toán
```

## Types (`src/types/payment.ts`)
```ts
type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
interface InitiatePaymentResponse { transactionId: string; ... }
interface ConfirmPaymentResponse { status: PaymentStatus; bookingId: string }
```

## Lưu ý
- Không dùng Stripe hay SDK ngoài — LianLian dùng form HTML thuần + API call
- `transactionId` là key để confirm, không phải `bookingId`
- Booking được tạo trước, payment chỉ xác nhận sau
