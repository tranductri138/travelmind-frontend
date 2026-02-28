import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useHotelDetail } from '@/hooks/useHotels'
import { useRoomsByHotel, useCreateRoom, useDeleteRoom } from '@/hooks/useRooms'
import { ROUTES } from '@/config/routes'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowLeft, DollarSign, Users, BedDouble } from 'lucide-react'

const ROOM_TYPES = ['standard', 'deluxe', 'suite', 'villa', 'penthouse', 'family', 'single', 'double']

export function RoomManagePage() {
  const { id: hotelId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: hotel } = useHotelDetail(hotelId || '')
  const { data: rooms, isLoading } = useRoomsByHotel(hotelId || '')
  const createRoom = useCreateRoom(hotelId || '')
  const deleteRoom = useDeleteRoom(hotelId || '')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'standard',
    price: '',
    maxGuests: '2',
    amenities: '' as string,
  })

  const handleCreate = async () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required')
      return
    }
    try {
      await createRoom.mutateAsync({
        name: form.name,
        description: form.description || undefined,
        type: form.type,
        price: parseFloat(form.price),
        maxGuests: parseInt(form.maxGuests) || 2,
        amenities: form.amenities ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean) : [],
      })
      toast.success('Room created')
      setDialogOpen(false)
      setForm({ name: '', description: '', type: 'standard', price: '', maxGuests: '2', amenities: '' })
    } catch {
      toast.error('Failed to create room')
    }
  }

  const handleDelete = async (roomId: string, roomName: string) => {
    if (!confirm(`Delete room "${roomName}"?`)) return
    try {
      await deleteRoom.mutateAsync(roomId)
      toast.success('Room deleted')
    } catch {
      toast.error('Failed to delete room')
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.ADMIN_HOTELS)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Rooms</h1>
          {hotel && <p className="text-muted-foreground">{hotel.name}</p>}
        </div>
        <div className="ml-auto">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Room Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Deluxe Ocean View"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Room description..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price (USD/night) *</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="150"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Guests</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={form.maxGuests}
                      onChange={(e) => setForm({ ...form, maxGuests: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amenities</Label>
                    <Input
                      value={form.amenities}
                      onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                      placeholder="wifi, minibar, TV"
                    />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={createRoom.isPending} className="w-full">
                  {createRoom.isPending ? 'Creating...' : 'Create Room'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading rooms...</p>
      ) : !rooms?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BedDouble className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No rooms yet</p>
            <p className="text-sm text-muted-foreground mb-4">Add rooms to this hotel</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardContent className="flex items-center gap-6 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{room.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {room.type}
                    </span>
                  </div>
                  {room.description && (
                    <p className="text-sm text-muted-foreground truncate">{room.description}</p>
                  )}
                  {room.amenities?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {room.amenities.map((a) => (
                        <span key={a} className="text-xs px-1.5 py-0.5 rounded bg-muted">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{room.price}</span>
                    <span className="text-muted-foreground">/night</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{room.maxGuests}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(room.id, room.name)}
                    disabled={deleteRoom.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
