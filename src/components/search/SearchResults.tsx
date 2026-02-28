import { HotelCard } from '@/components/hotel/HotelCard'
import { SemanticBadge } from './SemanticBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchIcon } from 'lucide-react'
import type { SearchResult } from '@/types/search'

interface SearchResultsProps {
  results: SearchResult[]
  query: string
}

export function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon={<SearchIcon className="h-12 w-12" />}
        title="No results found"
        description={`No hotels match "${query}". Try different keywords.`}
      />
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div key={`${result.source}-${result.hotel.id}`} className="relative">
          {result.source === 'semantic' && (
            <div className="absolute top-2 right-2 z-10">
              <SemanticBadge />
            </div>
          )}
          <HotelCard hotel={result.hotel} />
        </div>
      ))}
    </div>
  )
}
