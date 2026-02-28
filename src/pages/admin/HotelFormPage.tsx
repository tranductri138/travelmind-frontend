import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useHotelDetail, useCreateHotel, useUpdateHotel } from '@/hooks/useHotels'
import { createHotelSchema, type CreateHotelInput } from '@/lib/validators'
import { ROUTES } from '@/config/routes'
import { toast } from 'sonner'

export function HotelFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: hotel } = useHotelDetail(id || '')
  const createHotel = useCreateHotel()
  const updateHotel = useUpdateHotel()

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

  const onSubmit = async (data: CreateHotelInput) => {
    if (isEdit) {
      await updateHotel.mutateAsync({ id: id!, data })
      toast.success('Hotel updated')
    } else {
      await createHotel.mutateAsync(data)
      toast.success('Hotel created')
    }
    navigate(ROUTES.ADMIN_HOTELS)
  }

  const isPending = createHotel.isPending || updateHotel.isPending

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{isEdit ? 'Edit Hotel' : 'New Hotel'}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Hotel Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : isEdit ? 'Update Hotel' : 'Create Hotel'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ADMIN_HOTELS)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
