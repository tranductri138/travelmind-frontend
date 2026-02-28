import { useState } from 'react'
import { HotelGrid } from '@/components/hotel/HotelGrid'
import { HotelFilters } from '@/components/hotel/HotelFilters'
import { HotelGridSkeleton } from '@/components/common/LoadingSkeleton'
import { Pagination } from '@/components/common/Pagination'
import { useHotels } from '@/hooks/useHotels'
import type { SearchHotelParams } from '@/types/hotel'

export function HotelListPage() {
  const [filters, setFilters] = useState<SearchHotelParams>({ page: 1, limit: 12 })
  const { data, isLoading } = useHotels(filters)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Hotels</h1>
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <HotelFilters
            filters={filters}
            onFilterChange={(f) => setFilters({ ...f, page: 1, limit: 12 } as SearchHotelParams)}
          />
        </aside>
        <div className="flex-1">
          {isLoading ? (
            <HotelGridSkeleton />
          ) : (
            <>
              <HotelGrid hotels={data?.data || []} />
              {data?.meta && (
                <div className="mt-8">
                  <Pagination
                    page={data.meta.page}
                    totalPages={data.meta.totalPages}
                    onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
