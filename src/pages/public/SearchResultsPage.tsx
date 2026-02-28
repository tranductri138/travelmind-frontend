import { useSearchParams } from 'react-router-dom'
import { SearchBar } from '@/components/search/SearchBar'
import { HotelCard } from '@/components/hotel/HotelCard'
import { SemanticBadge } from '@/components/search/SemanticBadge'
import { HotelGridSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Separator } from '@/components/ui/separator'
import { useFullTextSearch, useSemanticSearch } from '@/hooks/useSearch'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchIcon } from 'lucide-react'
import type { SearchResult } from '@/types/search'

export function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const debouncedQuery = useDebounce(query, 300)

  const { data: keywordData, isLoading: keywordLoading } = useFullTextSearch(debouncedQuery)
  const { data: semanticData, isLoading: semanticLoading } = useSemanticSearch(debouncedQuery)

  const isLoading = keywordLoading && semanticLoading

  // Merge and deduplicate results
  const allResults: SearchResult[] = []
  const seen = new Set<string>()
  for (const r of [...(semanticData || []), ...(keywordData?.data || [])]) {
    if (!seen.has(r.hotel.id)) {
      seen.add(r.hotel.id)
      allResults.push(r)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mb-8">
        <SearchBar defaultValue={query} />
      </div>

      {query && (
        <p className="text-muted-foreground mb-4">
          {allResults.length} results for &quot;{query}&quot;
        </p>
      )}

      {isLoading ? (
        <HotelGridSkeleton count={4} />
      ) : allResults.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="h-12 w-12" />}
          title="No results found"
          description="Try different keywords or check your spelling."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allResults.map((result) => (
            <div key={result.hotel.id} className="relative">
              {result.source === 'semantic' && (
                <div className="absolute top-2 right-2 z-10">
                  <SemanticBadge />
                </div>
              )}
              <HotelCard hotel={result.hotel} />
            </div>
          ))}
        </div>
      )}

      {semanticData && semanticData.length > 0 && (
        <>
          <Separator className="my-8" />
          <p className="text-xs text-muted-foreground">
            Some results are powered by AI semantic search for better relevance.
          </p>
        </>
      )}
    </div>
  )
}
