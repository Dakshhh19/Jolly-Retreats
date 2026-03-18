import { useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { CalendarDays, CheckCircle2, Download, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthService from "@/services/authService"
import { canCreateReservation } from "@/auth/privileges"

interface CheckoutState {
  type: "property"
  itemId: string
  itemName: string
  location: string
  image: string
  unitPrice: number
  checkIn: string
  checkOut: string
  guests: number
  maxGuests: number
}

interface ReceiptDetails {
  bookingId: number
  bookingDate: string
  createdAt: string
  status: string
}

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const checkoutState = location.state as CheckoutState | null
  const userRole = AuthService.getUserRole()
  const canReserve = canCreateReservation(userRole)

  const [checkIn, setCheckIn] = useState(checkoutState?.checkIn ?? "")
  const [checkOut, setCheckOut] = useState(checkoutState?.checkOut ?? "")
  const [guests, setGuests] = useState(checkoutState?.guests ?? 1)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetails | null>(null)

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1
    const inDate = new Date(checkIn)
    const outDate = new Date(checkOut)
    const diffDays = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays)
  }, [checkIn, checkOut])

  const total = checkoutState ? nights * checkoutState.unitPrice : 0

  if (!canReserve) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md p-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground">Admin Access Restricted</h1>
          <p className="mt-3 text-muted-foreground">
            Checkout and reservation creation are available for user accounts only.
          </p>
          <Button className="mt-6" onClick={() => navigate("/admin-dashboard")}>
            Back to Admin Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  if (!checkoutState || checkoutState.type !== "property") {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md p-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground">No booking selected</h1>
          <p className="mt-3 text-muted-foreground">
            Select a property and click Reserve Now to start checkout.
          </p>
          <Link to="/properties">
            <Button className="mt-6">Browse Properties</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleConfirm = () => {
    if (!checkIn || !checkOut) return
    setSubmitError("")

    const token = AuthService.getToken()
    if (!token) {
      setSubmitError("Please log in again to complete your reservation.")
      return
    }

    const serviceId = Number(String(checkoutState.itemId).replace(/\D/g, ""))
    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      setSubmitError("Invalid property selected for booking.")
      return
    }

    void (async () => {
      try {
        const response = await fetch("http://localhost:5000/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            serviceType: "property",
            serviceId,
            bookingDate: `${checkIn} 00:00:00`,
            status: "confirmed",
          }),
        })
        const payload = await response.json()
        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Unable to confirm reservation")
        }
        setReceiptDetails({
          bookingId: Number(payload?.data?.id || 0),
          bookingDate: String(payload?.data?.booking_date || `${checkIn} 00:00:00`),
          createdAt: String(payload?.data?.created_at || new Date().toISOString()),
          status: String(payload?.data?.status || "confirmed")
        })
        setIsConfirmed(true)
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Unable to confirm reservation")
      }
    })()
  }

  const downloadReceipt = () => {
    if (!checkoutState || !receiptDetails) return
    const user = AuthService.getCurrentUser()
    const content = [
      "JOLLY RETREATS - BOOKING RECEIPT",
      "--------------------------------",
      `Receipt Generated: ${new Date().toISOString()}`,
      `Booking ID: ${receiptDetails.bookingId || "N/A"}`,
      `Booking Status: ${receiptDetails.status}`,
      `Booking Date: ${receiptDetails.bookingDate}`,
      `Created At: ${receiptDetails.createdAt}`,
      "",
      `Guest Name: ${user?.fullName || "N/A"}`,
      `Guest Email: ${user?.email || "N/A"}`,
      "",
      `Service Type: Property`,
      `Property: ${checkoutState.itemName}`,
      `Location: ${checkoutState.location}`,
      `Check-in: ${checkIn}`,
      `Check-out: ${checkOut}`,
      `Guests: ${guests}`,
      "",
      `Rate per night: $${checkoutState.unitPrice}`,
      `Nights: ${nights}`,
      `Total Paid: $${total}`,
      "",
      "Thank you for booking with Jolly Retreats."
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `booking-receipt-${receiptDetails.bookingId || Date.now()}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  if (isConfirmed) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-xl p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">Reservation Confirmed</h1>
          <p className="mt-3 text-muted-foreground">
            Your stay at {checkoutState.itemName} is reserved from {checkIn} to {checkOut}.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Guests: {guests} | Total: ${total}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={downloadReceipt}>
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Button variant="outline" onClick={() => navigate("/properties")}>
              Explore More
            </Button>
            <Button onClick={() => navigate("/user-dashboard")}>Go to Dashboard</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-6">
          <h1 className="font-serif text-3xl font-bold text-foreground">Checkout</h1>
          <p className="mt-2 text-muted-foreground">Review your stay details and confirm your reservation.</p>

          <div className="mt-8 space-y-5">
            {submitError && <p className="text-sm text-red-500">{submitError}</p>}
            <div className="space-y-2">
              <Label htmlFor="check-in">Check-in</Label>
              <Input
                id="check-in"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-out">Check-out</Label>
              <Input
                id="check-out"
                type="date"
                value={checkOut}
                min={checkIn || undefined}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">Guests</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                max={checkoutState.maxGuests}
                value={guests}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (!Number.isNaN(value)) {
                    setGuests(Math.min(Math.max(1, value), checkoutState.maxGuests))
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Maximum allowed: {checkoutState.maxGuests}</p>
            </div>
          </div>
        </Card>

        <Card className="h-fit p-6">
          <img
            src={checkoutState.image}
            alt={checkoutState.itemName}
            className="h-48 w-full rounded-lg object-cover"
          />
          <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">{checkoutState.itemName}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {checkoutState.location}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {nights} night{nights !== 1 ? "s" : ""}
          </p>

          <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rate per night</span>
              <span className="text-foreground">${checkoutState.unitPrice}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nights</span>
              <span className="text-foreground">{nights}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>

          <Button
            className="mt-6 w-full"
            disabled={!checkIn || !checkOut}
            onClick={handleConfirm}
          >
            Confirm Reservation
          </Button>
        </Card>
      </div>
    </div>
  )
}
