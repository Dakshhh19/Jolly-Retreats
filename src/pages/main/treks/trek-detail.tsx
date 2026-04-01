import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Clock, MapPin, Mountain, Star, Users } from "lucide-react"
import { tours } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AuthService from "@/services/authService"
import { canCreateReservation } from "@/auth/privileges"
import { serviceCapacityApi, type ServiceCapacity } from "@/services/serviceCapacityApi"
import { resolveServiceId, type ServiceBooking } from "@/services/bookingApi"
import { ROUTES } from "@/config"
import { ServiceBookingFlow } from "@/components/services/service-booking-flow"

export default function TrekDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const trek = tours.find((item) => item.id === id && item.category === "trek")
  const [statusMessage, setStatusMessage] = useState("")
  const [capacity, setCapacity] = useState<ServiceCapacity | null>(null)
  const [resolvedServiceId, setResolvedServiceId] = useState<number | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)

  if (!trek) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">Trek not found</h1>
          <p className="mt-2 text-muted-foreground">The selected trek does not exist.</p>
          <Link to={ROUTES.TREKS}>
            <Button className="mt-6">Back to Treks</Button>
          </Link>
        </div>
      </div>
    )
  }

  const serviceId = Number(trek.id.replace(/\D/g, ""))

  useEffect(() => {
    let mounted = true
    const resolve = async () => {
      const id = await resolveServiceId("trek", trek.name, serviceId)
      if (mounted) setResolvedServiceId(id)
    }
    void resolve()
    return () => {
      mounted = false
    }
  }, [serviceId, trek.name])

  useEffect(() => {
    if (!resolvedServiceId) return
    let mounted = true
    const loadCapacity = async () => {
      try {
        const data = await serviceCapacityApi.getById(resolvedServiceId, "trek")
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

  const handleBook = () => {
    setStatusMessage("")

    if (!AuthService.isAuthenticated()) {
      navigate(ROUTES.LOGIN)
      return
    }

    if (!canCreateReservation(AuthService.getUserRole())) {
      setStatusMessage("Only user accounts can create bookings.")
      return
    }
    setBookingOpen(true)
  }

  const handleBooked = async (booking: ServiceBooking) => {
    setStatusMessage(`Booking #${booking.bookingId} confirmed successfully.`)
    setResolvedServiceId(booking.serviceId)
    try {
      const data = await serviceCapacityApi.getById(booking.serviceId, "trek")
      setCapacity(data)
    } catch {
      // Keep the success state even if the background refresh fails.
    }
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto max-w-6xl px-6">
        <Link to={ROUTES.TREKS}>
          <Button variant="ghost" className="mb-6 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Treks
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border">
            <img src={trek.image} alt={trek.name} className="h-[460px] w-full object-cover" />
          </div>

          <div>
            <Badge className="mb-3 bg-card text-card-foreground">Trek Expedition</Badge>
            <h1 className="font-serif text-4xl font-bold text-foreground">{trek.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {trek.location}
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{trek.duration}</span>
              <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />Max {trek.maxGroup}</span>
              <span className="inline-flex items-center gap-1"><Mountain className="h-4 w-4" />{trek.difficulty}</span>
              <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-gold text-gold" />{trek.rating}</span>
            </div>
            <p className="mt-6 leading-relaxed text-muted-foreground">{trek.description}</p>

            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <p>
                <span className="font-serif text-3xl font-bold text-foreground">${trek.price}</span>
                <span className="text-muted-foreground"> / person</span>
              </p>
              <Button onClick={handleBook} disabled={isServiceFull}>
                {isServiceFull ? "Sold Out" : "Book Trek"}
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
      <ServiceBookingFlow
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service={{
          serviceType: "trek",
          serviceIdHint: serviceId,
          resolvedServiceId,
          name: trek.name,
          description: trek.description,
          location: trek.location,
          price: trek.price,
          priceSuffix: "/ person",
          scheduleLabel: "Travel date",
          quantityLabel: "Travelers",
          defaultBookingCount: 1,
          maxBookingCount: Math.max(1, Math.min(trek.maxGroup, capacity?.availableSlots ?? trek.maxGroup)),
          minAdvanceDays: 7
        }}
        onBooked={(booking) => {
          void handleBooked(booking)
        }}
      />
    </div>
  )
}
