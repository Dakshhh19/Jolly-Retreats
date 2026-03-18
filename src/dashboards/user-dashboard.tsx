import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Utensils, Car, Compass, Tent, User as UserIcon, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AuthService from '@/services/authService'

export default function UserDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [bookings, setBookings] = useState<any[]>([])
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)

    const loadBookings = async () => {
      try {
        const token = AuthService.getToken()
        if (!token) return
        const response = await fetch('http://localhost:5000/api/bookings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const payload = await response.json()
        if (response.ok && payload.success) {
          setBookings(payload.data || [])
        } else {
          setBookingError(payload.message || 'Unable to load bookings')
        }
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

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out?')
    if (!confirmed) return

    AuthService.logout()
    navigate('/')
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
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
          <h1 className="font-serif text-4xl font-bold text-foreground">Welcome back, {user?.fullName}! 👋</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore amazing destinations and plan your next adventure
          </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Quick Stats */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h2 className="font-semibold text-lg text-foreground mb-4">Your Journeys Await</h2>
              <p className="text-muted-foreground mb-6">
                Discover incredible experiences across the globe. From mountain treks to culinary adventures, we have everything you need for your perfect getaway.
              </p>
              <Link to="/tours">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Exploring
                </Button>
              </Link>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Link key={feature.href} to={feature.href}>
                    <Card className="p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer">
                      <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg text-foreground">{feature.label}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {/* Plan Your Stay */}
            <Card className="p-8 border-dashed border-2 border-primary/30">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">Plan Your Next Getaway</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Browse our curated collection of tours, treks, restaurants, and accommodations. Mix and match to create your perfect trip.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
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
              <h3 className="font-serif text-2xl font-bold text-foreground mb-2">My Activity</h3>
              <p className="text-sm text-muted-foreground mb-6">Your recent bookings and reservation statuses.</p>
              {bookingError && <p className="mb-4 text-sm text-red-500">{bookingError}</p>}
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="rounded-lg border border-border p-4">
                    <p className="font-medium text-foreground">
                      {booking.service_type} #{booking.service_id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Date: {booking.booking_date} | Qty: {booking.booking_count || 1}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {booking.status}
                    </p>
                  </div>
                ))}
                {!bookings.length && (
                  <p className="text-sm text-muted-foreground">No bookings found yet.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-serif text-2xl font-bold text-foreground">{user?.fullName}</h2>
                  <p className="text-muted-foreground mt-1">Personal Account</p>
                </div>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-foreground font-semibold mt-1">{user?.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <p className="text-foreground font-semibold mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                    <p className="text-foreground font-semibold mt-1">{user?.contactNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                    <p className="text-foreground font-semibold mt-1 capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Account Information</p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Your personal information is kept secure and encrypted</p>
                  <p>• You can update your profile information anytime</p>
                  <p>• Contact our support team for account changes</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
