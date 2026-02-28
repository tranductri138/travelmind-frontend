import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">TravelMind</h3>
            <p className="text-sm text-muted-foreground">
              Smart travel platform powered by AI. Find the perfect hotel for your next adventure.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={ROUTES.HOME} className="hover:text-foreground">Home</Link></li>
              <li><Link to={ROUTES.HOTELS} className="hover:text-foreground">Hotels</Link></li>
              <li><Link to={ROUTES.SEARCH} className="hover:text-foreground">Search</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={ROUTES.LOGIN} className="hover:text-foreground">Login</Link></li>
              <li><Link to={ROUTES.REGISTER} className="hover:text-foreground">Register</Link></li>
              <li><Link to={ROUTES.BOOKINGS} className="hover:text-foreground">My Bookings</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TravelMind. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
