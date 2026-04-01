import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CalendarRange, Clock, MapPin, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AuthService from "@/services/authService"
import { canCreateReservation } from "@/auth/privileges"
import { TourBookingFlow } from "@/components/tours/tour-booking-flow"
import { tourBookingApi, type PublicTour } from "@/services/tourBookingApi"

export default function TourDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const [tour, setTour] = useState<PublicTour | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState("")
  const [bookingOpen, setBookingOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadTour = async () => {
      try {
        const data = await tourBookingApi.getTour(id)
        if (mounted) setTour(data)
      } catch (error) {
        if (mounted) setStatusMessage(error instanceof Error ? error.message : "Unable to load this tour.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void loadTour()
    return () => {
      mounted = false
    }
  }, [id])

  const handleBook = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-10">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm text-muted-foreground">Loading tour details...</p>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">Tour not found</h1>
          <p className="mt-2 text-muted-foreground">{statusMessage || "The selected tour does not exist."}</p>
          <Link to="/tours">
            <Button className="mt-6">Back to Tours</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isServiceFull = tour.availability.serviceStatus === "full" || tour.availability.serviceStatus === "closed" || tour.availability.availableSlots <= 0
  const formatAvailabilityDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
      ? new Date(`${value}T00:00:00`).toLocaleDateString()
      : 'Date unavailable'

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto max-w-6xl px-6">
        <Link to="/tours">
          <Button variant="ghost" className="mb-6 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tours
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border">
            <img src={tour.image} alt={tour.name} className="h-[460px] w-full object-cover" />
          </div>

          <div>
            <Badge className="mb-3">
              {tour.category === "hiking" ? "Hiking" : "Sightseeing"}
            </Badge>
            <h1 className="font-serif text-4xl font-bold text-foreground">{tour.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {tour.location}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{tour.duration}</span>
              <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />Max {tour.maxGroup}</span>
              <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-gold text-gold" />{tour.rating}</span>
            </div>
            <p className="mt-6 leading-relaxed text-muted-foreground">{tour.description}</p>

            <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4 text-sm">
              <div className="flex items-start gap-3">
                <CalendarRange className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Available travel window</p>
                  <p className="mt-1 text-muted-foreground">
                    This tour is available between {formatAvailabilityDate(tour.availability.minStartDate)} and {formatAvailabilityDate(tour.availability.maxEndDate)}.
                  </p>
                  <p className="mt-2 text-muted-foreground">Remaining seats: {tour.availability.availableSlots}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <p>
                <span className="font-serif text-3xl font-bold text-foreground">${tour.price}</span>
                <span className="text-muted-foreground"> / person</span>
              </p>
              <Button onClick={handleBook} disabled={isServiceFull}>
                {isServiceFull ? "Sold Out" : "Book Tour"}
              </Button>
            </div>
            {statusMessage && <p className="mt-3 text-sm text-muted-foreground">{statusMessage}</p>}
          </div>
        </div>
      </div>

      <TourBookingFlow
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        tour={tour}
        onBooked={(booking) => {
          setStatusMessage(`Booking ${booking.bookingId} confirmed successfully.`)
          void (async () => {
            try {
              const refreshedTour = await tourBookingApi.getTour(String(booking.tourId))
              setTour(refreshedTour)
            } catch {
              // Keep the success state even if the background refresh fails.
            }
          })()
        }}
      />
    </div>
  )
}
