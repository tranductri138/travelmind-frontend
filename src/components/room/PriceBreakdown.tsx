import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/format'

interface PriceBreakdownProps {
  pricePerNight: number
  nights: number
  taxRate?: number
}

export function PriceBreakdown({ pricePerNight, nights, taxRate = 0.1 }: PriceBreakdownProps) {
  const subtotal = pricePerNight * nights
  const taxes = subtotal * taxRate
  const total = subtotal + taxes

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <h4 className="font-semibold">Price Breakdown</h4>
      <div className="flex justify-between text-sm">
        <span>{formatCurrency(pricePerNight)} x {nights} night{nights > 1 ? 's' : ''}</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Taxes & fees</span>
        <span>{formatCurrency(taxes)}</span>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
