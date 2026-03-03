import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Header } from './Header'
import { Footer } from './Footer'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { userApi } from '@/api/user.api'
import { useAuthStore } from '@/stores/auth.store'
import { queryKeys } from '@/config/query-keys'

export function AppLayout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const { isAuthenticated, setUser } = useAuthStore()

  // Fetch user profile when authenticated
  const { data: userData } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const { data } = await userApi.getMe()
      return data.data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  // Sync to Zustand outside of queryFn to avoid render-cycle state updates
  useEffect(() => {
    if (userData) setUser(userData)
  }, [userData, setUser])

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
