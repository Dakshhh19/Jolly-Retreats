import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { properties } from "@/lib/mock-data"
import AuthService from "@/services/authService"
import { canCreateReservation } from "@/auth/privileges"
import { serviceCapacityApi, type ServiceCapacity } from "@/services/serviceCapacityApi"
import { ArrowLeft, Bath, Bed, Box, Check, MapPin, Star, Users } from "lucide-react"

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const userRole = AuthService.getUserRole()
  const canReserve = canCreateReservation(userRole)
  const property = properties.find((item) => item.id === id)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [capacity, setCapacity] = useState<ServiceCapacity | null>(null)
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    if (!property) {
      setSelectedImage(null)
      return
    }
    setSelectedImage(property.images[0] || property.image)
  }, [property])

  const serviceId = property ? Number(property.id.replace(/\D/g, "")) : 0

  useEffect(() => {
    if (!serviceId) return
    let mounted = true
    const loadCapacity = async () => {
      try {
        const data = await serviceCapacityApi.getById(serviceId, "property")
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
  }, [serviceId])

  if (!property) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <Box className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">Property not found</h1>
          <p className="mt-2 text-muted-foreground">
            We could not find this property. It may have been removed.
          </p>
          <Link to="/properties">
            <Button className="mt-6">Back to Properties</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isListingUnavailable = !property.available
  const isServiceFull =
    capacity?.status === "full" ||
    capacity?.status === "closed" ||
    (capacity?.availableSlots ?? 1) <= 0
  const isBookingBlocked = isListingUnavailable || isServiceFull
  const statusLabel = isListingUnavailable
    ? "Unavailable"
    : capacity?.status === "limited"
      ? "Limited Slots"
        : capacity?.status
          ? capacity.status.charAt(0).toUpperCase() + capacity.status.slice(1)
        : "Available"

  const handleBook = () => {
    setStatusMessage("")
    if (!AuthService.isAuthenticated()) {
      navigate("/login")
      return
    }
    if (!canReserve) {
      setStatusMessage("Only user accounts can create bookings.")
      return
    }
    if (isBookingBlocked) {
      return
    }
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 3)

    navigate("/checkout", {
      state: {
        type: "property",
        itemId: property.id,
        itemName: property.name,
        location: property.location,
        image: property.image,
        unitPrice: property.price,
        checkIn: checkIn.toISOString().split("T")[0],
        checkOut: checkOut.toISOString().split("T")[0],
        guests: Math.min(2, property.capacity),
        maxGuests: property.capacity,
      },
    })
  }

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="mx-auto max-w-6xl px-6">
        <Link to="/properties">
          <Button variant="ghost" className="mb-6 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-xl border border-border">
              <img
                src={selectedImage || property.image}
                alt={property.name}
                className="h-[420px] w-full object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {property.images.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`overflow-hidden rounded-lg border ${
                    selectedImage === image ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={image} alt={property.name} className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge>{property.type === "villa" ? "Villa" : "Cottage"}</Badge>
              {isListingUnavailable && <Badge variant="destructive">Unavailable</Badge>}
            </div>

            <h1 className="font-serif text-4xl font-bold text-foreground">{property.name}</h1>

            <p className="mt-3 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {property.location}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="font-medium text-foreground">{property.rating}</span>
              <span className="text-muted-foreground">({property.reviews} reviews)</span>
            </div>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{property.description}</p>

            <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <Bed className="h-4 w-4" />
                {property.bedrooms} beds
              </div>
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <Bath className="h-4 w-4" />
                {property.bathrooms} baths
              </div>
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <Users className="h-4 w-4" />
                Up to {property.capacity}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold text-foreground">Amenities</h2>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <div>
                <span className="font-serif text-3xl font-bold text-foreground">${property.price}</span>
                <span className="text-muted-foreground"> / night</span>
              </div>
              <Button
                disabled={isBookingBlocked}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleBook}
              >
                {isListingUnavailable
                  ? "Currently Unavailable"
                  : isServiceFull
                    ? "Sold Out"
                  : canReserve
                    ? "Book Stay"
                    : "Admin View Only"}
              </Button>
            </div>
            {capacity && (
              <div className="mt-3 rounded-lg border border-border p-3 text-sm">
                <p className="font-medium text-foreground">
                  Capacity: {capacity.currentBookings}/{capacity.maxCapacity} | Remaining: {capacity.availableSlots}
                </p>
                <p className="text-muted-foreground">
                  Status: {statusLabel}
                </p>
              </div>
            )}
            {!canReserve && (
              <p className="mt-3 text-sm text-muted-foreground">
                Reservation actions are enabled for user accounts only.
              </p>
            )}
            {statusMessage && <p className="mt-3 text-sm text-muted-foreground">{statusMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
