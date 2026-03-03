import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useHotelDetail, useCreateHotel, useUpdateHotel } from '@/hooks/useHotels'
import { hotelApi } from '@/api/hotel.api'
import { createHotelSchema, type CreateHotelInput } from '@/lib/validators'
import { ROUTES } from '@/config/routes'
import { toast } from 'sonner'
import { Upload, X, ImageIcon } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

const AMENITY_OPTIONS = ['wifi', 'pool', 'gym', 'spa', 'restaurant', 'bar', 'parking', 'beach', 'airport_shuttle', 'room_service']

export function HotelFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: hotel } = useHotelDetail(id || '')
  const createHotel = useCreateHotel()
  const updateHotel = useUpdateHotel()

  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)

  // Populate images and amenities when editing
  useEffect(() => {
    if (isEdit && hotel && !initialized) {
      if (hotel.images?.length) setImageUrls(hotel.images)
      if (hotel.amenities?.length) setSelectedAmenities(hotel.amenities)
      setInitialized(true)
    }
  }, [isEdit, hotel, initialized])

  const { register, handleSubmit, formState: { errors } } = useForm<CreateHotelInput>({
    resolver: zodResolver(createHotelSchema),
    values: isEdit && hotel ? {
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      stars: hotel.stars,
    } : undefined,
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    try {
      const { data } = await hotelApi.uploadImages(Array.from(files))
      setImageUrls((prev) => [...prev, ...data.data])
      toast.success(`${files.length} image(s) uploaded`)
    } catch {
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity],
    )
  }

  const onSubmit = async (data: CreateHotelInput) => {
    const payload = { ...data, images: imageUrls, amenities: selectedAmenities }
    if (isEdit) {
      await updateHotel.mutateAsync({ id: id!, data: payload })
      toast.success('Hotel updated')
    } else {
      await createHotel.mutateAsync(payload)
      toast.success('Hotel created')
    }
    navigate(ROUTES.ADMIN_HOTELS)
  }

  const isPending = createHotel.isPending || updateHotel.isPending

  const getImageSrc = (url: string) => {
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{isEdit ? 'Edit Hotel' : 'New Hotel'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hotel Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register('address')} />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register('country')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" type="number" step="any" {...register('latitude', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" type="number" step="any" {...register('longitude', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stars">Stars (1-5)</Label>
              <Input id="stars" type="number" min={1} max={5} {...register('stars', { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border">
                    <img src={getImageSrc(url)} alt={`Hotel ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imageUrls.length === 0 && (
              <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg text-muted-foreground">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No images uploaded</p>
                </div>
              </div>
            )}

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Images'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">Max 5MB per file. JPG, PNG, WebP.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedAmenities.includes(amenity)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : isEdit ? 'Update Hotel' : 'Create Hotel'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ADMIN_HOTELS)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
