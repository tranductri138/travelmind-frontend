# Context: UI, Routing & Build

## Routing (`src/App.tsx`)
```
AppLayout (Header + Footer + Sidebar)
├── / (HomePage)
├── /hotels (HotelListPage)
├── /hotels/:id (HotelDetailPage)
├── /search (SearchResultsPage)
├── /login, /register
└── ProtectedRoute (isAuthenticated)
    ├── /hotels/:id/book (BookingPage)
    ├── /bookings (MyBookingsPage)
    ├── /bookings/:id (BookingDetailPage)
    ├── /profile (ProfilePage)
    ├── /reviews/write/:bookingId (WriteReviewPage)
    ├── /chat (ChatPage)
    └── RoleGuard(['ADMIN'])
        ├── /admin (DashboardPage)
        ├── /admin/hotels (HotelManagePage)
        ├── /admin/hotels/new, /admin/hotels/:id/edit (HotelFormPage)
        ├── /admin/bookings (BookingManagePage)
        └── /admin/crawler (CrawlerPage)
```

Routes tập trung tại `src/config/routes.ts` (ROUTES.* constants + path generators).

## shadcn/ui (`src/components/ui/`)
- **KHÔNG sửa trực tiếp** — luôn dùng `npx shadcn@latest add <component>`
- 23 components: alert-dialog, avatar, badge, button, calendar, card, checkbox, command, dialog, dropdown-menu, input, label, popover, radio-group, scroll-area, select, separator, sheet, skeleton, switch, table, tabs, textarea
- Import `cn` từ `@/lib/cn` (clsx + tailwind-merge)

## Styling
```ts
cn("base-class", condition && "conditional", variant === 'x' && "variant-class")
// tailwind-merge giải quyết conflict: cn("p-4", "p-8") → "p-8"
```

## Layout components (`src/components/layout/`)
- `AppLayout` — Outlet wrapper, render Header + Footer, Sidebar khi admin
- `Header` — nav, user menu (avatar dropdown), theme toggle
- `Sidebar` — admin sidebar với nav links
- `MobileNav` — bottom nav cho mobile

## Zustand UI store (`src/stores/ui.store.ts`)
```ts
{ theme: 'light'|'dark', sidebarOpen: boolean }
// toggleTheme() → toggle class 'dark' trên document.documentElement + persist localStorage
```

## Build
- `tsc -p tsconfig.app.json --noEmit` (KHÔNG dùng `tsc -b`)
- `manualChunks` trong `vite.config.ts` → 8 vendor chunks (react, router, query, radix, leaflet, etc.)
- Docker: node:20-alpine build → nginx:alpine serve
- nginx.conf: `try_files $uri /index.html` (SPA fallback) + proxy `/api` → backend

## Common components (`src/components/common/`)
- `ErrorBoundary` — bắt lỗi render, không crash toàn app
- `Pagination` — nhận `page, totalPages, onPageChange`
- `EmptyState` — icon + message khi không có data
- `StarRating` — display/interactive rating
- `PriceTag` — format currency
- `ImageWithFallback` — img với fallback src
- `LoadingSkeleton` — skeleton placeholder

## Form pattern
```ts
const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),   // Zod validate on submit
})
// Schemas định nghĩa tại src/lib/validators.ts
```
