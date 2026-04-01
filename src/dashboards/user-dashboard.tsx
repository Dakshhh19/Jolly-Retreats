import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Utensils, Car, Compass, Tent, User as UserIcon, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AuthService, { type AuthUser } from '@/services/authService'
import { getApiBaseUrl } from '@/lib/api-base'

const API_BASE = getApiBaseUrl('/api')

type ActivityItem = {
  id: string
  title: string
  subtitle: string
  status: string
  createdAt: string
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [bookings, setBookings] = useState<ActivityItem[]>([])
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)

    const loadBookings = async () => {
      try {
        const token = AuthService.getToken()
        if (!token) return
        setBookingError('')

        const headers = {
          Authorization: `Bearer ${token}`
        }

        const [serviceResponse, tourResponse] = await Promise.all([
          fetch(`${API_BASE}/bookings`, { headers }),
          fetch(`${API_BASE}/tour-bookings`, { headers })
        ])

        const [servicePayload, tourPayload] = await Promise.all([
          serviceResponse.json(),
          tourResponse.json()
        ])

        if (!serviceResponse.ok || !servicePayload.success) {
          throw new Error(servicePayload.message || 'Unable to load service bookings')
        }
        if (!tourResponse.ok || !tourPayload.success) {
          throw new Error(tourPayload.message || 'Unable to load tour bookings')
        }

        const serviceActivities = (servicePayload.data || []).map((booking: any) => ({
          id: `service-${booking.id}`,
          title: booking.service_name || `${booking.service_type} #${booking.service_id}`,
          subtitle: `Date: ${booking.booking_date} | Qty: ${booking.booking_count || 1}`,
          status: booking.status,
          createdAt: booking.created_at || booking.booking_date || ''
        }))

        const tourActivities = (tourPayload.data || []).map((booking: any) => ({
          id: `tour-${booking.booking_id}`,
          title: booking.tour_title || `Tour #${booking.tour_id}`,
          subtitle: `Travel: ${booking.start_date} to ${booking.end_date} | Travelers: ${booking.total_people}`,
          status: booking.booking_status,
          createdAt: booking.created_at || booking.start_date || ''
        }))

        setBookings(
          [...tourActivities, ...serviceActivities].sort((left, right) =>
            String(right.createdAt).localeCompare(String(left.createdAt))
          )
        )
      } catch {
        setBookingError('Unable to load bookings')
      }
    }

    void loadBookings()
    const timer = window.setInterval(() => {
      void loadBookings()
    }, 15000)

    return () => window.clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    const result = await AuthService.logout()
    toast.success(result.message)
    navigate('/login', { replace: true })
  }

  const features = [
    {
      icon: Compass,
      label: 'Tours',
      description: 'Explore guided sightseeing tours',
      href: '/tours',
      color: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      icon: Tent,
      label: 'Treks',
      description: 'Adventure trekking expeditions',
      href: '/treks',
      color: 'bg-green-100 dark:bg-green-900'
    },
    {
      icon: Utensils,
      label: 'Restaurants',
      description: 'Culinary dining experiences',
      href: '/restaurants',
      color: 'bg-orange-100 dark:bg-orange-900'
    },
    {
      icon: Car,
      label: 'Car Rentals',
      description: 'Premium vehicle rentals',
      href: '/car-rentals',
      color: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      icon: MapPin,
      label: 'Properties',
      description: 'Browse accommodations',
      href: '/properties',
      color: 'bg-pink-100 dark:bg-pink-900'
    }
  ]

  return (
    <div className="min-h-screen bg-background pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground">Welcome back, {user?.fullName}!</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Explore amazing destinations and plan your next adventure.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Your Journeys Await</h2>
              <p className="mb-6 text-muted-foreground">
                Discover incredible experiences across the globe. From mountain treks to culinary adventures, we have everything you need for your perfect getaway.
              </p>
              <Link to="/tours">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Exploring
                </Button>
              </Link>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Link key={feature.href} to={feature.href}>
                    <Card className="h-full cursor-pointer p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{feature.label}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                    </Card>
                  </Link>
                )
              })}
            </div>

            <Card className="border-2 border-dashed border-primary/30 p-8">
              <div className="text-center">
                <MapPin className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 font-serif text-2xl font-bold text-foreground">Plan Your Next Getaway</h3>
                <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
                  Browse our curated collection of tours, treks, restaurants, and accommodations. Mix and match to create your perfect trip.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/tours">
                    <Button variant="outline">Browse Tours</Button>
                  </Link>
                  <Link to="/properties">
                    <Button variant="outline">View Stays</Button>
                  </Link>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="mb-2 font-serif text-2xl font-bold text-foreground">My Activity</h3>
              <p className="mb-6 text-sm text-muted-foreground">Your recent bookings and reservation statuses.</p>
              {bookingError && <p className="mb-4 text-sm text-red-500">{bookingError}</p>}
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="rounded-lg border border-border p-4">
                    <p className="font-medium text-foreground">{booking.title}</p>
                    <p className="text-sm text-muted-foreground">{booking.subtitle}</p>
                    <p className="text-sm text-muted-foreground">Status: {booking.status}</p>
                  </div>
                ))}
                {!bookings.length && (
                  <p className="text-sm text-muted-foreground">No bookings found yet.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="p-8">
              <div className="mb-8 flex items-start gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-serif text-2xl font-bold text-foreground">{user?.fullName}</h2>
                  <p className="mt-1 text-muted-foreground">Personal Account</p>
                </div>
              </div>

              <div className="max-w-2xl space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="mt-1 font-semibold text-foreground">{user?.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <p className="mt-1 font-semibold text-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="mt-1 font-semibold text-foreground">{user?.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                    <p className="mt-1 font-semibold text-foreground">{user?.contactNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                    <p className="mt-1 font-semibold capitalize text-foreground">{user?.role}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-border pt-8">
                <p className="mb-4 text-sm text-muted-foreground">Account Information</p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Your personal information is kept secure and encrypted.</p>
                  <p>You can update your profile information anytime.</p>
                  <p>Contact our support team for account changes.</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
