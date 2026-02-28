import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/cn'

interface PriceTagProps {
  price: number
  currency?: string
  period?: string
  className?: string
}

export function PriceTag({ price, currency = 'USD', period = '/night', className }: PriceTagProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-1', className)}>
      <span className="text-lg font-bold">{formatCurrency(price, currency)}</span>
      {period && <span className="text-sm text-muted-foreground">{period}</span>}
    </span>
  )
}
