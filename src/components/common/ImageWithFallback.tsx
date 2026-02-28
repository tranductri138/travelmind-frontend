import { useState } from 'react'
import { cn } from '@/lib/cn'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
}

export function ImageWithFallback({ src, alt, className, fallback, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  const placeholderSrc = fallback || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23e5e7eb"%3E%3Crect width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E'

  return (
    <img
      src={error ? placeholderSrc : src}
      alt={alt}
      className={cn('object-cover', className)}
      onError={() => setError(true)}
      {...props}
    />
  )
}
