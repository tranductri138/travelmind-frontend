import { Check, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { BookingStatus } from '@/types/booking'

const steps: { status: BookingStatus; label: string }[] = [
  { status: 'PENDING', label: 'Pending' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'COMPLETED', label: 'Completed' },
]

const statusOrder: Record<BookingStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  COMPLETED: 2,
  CANCELLED: -1,
}

interface BookingTimelineProps {
  status: BookingStatus
}

export function BookingTimeline({ status }: BookingTimelineProps) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <XCircle className="h-5 w-5" />
        <span className="font-medium">Booking Cancelled</span>
      </div>
    )
  }

  const currentStep = statusOrder[status]

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => {
        const isCompleted = currentStep > i
        const isCurrent = currentStep === i

        return (
          <div key={step.status} className="flex items-center gap-2">
            {i > 0 && (
              <div className={cn('h-0.5 w-8', isCompleted ? 'bg-primary' : 'bg-muted')} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center',
                  isCompleted ? 'bg-primary text-primary-foreground' : isCurrent ? 'border-2 border-primary text-primary' : 'border-2 border-muted text-muted-foreground',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
              <span className={cn('text-xs', (isCompleted || isCurrent) ? 'font-medium' : 'text-muted-foreground')}>
                {step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
