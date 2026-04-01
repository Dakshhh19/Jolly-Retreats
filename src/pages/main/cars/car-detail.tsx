import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Gauge, Users, Zap } from "lucide-react"
import { cars } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import AuthService from "@/services/authService"
import { canCreateReservation } from "@/auth/privileges"
import { serviceCapacityApi, type ServiceCapacity } from "@/services/serviceCapacityApi"
import { resolveServiceId, type ServiceBooking } from "@/services/bookingApi"
import { ServiceBookingFlow } from "@/components/services/service-booking-flow"

export default function CarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const car = cars.find((item) => item.id === id)
  const [statusMessage, setStatusMessage] = useState("")
  const [capacity, setCapacity] = useState<ServiceCapacity | null>(null)
  const [resolvedServiceId, setResolvedServiceId] = useState<number | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)

  if (!car) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">Car not found</h1>
          <p className="mt-2 text-muted-foreground">The selected car rental does not exist.</p>
          <Link to="/cars">
            <Button className="mt-6">Back to Car Rentals</Button>
          </Link>
        </div>
      </div>
    )
  }

  const serviceId = Number(car.id.replace(/\D/g, ""))

  useEffect(() => {
    let mounted = true
    const resolve = async () => {
      const id = await resolveServiceId("car", car.name, serviceId)
      if (mounted) setResolvedServiceId(id)
    }
    void resolve()
    return () => {
      mounted = false
    }
  }, [serviceId, car.name])

  useEffect(() => {
    if (!resolvedServiceId) return
    let mounted = true
    const loadCapacity = async () => {
      try {
        const data = await serviceCapacityApi.getById(resolvedServiceId, "car")
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

  const handleReserve = () => {
    setStatusMessage("")

    if (!AuthService.isAuthenticated()) {
      navigate("/login")
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
      const data = await serviceCapacityApi.getById(booking.serviceId, "car")
      setCapacity(data)
    } catch {
      // Keep the success state even if the background refresh fails.
    }
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto max-w-6xl px-6">
        <Link to="/cars">
          <Button variant="ghost" className="mb-6 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Car Rentals
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border">
            <img src={car.image} alt={car.name} className="h-[460px] w-full object-cover" />
          </div>

          <div>
            <Badge className="mb-3 uppercase">{car.type}</Badge>
            <h1 className="font-serif text-4xl font-bold text-foreground">{car.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {car.seats} seats
              </span>
              <span className="inline-flex items-center gap-1">
                <Gauge className="h-4 w-4" />
                {car.transmission === "automatic" ? "Automatic" : "Manual"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Premium Fleet
              </span>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold text-foreground">Included Features</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {car.features.map((feature) => (
                  <Badge key={feature} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <p className="mt-6 leading-relaxed text-muted-foreground">
              Drive with comfort, safety, and premium support. Reserve now to secure this vehicle for your next trip.
            </p>

            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <p>
                <span className="font-serif text-3xl font-bold text-foreground">${car.price}</span>
                <span className="text-muted-foreground"> / day</span>
              </p>
              <Button onClick={handleReserve} disabled={isServiceFull}>
                {isServiceFull ? "Sold Out" : "Rent Now"}
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
          serviceType: "car",
          serviceIdHint: serviceId,
          resolvedServiceId,
          name: car.name,
          description: `Reserve the ${car.name} with ${car.features.join(", ")}.`,
          location: "",
          price: car.price,
          priceSuffix: "/ day",
          scheduleLabel: "Pickup date",
          quantityLabel: "Vehicles",
          defaultBookingCount: 1,
          maxBookingCount: 1,
          minAdvanceDays: 1
        }}
        onBooked={(booking) => {
          void handleBooked(booking)
        }}
      />
    </div>
  )
}
