import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, BedDouble } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Pagination } from '@/components/common/Pagination'
import { TableSkeleton } from '@/components/common/LoadingSkeleton'
import { useHotels, useDeleteHotel } from '@/hooks/useHotels'
import { adminHotelEditPath, adminHotelRoomsPath, ROUTES } from '@/config/routes'
import { formatCurrency } from '@/lib/format'

export function HotelManagePage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useHotels({ page, limit: 10 })
  const deleteHotel = useDeleteHotel()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Hotels</h1>
        <Link to={ROUTES.ADMIN_HOTEL_NEW}>
          <Button><Plus className="h-4 w-4 mr-2" /> Add Hotel</Button>
        </Link>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Min Price</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell className="font-medium">{hotel.name}</TableCell>
                  <TableCell>{hotel.city}, {hotel.country}</TableCell>
                  <TableCell>{hotel.rating.toFixed(1)}</TableCell>
                  <TableCell>{hotel.priceMin ? formatCurrency(hotel.priceMin) : '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link to={adminHotelRoomsPath(hotel.id)} title="Manage Rooms">
                        <Button variant="ghost" size="icon"><BedDouble className="h-4 w-4" /></Button>
                      </Link>
                      <Link to={adminHotelEditPath(hotel.id)} title="Edit Hotel">
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {hotel.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This will soft-delete the hotel.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteHotel.mutate(hotel.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data?.meta && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  )
}
