import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { HotelGallery } from '@/components/hotel/HotelGallery'
import { HotelMap } from '@/components/hotel/HotelMap'
import { AmenityBadge } from '@/components/hotel/AmenityBadge'
import { RoomList } from '@/components/room/RoomList'
import { ReviewList } from '@/components/review/ReviewList'
import { ReviewStats } from '@/components/review/ReviewStats'
import { HotelCardSkeleton } from '@/components/common/LoadingSkeleton'
import { PriceTag } from '@/components/common/PriceTag'
import { useHotelDetail } from '@/hooks/useHotels'
import { useRoomsByHotel } from '@/hooks/useRooms'
import { useReviewsByHotel } from '@/hooks/useReviews'
import { hotelBookPath } from '@/config/routes'
import { useAuthStore } from '@/stores/auth.store'

export function HotelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [reviewPage, setReviewPage] = useState(1)

  const { data: hotel, isLoading } = useHotelDetail(id!)
  const { data: rooms } = useRoomsByHotel(id!)
  const { data: reviewsData } = useReviewsByHotel(id!, { page: reviewPage, limit: 5 })

  if (isLoading) return <div className="container mx-auto px-4 py-8"><HotelCardSkeleton /></div>
  if (!hotel) return <div className="container mx-auto px-4 py-8">Hotel not found</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <HotelGallery images={hotel.images} hotelName={hotel.name} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{hotel.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {hotel.address}, {hotel.city}, {hotel.country}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {hotel.rating.toFixed(1)} ({hotel.reviewCount} reviews)
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-muted-foreground">{hotel.description}</p>
          </div>

          {hotel.amenities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((a) => <AmenityBadge key={a} amenity={a} />)}
              </div>
            </div>
          )}

          <Separator />

          <Tabs defaultValue="rooms">
            <TabsList>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>
            <TabsContent value="rooms" className="mt-4">
              <RoomList
                rooms={rooms || []}
                onBook={(room) => {
                  if (isAuthenticated) {
                    navigate(hotelBookPath(hotel.id), { state: { room } })
                  } else {
                    navigate('/login')
                  }
                }}
              />
            </TabsContent>
            <TabsContent value="reviews" className="mt-4 space-y-6">
              {reviewsData && reviewsData.data.length > 0 && (
                <ReviewStats
                  stats={{
                    averageRating: hotel.rating,
                    totalReviews: hotel.reviewCount,
                    distribution: {},
                  }}
                />
              )}
              <ReviewList
                reviews={reviewsData?.data || []}
                page={reviewPage}
                totalPages={reviewsData?.meta?.totalPages || 1}
                onPageChange={setReviewPage}
              />
            </TabsContent>
            <TabsContent value="map" className="mt-4">
              <HotelMap latitude={hotel.latitude} longitude={hotel.longitude} name={hotel.name} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <div className="sticky top-20 border rounded-lg p-6 space-y-4">
            <PriceTag price={hotel.priceMin} className="text-2xl" />
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                if (isAuthenticated) navigate(hotelBookPath(hotel.id))
                else navigate('/login')
              }}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
