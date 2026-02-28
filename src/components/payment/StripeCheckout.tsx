import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'

interface StripeCheckoutProps {
  onSuccess: () => void
}

export function StripeCheckout({ onSuccess }: StripeCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsPending(true)
    setError(undefined)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/bookings',
      },
      redirect: 'if_required',
    })

    if (submitError) {
      setError(submitError.message)
      setIsPending(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}
      <Button type="submit" className="w-full" disabled={!stripe || isPending}>
        {isPending ? 'Processing payment...' : 'Pay Now'}
      </Button>
    </form>
  )
}
