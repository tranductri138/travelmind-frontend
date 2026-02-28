import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function SemanticBadge() {
  return (
    <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700">
      <Sparkles className="h-3 w-3" />
      AI-powered
    </Badge>
  )
}
