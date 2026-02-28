import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/common/StarRating'

interface HotelFiltersProps {
  filters: {
    minPrice?: number
    maxPrice?: number
    rating?: number
    sort?: string
  }
  onFilterChange: (filters: Record<string, unknown>) => void
}

export function HotelFilters({ filters, onFilterChange }: HotelFiltersProps) {
  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <h3 className="font-semibold">Filters</h3>

      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange({ ...filters, minPrice: Number(e.target.value) || undefined })}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange({ ...filters, maxPrice: Number(e.target.value) || undefined })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Minimum Rating</Label>
        <StarRating
          rating={filters.rating || 0}
          interactive
          onChange={(rating) => onFilterChange({ ...filters, rating })}
        />
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={filters.sort || 'rating:desc'}
          onValueChange={(sort) => onFilterChange({ ...filters, sort })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating:desc">Highest Rated</SelectItem>
            <SelectItem value="priceMin:asc">Price: Low to High</SelectItem>
            <SelectItem value="priceMin:desc">Price: High to Low</SelectItem>
            <SelectItem value="createdAt:desc">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => onFilterChange({})}
      >
        Clear Filters
      </Button>
    </div>
  )
}
