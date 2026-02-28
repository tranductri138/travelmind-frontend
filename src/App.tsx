import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

// Public pages
import { HomePage } from '@/pages/public/HomePage'
import { HotelListPage } from '@/pages/public/HotelListPage'
import { HotelDetailPage } from '@/pages/public/HotelDetailPage'
import { SearchResultsPage } from '@/pages/public/SearchResultsPage'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'

// User pages
import { BookingPage } from '@/pages/user/BookingPage'
import { MyBookingsPage } from '@/pages/user/MyBookingsPage'
import { BookingDetailPage } from '@/pages/user/BookingDetailPage'
import { ProfilePage } from '@/pages/user/ProfilePage'
import { WriteReviewPage } from '@/pages/user/WriteReviewPage'
import { ChatPage } from '@/pages/user/ChatPage'

// Admin pages
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { HotelManagePage } from '@/pages/admin/HotelManagePage'
import { HotelFormPage } from '@/pages/admin/HotelFormPage'
import { BookingManagePage } from '@/pages/admin/BookingManagePage'
import { CrawlerPage } from '@/pages/admin/CrawlerPage'
import { RoomManagePage } from '@/pages/admin/RoomManagePage'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/hotels" element={<HotelListPage />} />
            <Route path="/hotels/:id" element={<HotelDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/hotels/:id/book" element={<BookingPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/bookings/:id" element={<BookingDetailPage />} />
              <Route path="/bookings/:id/review" element={<WriteReviewPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/hotels" element={<HotelManagePage />} />
                <Route path="/admin/hotels/new" element={<HotelFormPage />} />
                <Route path="/admin/hotels/:id/edit" element={<HotelFormPage />} />
                <Route path="/admin/hotels/:id/rooms" element={<RoomManagePage />} />
                <Route path="/admin/bookings" element={<BookingManagePage />} />
                <Route path="/admin/crawler" element={<CrawlerPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
