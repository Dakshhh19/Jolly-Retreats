import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Clock, MapPin, Star } from "lucide-react"
import { restaurants } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AuthService from "@/services/authService"
import { canCreateReservation } from "@/auth/privileges"
import { serviceCapacityApi, type ServiceCapacity } from "@/services/serviceCapacityApi"
import { createServiceBooking, resolveServiceId } from "@/services/bookingApi"

export default function RestaurantDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const restaurant = restaurants.find((item) => item.id === id)
  const [statusMessage, setStatusMessage] = useState("")
  const [bookingBusy, setBookingBusy] = useState(false)
  const [capacity, setCapacity] = useState<ServiceCapacity | null>(null)
  const [resolvedServiceId, setResolvedServiceId] = useState<number | null>(null)

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">Restaurant not found</h1>
          <p className="mt-2 text-muted-foreground">The selected restaurant does not exist.</p>
          <Link to="/restaurants">
            <Button className="mt-6">Back to Restaurants</Button>
          </Link>
        </div>
      </div>
    )
  }

  const serviceId = Number(restaurant.id.replace(/\D/g, ""))

  useEffect(() => {
    let mounted = true
    const resolve = async () => {
      const id = await resolveServiceId("restaurant", restaurant.name, serviceId)
      if (mounted) setResolvedServiceId(id)
    }
    void resolve()
    return () => {
      mounted = false
    }
  }, [serviceId, restaurant.name])

  useEffect(() => {
    if (!resolvedServiceId) return
    let mounted = true
    const loadCapacity = async () => {
      try {
        const data = await serviceCapacityApi.getById(resolvedServiceId, "restaurant")
        if (mounted) setCapacity(data)
      } catch {
        // ignore capacity fetch errors for UI fallback
      }
    }
    void loadCapacity()
    const timer = window.setInterval(loadCapacity, 15000)
    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [resolvedServiceId])

  const isServiceFull = capacity?.status === "full" || capacity?.status === "closed" || (capacity?.availableSlots ?? 1) <= 0

  const handleReserve = async () => {
    setStatusMessage("")

    if (!AuthService.isAuthenticated()) {
      navigate("/login")
      return
    }

    if (!canCreateReservation(AuthService.getUserRole())) {
      setStatusMessage("Only user accounts can create bookings.")
      return
    }

    const token = AuthService.getToken()
    if (!token || !serviceId) {
      setStatusMessage("Unable to create reservation right now.")
      return
    }

    setBookingBusy(true)
    try {
      const bookingDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ")
      const booking = await createServiceBooking({
        token,
        serviceType: "restaurant",
        serviceName: restaurant.name,
        serviceIdHint: serviceId,
        bookingDate,
        bookingCount: 1,
        status: "pending",
        serviceDescription: restaurant.description,
        serviceLocation: restaurant.location
      })
      setStatusMessage("Table reservation created successfully.")
      setResolvedServiceId(Number(booking.service_id))
      const data = await serviceCapacityApi.getById(Number(booking.service_id), "restaurant")
      setCapacity(data)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Reservation failed")
    } finally {
      setBookingBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto max-w-6xl px-6">
        <Link to="/restaurants">
          <Button variant="ghost" className="mb-6 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Restaurants
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border">
            <img src={restaurant.image} alt={restaurant.name} className="h-[460px] w-full object-cover" />
          </div>

          <div>
            <Badge className="mb-3">{restaurant.cuisine}</Badge>
            <h1 className="font-serif text-4xl font-bold text-foreground">{restaurant.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {restaurant.location}
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{restaurant.openHours}</span>
              <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-gold text-gold" />{restaurant.rating}</span>
              <Badge variant="secondary">{restaurant.priceRange}</Badge>
            </div>
            <p className="mt-6 leading-relaxed text-muted-foreground">{restaurant.description}</p>

            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <p className="font-semibold text-foreground">{restaurant.cuisine}</p>
              <Button onClick={handleReserve} disabled={bookingBusy || isServiceFull}>
                {bookingBusy ? "Reserving..." : isServiceFull ? "Sold Out" : "Reserve Table"}
              </Button>
            </div>
            {capacity && (
              <div className="mt-3 rounded-lg border border-border p-3 text-sm">
                <p className="font-medium text-foreground">
                  Capacity: {capacity.currentBookings}/{capacity.maxCapacity} | Remaining: {capacity.availableSlots}
                </p>
                <p className="text-muted-foreground capitalize">
                  Status: {capacity.status === "limited" ? "Limited Slots" : capacity.status}
                </p>
              </div>
            )}
            {statusMessage && <p className="mt-3 text-sm text-muted-foreground">{statusMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
