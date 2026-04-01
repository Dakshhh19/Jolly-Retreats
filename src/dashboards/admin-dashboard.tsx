import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  LogOut,
  CheckCircle2,
  Settings,
  AlertTriangle,
  Activity,
  House
} from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AuthService, { type AuthUser } from '@/services/authService'
import { adminApi, type AdminBooking, type AdminInvoice, type AdminOrder, type AdminServiceCapacity } from '@/services/adminApi'
import { ROUTES } from '@/config'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

type AnalyticsData = Awaited<ReturnType<typeof adminApi.analytics.overview>>

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [orders, setOrders] = useState<AdminBooking[]>([])
  const [commerceOrders, setCommerceOrders] = useState<AdminOrder[]>([])
  const [invoices, setInvoices] = useState<AdminInvoice[]>([])
  const [services, setServices] = useState<AdminServiceCapacity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [analyticsData, bookings, servicesData, orderRows, invoiceRows] = await Promise.all([
        adminApi.analytics.overview(),
        adminApi.bookings.list(),
        adminApi.services.list({ includeClosed: true }),
        adminApi.orders.list(),
        adminApi.invoices.list()
      ])
      setAnalytics(analyticsData)
      setOrders(bookings)
      setCommerceOrders(orderRows)
      setInvoices(invoiceRows)
      setServices(servicesData.slice(0, 10))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setUser(AuthService.getCurrentUser())
    void load()
    const timer = window.setInterval(() => {
      void load()
    }, 15000)
    return () => window.clearInterval(timer)
  }, [])

  const summaryCards = useMemo(() => {
    const summary = analytics?.summary
    const dashboardOrderCount = commerceOrders.length || summary?.totalOrders || 0
    const dashboardRevenue = commerceOrders.reduce((sum, order) => sum + Number(order.grandTotal || 0), 0) || summary?.totalRevenue || 0
    return [
      {
        title: 'Total Users',
        value: summary?.totalUsers ?? 0,
        icon: Users
      },
      {
        title: 'Total Orders',
        value: dashboardOrderCount,
        icon: ShoppingCart
      },
      {
        title: 'Total Revenue',
        value: `$${dashboardRevenue.toFixed ? dashboardRevenue.toFixed(2) : dashboardRevenue}`,
        icon: DollarSign
      },
      {
        title: 'Total Products / Services',
        value: summary?.totalServices ?? 0,
        icon: Package
      },
      {
        title: 'Fully Booked Services',
        value: summary?.fullyBookedServices ?? 0,
        icon: AlertTriangle
      },
      {
        title: 'Avg Occupancy',
        value: `${summary?.averageOccupancy ?? 0}%`,
        icon: Activity
      }
    ]
  }, [analytics, commerceOrders])

  const handleLogout = async () => {
    const result = await AuthService.logout()
    toast.success(result.message)
    navigate('/login', { replace: true })
  }

  const confirmPendingOrder = async (id: number) => {
    setUpdatingOrderId(id)
    setError('')
    try {
      await adminApi.bookings.update(id, { status: 'confirmed' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm order')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const pendingOrders = orders.filter((order) => order.status === 'pending')

  return (
    <div className="min-h-screen bg-background pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground">Admin Analytics Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Operational intelligence, order pipeline, and platform controls.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" onClick={() => navigate(ROUTES.HOME)}>
              <House className="mr-2 h-4 w-4" />
              Home Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card className="p-5 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-semibold text-foreground">{user?.fullName || 'Admin'}</p>
            </div>
            <Badge className="bg-amber-600 text-white">Admin Access</Badge>
          </div>
        </Card>

        {error && (
          <Card className="p-4 border-red-300">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 font-serif text-2xl font-bold text-foreground">{card.value}</p>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Revenue Growth</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.charts.salesOverTime || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Orders Per Day</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.charts.ordersPerDay || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Management Shortcuts</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Open CRUD modules for users, services, and orders.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate('/admin/orders')}>Orders</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/users')}>Users</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/tours')}>Tours</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/treks')}>Treks</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/restaurants')}>Restaurants</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/cars')}>Cars</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/properties')}>Properties</Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Pending Requests</h2>
            </div>
            <div className="space-y-3">
              {pendingOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        User {order.userId} | {order.serviceType} #{order.serviceId} | Qty {order.bookingCount || 1} | {order.bookingDate}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={updatingOrderId === order.id}
                      onClick={() => confirmPendingOrder(order.id)}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              ))}
              {!loading && !pendingOrders.length && (
                <p className="text-sm text-muted-foreground">No pending requests.</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Top Selling Services</h2>
            <div className="space-y-3">
              {(analytics?.topServices || []).map((item) => (
                <div key={`${item.serviceType}-${item.serviceId}`} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{item.serviceName}</p>
                    <Badge variant="outline" className="uppercase">{item.serviceType}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Orders: {item.orderCount} | Revenue: ${item.revenue}
                  </p>
                </div>
              ))}
              {!loading && !(analytics?.topServices || []).length && (
                <p className="text-sm text-muted-foreground">No service sales data available.</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {commerceOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{order.orderNumber}</p>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.customerName} | Items {order.items.length} | Total ${order.grandTotal.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{String(order.createdAt).replace('T', ' ').slice(0, 19)}</p>
                </div>
              ))}
              {!loading && !commerceOrders.length && (
                <p className="text-sm text-muted-foreground">No orders found.</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Recent Invoices</h2>
            <div className="space-y-3">
              {invoices.slice(0, 6).map((invoice) => (
                <div key={invoice.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                    <Badge variant="outline">{invoice.emailStatus}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {invoice.customerName} | {invoice.orderNumber} | ${invoice.grandTotal.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{String(invoice.createdAt).replace('T', ' ').slice(0, 19)}</p>
                </div>
              ))}
              {!loading && !invoices.length && (
                <p className="text-sm text-muted-foreground">No invoices generated yet.</p>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4">Service Capacity Monitor</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={`${service.serviceType}-${service.id}`} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{service.serviceName}</p>
                  <Badge
                    className={
                      service.status === 'full'
                        ? 'bg-red-600 text-white'
                        : service.status === 'limited'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                    }
                  >
                    {service.status === 'limited' ? 'Limited Slots' : service.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Capacity: {service.maxCapacity} | Booked: {service.currentBookings} | Remaining: {service.availableSlots}
                </p>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${
                      service.status === 'full'
                        ? 'bg-red-500'
                        : service.status === 'limited'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, service.occupancyRate))}%` }}
                  />
                </div>
              </div>
            ))}
            {!loading && !services.length && (
              <p className="text-sm text-muted-foreground">No service capacity data available.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-foreground">Privilege Flow Map</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Users create reservations. Admins monitor analytics, manage users/services/orders, and control system operations.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {['User Login', 'Browse Services', 'Create Order', 'Order Status Updates', 'Analytics & Controls'].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-md border border-border bg-muted px-3 py-1.5 font-medium text-foreground">
                  {step}
                </span>
                {index < 4 && <span className="text-muted-foreground">-&gt;</span>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
