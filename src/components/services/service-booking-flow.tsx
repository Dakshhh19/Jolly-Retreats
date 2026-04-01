import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AuthService from '@/services/authService'
import { createMappedServiceBooking, type ServiceBooking, type SupportedServiceType } from '@/services/bookingApi'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: {
    serviceType: SupportedServiceType
    serviceIdHint: number
    resolvedServiceId?: number | null
    name: string
    description: string
    location: string
    price: number
    priceSuffix: string
    scheduleLabel: string
    quantityLabel: string
    defaultBookingCount?: number
    maxBookingCount: number
    minAdvanceDays?: number
  }
  onBooked?: (booking: ServiceBooking) => void
}

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

const formatDateLabel = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
    return 'Date unavailable'
  }
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatMoney = (value: number) => `$${value.toFixed(2)}`

export function ServiceBookingFlow({ open, onOpenChange, service, onBooked }: Props) {
  const currentUser = AuthService.getCurrentUser()
  const minBookingDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + (service.minAdvanceDays ?? 1))
    return toIsoDate(date)
  }, [service.minAdvanceDays])

  const [step, setStep] = useState(1)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingCount, setBookingCount] = useState(Math.min(service.defaultBookingCount ?? 1, service.maxBookingCount))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<ServiceBooking | null>(null)

  useEffect(() => {
    if (!open) {
      setStep(1)
      setBookingDate('')
      setBookingCount(Math.min(service.defaultBookingCount ?? 1, service.maxBookingCount))
      setErrors({})
      setSubmitting(false)
      setConfirmedBooking(null)
    }
  }, [open, service.defaultBookingCount, service.maxBookingCount])

  const total = useMemo(() => service.price * bookingCount, [bookingCount, service.price])
  const steps = [
    { id: 1, label: 'Schedule' },
    { id: 2, label: 'Review' },
    { id: 3, label: 'Confirmed' },
  ]
  const progressValue = ((step - 1) / (steps.length - 1)) * 100
  const isSingleQuantity = service.maxBookingCount === 1

  const validateSchedule = () => {
    const nextErrors: Record<string, string> = {}
    if (!bookingDate) {
      nextErrors.bookingDate = `Please choose a ${service.scheduleLabel.toLowerCase()}.`
    } else if (bookingDate < minBookingDate) {
      nextErrors.bookingDate = `${service.scheduleLabel} must be on or after ${formatDateLabel(minBookingDate)}.`
    }
    if (!Number.isInteger(bookingCount) || bookingCount < 1) {
      nextErrors.bookingCount = `Please choose at least one ${service.quantityLabel.toLowerCase()}.`
    } else if (bookingCount > service.maxBookingCount) {
      nextErrors.bookingCount = `Only ${service.maxBookingCount} ${service.quantityLabel.toLowerCase()} available right now.`
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleContinue = () => {
    if (validateSchedule()) {
      setErrors({})
      setStep(2)
    }
  }

  const handleConfirm = async () => {
    const token = AuthService.getToken()
    if (!token) {
      setErrors({ submit: 'Your session expired. Please sign in again.' })
      return
    }

    setSubmitting(true)
    setErrors({})
    try {
      const booking = await createMappedServiceBooking({
        token,
        serviceType: service.serviceType,
        serviceName: service.name,
        serviceIdHint: service.resolvedServiceId || service.serviceIdHint,
        bookingDate: `${bookingDate} 00:00:00`,
        bookingCount,
        status: 'confirmed',
        serviceDescription: service.description,
        serviceLocation: service.location,
        servicePrice: service.price
      })
      setConfirmedBooking(booking)
      setStep(3)
      onBooked?.(booking)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Unable to confirm booking.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CalendarDays className="h-5 w-5 text-primary" />
            Book {service.name}
          </DialogTitle>
          <DialogDescription>
            Confirm your reservation details and secure your booking instantly.
          </DialogDescription>
          <div className="mt-4">
            <Progress value={progressValue} className="h-2" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {steps.map((item) => {
              const active = item.id === step
              const completed = item.id < step
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border px-4 py-3 text-sm ${active ? 'border-primary bg-primary/5' : 'border-border bg-background'} ${completed ? 'border-emerald-500/40 bg-emerald-500/5' : ''}`}
                >
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    {completed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className={`h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />}
                    {item.label}
                  </div>
                </div>
              )
            })}
          </div>
        </DialogHeader>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            {step === 1 && (
              <Card className="space-y-5 p-5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Choose your reservation details</h3>
                  <p className="mt-1 text-sm text-muted-foreground">We’ll confirm this booking immediately once you submit it.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-foreground">{service.scheduleLabel}</span>
                    <input
                      className="w-full rounded-xl border border-border bg-background px-3 py-2"
                      type="date"
                      min={minBookingDate}
                      value={bookingDate}
                      onChange={(event) => setBookingDate(event.target.value)}
                    />
                    {errors.bookingDate && <p className="text-xs text-red-500">{errors.bookingDate}</p>}
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-foreground">{service.quantityLabel}</span>
                    <input
                      className="w-full rounded-xl border border-border bg-background px-3 py-2"
                      type="number"
                      min={1}
                      max={service.maxBookingCount}
                      value={bookingCount}
                      disabled={isSingleQuantity}
                      onChange={(event) => setBookingCount(Number(event.target.value || 1))}
                    />
                    <p className="text-xs text-muted-foreground">
                      {isSingleQuantity ? `This booking is limited to 1 ${service.quantityLabel.toLowerCase().slice(0, -1) || service.quantityLabel.toLowerCase()}.` : `Up to ${service.maxBookingCount} ${service.quantityLabel.toLowerCase()} available.`}
                    </p>
                    {errors.bookingCount && <p className="text-xs text-red-500">{errors.bookingCount}</p>}
                  </label>
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card className="space-y-5 p-5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Review your booking</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Please confirm the schedule, quantity, and billing details before we place the booking.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm font-medium text-foreground">Service</p>
                    <p className="mt-1 text-sm text-muted-foreground">{service.name}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm font-medium text-foreground">{service.scheduleLabel}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDateLabel(bookingDate)}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">Description</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{service.description}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">Booked by</p>
                  <p className="mt-1 text-sm text-muted-foreground">{currentUser?.fullName || 'Current user'}</p>
                  <p className="text-sm text-muted-foreground">{currentUser?.email || 'Email unavailable'}</p>
                </div>
                {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
              </Card>
            )}

            {step === 3 && confirmedBooking && (
              <Card className="space-y-5 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Booking confirmed</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Booking #{confirmedBooking.bookingId} has been confirmed successfully.</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                    <p className="font-medium text-foreground">{service.scheduleLabel}</p>
                    <p className="mt-1 text-muted-foreground">{formatDateLabel(bookingDate)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                    <p className="font-medium text-foreground">Quantity</p>
                    <p className="mt-1 text-muted-foreground">{confirmedBooking.bookingCount} {service.quantityLabel}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              </Card>
            )}

            {step < 3 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="flex gap-3">
                  {step > 1 && (
                    <Button variant="outline" onClick={() => setStep((current) => current - 1)}>
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  {step === 1 && <Button onClick={handleContinue}>Continue</Button>}
                  {step === 2 && (
                    <Button onClick={handleConfirm} disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm Booking
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <Card className="h-fit space-y-4 p-5">
            <div>
              <p className="text-sm font-medium text-foreground">Booking Summary</p>
              <p className="mt-1 text-sm text-muted-foreground">{service.name}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Unit price</span>
                <span className="font-medium text-foreground">{formatMoney(service.price)} {service.priceSuffix}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{service.quantityLabel}</span>
                <span className="font-medium text-foreground">{bookingCount}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Estimated total</span>
                  <span className="text-lg font-semibold text-foreground">{formatMoney(total)}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              {service.scheduleLabel}: {bookingDate ? formatDateLabel(bookingDate) : 'Choose a date to continue.'}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ServiceBookingFlow
