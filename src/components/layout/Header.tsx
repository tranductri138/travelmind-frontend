import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, Moon, Sun, LogOut, User, LayoutDashboard, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { ROUTES } from '@/config/routes'

export function Header() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { toggleTheme, theme, toggleSidebar } = useUIStore()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link to={ROUTES.HOME} className="flex items-center gap-2 font-bold text-xl">
            TravelMind
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link to={ROUTES.HOTELS} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Hotels
            </Link>
            <Link to={ROUTES.SEARCH} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Search
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.CHAT)} title="AI Chat">
              <MessageSquare className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.SEARCH)}>
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(ROUTES.BOOKINGS)}>
                  My Bookings
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem onClick={() => navigate(ROUTES.ADMIN)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate(ROUTES.LOGIN)}>
                Login
              </Button>
              <Button onClick={() => navigate(ROUTES.REGISTER)}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
