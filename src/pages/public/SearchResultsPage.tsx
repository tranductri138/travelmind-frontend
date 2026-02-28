import { useSearchParams } from 'react-router-dom'
import { SearchBar } from '@/components/search/SearchBar'
import { HotelCard } from '@/components/hotel/HotelCard'
import { SemanticBadge } from '@/components/search/SemanticBadge'
import { HotelGridSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Separator } from '@/components/ui/separator'
import { useSearch } from '@/hooks/useSearch'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchIcon } from 'lucide-react'

export function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const debouncedQuery = useDebounce(query, 300)

  const { data, isLoading } = useSearch(debouncedQuery)

  const results = data?.data ?? []
  const hasSemanticResults = results.some((r) => r.source === 'semantic')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mb-8">
        <SearchBar defaultValue={query} />
      </div>

      {query && (
        <p className="text-muted-foreground mb-4">
          {results.length} results for &quot;{query}&quot;
        </p>
      )}

      {isLoading ? (
        <HotelGridSkeleton count={4} />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="h-12 w-12" />}
          title="No results found"
          description="Try different keywords or check your spelling."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
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

      {hasSemanticResults && (
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
