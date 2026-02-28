import { RoomCard } from './RoomCard'
import { EmptyState } from '@/components/common/EmptyState'
import { BedDouble } from 'lucide-react'
import type { Room } from '@/types/room'

interface RoomListProps {
  rooms: Room[]
  onBook?: (room: Room) => void
}

export function RoomList({ rooms, onBook }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <EmptyState
        icon={<BedDouble className="h-12 w-12" />}
        title="No rooms available"
        description="This hotel has no rooms listed yet."
      />
    )
  }

  return (
    <div className="space-y-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onBook={onBook} />
      ))}
    </div>
  )
}
