import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export function AppLayout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MobileNav />
      <div className="flex flex-1">
        {isAdmin && <Sidebar />}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      {!isAdmin && <Footer />}
    </div>
  )
}
