import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Clock, MapPin, Mountain, Star, Users } from "lucide-react"
import { tours } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AuthService from "@/services/authService"
import { canCreateReservation } from "@/auth/privileges"
import { serviceCapacityApi, type ServiceCapacity } from "@/services/serviceCapacityApi"
import { createServiceBooking, resolveServiceId } from "@/services/bookingApi"

export default function TrekDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const trek = tours.find((item) => item.id === id && item.category === "trek")
  const [statusMessage, setStatusMessage] = useState("")
  const [bookingBusy, setBookingBusy] = useState(false)
  const [capacity, setCapacity] = useState<ServiceCapacity | null>(null)
  const [resolvedServiceId, setResolvedServiceId] = useState<number | null>(null)

  if (!trek) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">Trek not found</h1>
          <p className="mt-2 text-muted-foreground">The selected trek does not exist.</p>
          <Link to="/treks">
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

  const handleBook = async () => {
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
      setStatusMessage("Unable to create booking right now.")
      return
    }

    setBookingBusy(true)
    try {
      const bookingDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ")
      const booking = await createServiceBooking({
        token,
        serviceType: "trek",
        serviceName: trek.name,
        serviceIdHint: serviceId,
        bookingDate,
        bookingCount: 1,
        status: "pending",
        serviceDescription: trek.description,
        serviceLocation: trek.location,
        servicePrice: trek.price
      })
      setStatusMessage("Trek booking created successfully.")
      setResolvedServiceId(Number(booking.service_id))
      const data = await serviceCapacityApi.getById(Number(booking.service_id), "trek")
      setCapacity(data)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Booking failed")
    } finally {
      setBookingBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto max-w-6xl px-6">
        <Link to="/treks">
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
              <Button onClick={handleBook} disabled={bookingBusy || isServiceFull}>
                {bookingBusy ? "Booking..." : isServiceFull ? "Sold Out" : "Book Trek"}
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
