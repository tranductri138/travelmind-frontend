import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Hotel, CalendarDays, Bug } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ROUTES } from '@/config/routes'

const adminLinks = [
  { to: ROUTES.ADMIN, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.ADMIN_HOTELS, label: 'Hotels', icon: Hotel },
  { to: ROUTES.ADMIN_BOOKINGS, label: 'Bookings', icon: CalendarDays },
  { to: ROUTES.ADMIN_CRAWLER, label: 'Crawler', icon: Bug },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar min-h-[calc(100vh-4rem)]">
      <nav className="flex flex-col gap-1 p-4">
        {adminLinks.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
