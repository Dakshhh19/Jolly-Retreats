import { useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { CalendarDays, CheckCircle2, Download, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthService from "@/services/authService"
import { canCreateReservation } from "@/auth/privileges"
import { getApiBaseUrl } from "@/lib/api-base"

const API_BASE = getApiBaseUrl("/api")

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

const formatMoney = (value: number) => `$${value.toFixed(2)}`
const formatDisplayDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : value

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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(27,107,74,0.12),_transparent_42%),linear-gradient(180deg,#faf7f4_0%,#f5efe7_100%)] px-6 py-16">
        <Card className="mx-auto max-w-md border-border/70 bg-card/95 p-8 text-center shadow-[0_24px_60px_rgba(44,44,44,0.08)] backdrop-blur">
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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(27,107,74,0.12),_transparent_42%),linear-gradient(180deg,#faf7f4_0%,#f5efe7_100%)] px-6 py-16">
        <Card className="mx-auto max-w-md border-border/70 bg-card/95 p-8 text-center shadow-[0_24px_60px_rgba(44,44,44,0.08)] backdrop-blur">
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
    if (!checkIn || !checkOut) {
      setSubmitError("Please select both check-in and check-out dates.")
      return
    }
    if (checkOut <= checkIn) {
      setSubmitError("Check-out must be after check-in.")
      return
    }
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
        const response = await fetch(`${API_BASE}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            serviceType: "property",
            serviceId,
            bookingCount: guests,
            bookingDate: `${checkIn} 00:00:00`,
            status: "confirmed",
            serviceName: checkoutState.itemName,
            serviceLocation: checkoutState.location,
            servicePrice: checkoutState.unitPrice
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

  const downloadBillPdf = () => {
    if (!checkoutState || !receiptDetails) return
    const user = AuthService.getCurrentUser()
    const billWindow = window.open("", "_blank", "width=900,height=700")
    if (!billWindow) {
      setSubmitError("Unable to open the bill preview window.")
      return
    }

    const invoiceHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Bill-${receiptDetails.bookingId}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1f2937; margin: 32px; }
      .wrap { max-width: 760px; margin: 0 auto; }
      .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
      .brand { font-size: 28px; font-weight: 700; }
      .muted { color: #6b7280; }
      .panel { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { text-align: left; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
      th:last-child, td:last-child { text-align: right; }
      .total { font-size: 20px; font-weight: 700; }
      @media print { body { margin: 0; } .print-note { display: none; } }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="head">
        <div>
          <div class="brand">Jolly Retreats</div>
          <div class="muted">Property Stay Bill</div>
        </div>
        <div>
          <div><strong>Booking #:</strong> ${receiptDetails.bookingId}</div>
          <div><strong>Status:</strong> ${receiptDetails.status}</div>
          <div><strong>Issued:</strong> ${new Date(receiptDetails.createdAt).toLocaleString()}</div>
        </div>
      </div>

      <div class="panel">
        <div><strong>Guest:</strong> ${user?.fullName || "N/A"}</div>
        <div><strong>Email:</strong> ${user?.email || "N/A"}</div>
      </div>

      <div class="panel">
        <div><strong>Property:</strong> ${checkoutState.itemName}</div>
        <div><strong>Location:</strong> ${checkoutState.location}</div>
        <div><strong>Check-in:</strong> ${formatDisplayDate(checkIn)}</div>
        <div><strong>Check-out:</strong> ${formatDisplayDate(checkOut)}</div>
        <div><strong>Guests:</strong> ${guests}</div>
      </div>

      <div class="panel">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${checkoutState.itemName} (${nights} night${nights !== 1 ? "s" : ""} x ${guests} guest${guests !== 1 ? "s" : ""})</td>
              <td>${formatMoney(total)}</td>
            </tr>
            <tr>
              <td>Rate per night</td>
              <td>${formatMoney(checkoutState.unitPrice)}</td>
            </tr>
            <tr>
              <td>Booked stay duration</td>
              <td>${nights} night${nights !== 1 ? "s" : ""}</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex; justify-content:space-between; margin-top:20px;" class="total">
          <span>Total</span>
          <span>${formatMoney(total)}</span>
        </div>
      </div>

      <p class="muted print-note">Use your browser's Save as PDF option in the print dialog to download this bill as a PDF.</p>
    </div>
  </body>
</html>`

    billWindow.document.open()
    billWindow.document.write(invoiceHtml)
    billWindow.document.close()
    billWindow.focus()
    billWindow.print()
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(27,107,74,0.14),_transparent_42%),linear-gradient(180deg,#faf7f4_0%,#f5efe7_100%)] px-6 py-16">
        <Card className="mx-auto max-w-2xl border-border/70 bg-card/95 p-8 text-center shadow-[0_24px_60px_rgba(44,44,44,0.08)] backdrop-blur sm:p-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">Reservation Confirmed</h1>
          <p className="mt-3 text-muted-foreground">
            Your stay at {checkoutState.itemName} is reserved from {checkIn} to {checkOut}.
          </p>
          <div className="mt-6 grid gap-3 rounded-2xl border border-border/70 bg-muted/25 p-4 text-left sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Guests</p>
              <p className="mt-1 font-semibold text-foreground">{guests}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dates</p>
              <p className="mt-1 font-semibold text-foreground">{formatDisplayDate(checkIn)} to {formatDisplayDate(checkOut)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total</p>
              <p className="mt-1 font-semibold text-foreground">{formatMoney(total)}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Button variant="outline" onClick={downloadBillPdf}>
              <Download className="mr-2 h-4 w-4" />
              Download Bill PDF
            </Button>
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(27,107,74,0.12),_transparent_36%),linear-gradient(180deg,#faf7f4_0%,#f5efe7_100%)] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Property Checkout</p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-foreground sm:text-5xl">Complete Your Stay</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Review your travel dates, guest count, and final stay total before confirming your reservation.
            </p>
          </div>
          <Link to="/properties">
            <Button variant="outline" className="w-full sm:w-auto">Back to Properties</Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-border/70 bg-card/95 p-6 shadow-[0_20px_60px_rgba(44,44,44,0.06)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-border/70 bg-muted/25 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Stay Snapshot</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Property</p>
                    <p className="mt-1 font-semibold text-foreground">{checkoutState.itemName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="mt-1 font-semibold text-foreground">{checkoutState.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nightly Rate</p>
                    <p className="mt-1 font-semibold text-foreground">{formatMoney(checkoutState.unitPrice)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold text-foreground">Reservation Details</h2>
                <p className="mt-2 text-sm text-muted-foreground">Choose your check-in, check-out, and guest count.</p>
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="check-in" className="text-sm font-medium">Check-in</Label>
                  <Input
                    id="check-in"
                    type="date"
                    className="h-12 rounded-xl border-border/70 bg-background"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check-out" className="text-sm font-medium">Check-out</Label>
                  <Input
                    id="check-out"
                    type="date"
                    className="h-12 rounded-xl border-border/70 bg-background"
                    value={checkOut}
                    min={checkIn || undefined}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests" className="text-sm font-medium">Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  max={checkoutState.maxGuests}
                  className="h-12 rounded-xl border-border/70 bg-background"
                  value={guests}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (!Number.isNaN(value)) {
                      setGuests(Math.min(Math.max(1, value), checkoutState.maxGuests))
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Maximum allowed: {checkoutState.maxGuests} guests.</p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-secondary/45 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected stay</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {formatDisplayDate(checkIn)} to {formatDisplayDate(checkOut)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="mt-1 font-semibold text-foreground">{nights} night{nights !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="h-fit border-border/70 bg-card/95 p-5 shadow-[0_20px_60px_rgba(44,44,44,0.06)] backdrop-blur sm:sticky sm:top-28 sm:p-6">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={checkoutState.image}
                alt={checkoutState.itemName}
                className="h-56 w-full object-cover"
              />
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Booking Summary</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground">{checkoutState.itemName}</h2>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {checkoutState.location}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {nights} night{nights !== 1 ? "s" : ""} stay
              </p>
            </div>

            <div className="mt-6 space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Check-in</span>
                <span className="font-medium text-foreground">{formatDisplayDate(checkIn)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Check-out</span>
                <span className="font-medium text-foreground">{formatDisplayDate(checkOut)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Guests</span>
                <span className="font-medium text-foreground">{guests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rate per night</span>
                <span className="font-medium text-foreground">{formatMoney(checkoutState.unitPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nights</span>
                <span className="font-medium text-foreground">{nights}</span>
              </div>
              <div className="border-t border-border/80 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-semibold text-foreground">{formatMoney(total)}</span>
                </div>
              </div>
            </div>

            <Button
              className="mt-6 h-12 w-full rounded-xl text-base"
              disabled={!checkIn || !checkOut}
              onClick={handleConfirm}
            >
              Confirm Reservation
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Your booking is confirmed instantly after submission.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
