import { Link } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/stores/ui.store'
import { ROUTES } from '@/config/routes'

const links = [
  { to: ROUTES.HOME, label: 'Home' },
  { to: ROUTES.HOTELS, label: 'Hotels' },
  { to: ROUTES.SEARCH, label: 'Search' },
  { to: ROUTES.BOOKINGS, label: 'My Bookings' },
  { to: ROUTES.PROFILE, label: 'Profile' },
]

export function MobileNav() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>TravelMind</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className="px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
