import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface PaymentStatusProps {
  status: 'succeeded' | 'processing' | 'failed'
}

export function PaymentStatus({ status }: PaymentStatusProps) {
  const config = {
    succeeded: {
      icon: CheckCircle,
      title: 'Payment Successful',
      description: 'Your booking has been confirmed.',
      color: 'text-green-600',
    },
    processing: {
      icon: Clock,
      title: 'Payment Processing',
      description: 'Your payment is being processed. We will notify you when confirmed.',
      color: 'text-yellow-600',
    },
    failed: {
      icon: XCircle,
      title: 'Payment Failed',
      description: 'Your payment could not be processed. Please try again.',
      color: 'text-red-600',
    },
  }

  const { icon: Icon, title, description, color } = config[status]

  return (
    <div className="flex flex-col items-center text-center py-8">
      <Icon className={`h-16 w-16 ${color} mb-4`} />
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  )
}
