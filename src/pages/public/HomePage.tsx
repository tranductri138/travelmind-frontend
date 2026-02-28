import { SearchBar } from '@/components/search/SearchBar'
import { HotelGrid } from '@/components/hotel/HotelGrid'
import { HotelGridSkeleton } from '@/components/common/LoadingSkeleton'
import { useHotels } from '@/hooks/useHotels'

export function HomePage() {
  const { data, isLoading } = useHotels({ featured: true, limit: 8 })

  return (
    <div>
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Find Your Perfect Stay
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover amazing hotels powered by AI-driven recommendations. Book with confidence.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar size="lg" />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Hotels</h2>
        {isLoading ? (
          <HotelGridSkeleton />
        ) : (
          <HotelGrid hotels={data?.data || []} />
        )}
      </section>
    </div>
  )
}
