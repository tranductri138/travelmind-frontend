import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { paymentApi } from '@/api/payment.api'

interface LianLianCheckoutProps {
  transactionId: string
  amount: number
  currency: string
  bankInfo: {
    bankName: string
    accountNumber: string
    accountHolder: string
    routingCode: string
  }
  onSuccess: () => void
}

export function LianLianCheckout({
  transactionId,
  amount,
  currency,
  bankInfo,
  onSuccess,
}: LianLianCheckoutProps) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string>()

  const handleConfirm = async () => {
    setIsPending(true)
    setError(undefined)

    try {
      await paymentApi.confirm(transactionId)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment confirmation failed')
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            LL
          </div>
          <span className="font-semibold text-lg">{bankInfo.bankName}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Account Holder</span>
          <span className="font-medium">{bankInfo.accountHolder}</span>

          <span className="text-muted-foreground">Account Number</span>
          <span className="font-mono">{bankInfo.accountNumber}</span>

          <span className="text-muted-foreground">Routing Code</span>
          <span className="font-mono">{bankInfo.routingCode}</span>

          <span className="text-muted-foreground">Amount</span>
          <span className="font-bold text-lg">
            {currency} {amount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3 text-sm text-blue-700 dark:text-blue-300">
        This is a simulated bank transfer. Click "Confirm Payment" to complete.
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <Button onClick={handleConfirm} className="w-full" disabled={isPending}>
        {isPending ? 'Processing payment...' : 'Confirm Payment'}
      </Button>
    </div>
  )
}
