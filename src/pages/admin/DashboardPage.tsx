import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Hotel, CalendarDays, Users, DollarSign } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useAdmin'

export function DashboardPage() {
  const { data: stats } = useDashboardStats()

  const metrics = [
    {
      title: 'Total Hotels',
      value: stats?.totalHotels ?? 0,
      icon: Hotel,
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings ?? 0,
      icon: CalendarDays,
    },
    {
      title: 'Active Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
    },
    {
      title: 'Revenue',
      value: stats?.revenue != null
        ? `$${stats.revenue.toLocaleString()}`
        : '$0',
      icon: DollarSign,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
