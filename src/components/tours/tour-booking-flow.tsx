import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Circle, Download, Loader2, Users } from 'lucide-react'
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
import { COUNTRY_CODE_OPTIONS, buildContactNumber } from '@/lib/auth'
import AuthService from '@/services/authService'
import { tourBookingApi, type PublicTour, type TourBooking, type TravelerInput } from '@/services/tourBookingApi'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tour: PublicTour
  onBooked?: (booking: TourBooking) => void
}

const TAX_RATE = 0.12
const PHONE_REGEX = /^\+\d{11,14}$/
const NAME_REGEX = /^[A-Za-z\s]+$/
const DEFAULT_COUNTRY_CODE = COUNTRY_CODE_OPTIONS[0].value

const formatMoney = (value: number) => `$${value.toFixed(2)}`

const splitContactNumber = (value: string) => {
  const normalized = String(value || '').trim().replace(/[^\d+]/g, '')
  const matchedOption = COUNTRY_CODE_OPTIONS.find((option) => {
    if (!normalized.startsWith(option.value)) {
      return false
    }
    const localNumber = normalized.slice(option.value.length).replace(/\D/g, '')
    return localNumber.length <= option.localLength
  })

  if (!matchedOption) {
    return {
      countryCode: DEFAULT_COUNTRY_CODE,
      localContactNumber: normalized.replace(/\D/g, '').slice(0, 10)
    }
  }

  return {
    countryCode: matchedOption.value,
    localContactNumber: normalized
      .slice(matchedOption.value.length)
      .replace(/\D/g, '')
      .slice(0, matchedOption.localLength)
  }
}

const parseDurationDays = (duration: string) => {
  const match = String(duration || '').match(/(\d+)/)
  const parsed = match ? Number(match[1]) : NaN
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

const getTripLengthInDays = (start: string, end: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
    return null
  }
  const startUtc = new Date(`${start}T00:00:00Z`).getTime()
  const endUtc = new Date(`${end}T00:00:00Z`).getTime()
  if (Number.isNaN(startUtc) || Number.isNaN(endUtc) || endUtc < startUtc) {
    return null
  }
  return Math.floor((endUtc - startUtc) / 86400000) + 1
}

const addDaysToIsoDate = (value: string, daysToAdd: number) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return ''
  }
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  date.setUTCDate(date.getUTCDate() + daysToAdd)
  return date.toISOString().slice(0, 10)
}

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

export function TourBookingFlow({ open, onOpenChange, tour, onBooked }: Props) {
  const currentUser = AuthService.getCurrentUser()
  const maxTripDays = parseDurationDays(tour.duration)
  const [step, setStep] = useState(1)
  const [travelerCount, setTravelerCount] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [travelers, setTravelers] = useState<TravelerInput[]>([{
    name: '',
    age: '',
    gender: '',
    contactNumber: currentUser?.contactNumber || ''
  }])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<TourBooking | null>(null)
  const [downloadBusy, setDownloadBusy] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep(1)
      setTravelerCount(1)
      setStartDate('')
      setEndDate('')
      setTravelers([{
        name: '',
        age: '',
        gender: '',
        contactNumber: currentUser?.contactNumber || ''
      }])
      setErrors({})
      setSubmitting(false)
      setConfirmedBooking(null)
      setDownloadBusy(false)
    }
  }, [open, currentUser?.contactNumber])

  const totals = useMemo(() => {
    const subtotal = tour.price * travelerCount
    const taxes = Number((subtotal * TAX_RATE).toFixed(2))
    const total = Number((subtotal + taxes).toFixed(2))
    return { subtotal, taxes, total }
  }, [tour.price, travelerCount])

  const steps = [
    { id: 1, label: 'Travelers & Dates' },
    { id: 2, label: 'Traveler Details' },
    { id: 3, label: 'Summary' },
    { id: 4, label: 'Invoice' },
  ]

  const progressValue = ((step - 1) / (steps.length - 1)) * 100
  const computedEndDateMax = startDate && maxTripDays
    ? [tour.availability.maxEndDate, addDaysToIsoDate(startDate, maxTripDays - 1)]
        .filter(Boolean)
        .sort()[0] || tour.availability.maxEndDate
    : tour.availability.maxEndDate

  const updateTravelerCount = (count: number) => {
    const normalizedCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 1
    setTravelerCount(normalizedCount)
    setTravelers((prev) => Array.from({ length: normalizedCount }, (_, index) => prev[index] || {
      name: '',
      age: '',
      gender: '',
      contactNumber: index === 0 ? currentUser?.contactNumber || '' : ''
    }))
  }

  const updateTravelerContact = (index: number, countryCode: string, localContactNumber: string) => {
    const option = COUNTRY_CODE_OPTIONS.find((item) => item.value === countryCode) || COUNTRY_CODE_OPTIONS[0]
    const localDigits = localContactNumber.replace(/\D/g, '').slice(0, option.localLength)
    setTravelers((prev) => prev.map((item, travelerIndex) => (
      travelerIndex === index
        ? { ...item, contactNumber: buildContactNumber(option.value, localDigits) }
        : item
    )))
  }

  const validateStepOne = () => {
    const nextErrors: Record<string, string> = {}
    if (!Number.isInteger(travelerCount) || travelerCount < 1) {
      nextErrors.totalPeople = 'Please choose at least one traveler.'
    }
    if (travelerCount > tour.availability.availableSlots) {
      nextErrors.totalPeople = `Only ${tour.availability.availableSlots} traveler slots are available right now.`
    }
    if (!startDate) {
      nextErrors.startDate = 'Please choose a start date.'
    }
    if (!endDate) {
      nextErrors.endDate = 'Please choose an end date.'
    }
    if (startDate && (startDate < tour.availability.minStartDate || startDate > tour.availability.maxEndDate)) {
      nextErrors.startDate = 'Start date must be within the allowed travel window.'
    }
    if (endDate && (endDate < tour.availability.minStartDate || endDate > tour.availability.maxEndDate)) {
      nextErrors.endDate = 'End date must be within the allowed travel window.'
    }
    if (startDate && endDate && endDate < startDate) {
      nextErrors.endDate = 'End date must be the same as or after the start date.'
    }
    const tripLength = getTripLengthInDays(startDate, endDate)
    if (startDate && endDate && maxTripDays && tripLength && tripLength > maxTripDays) {
      nextErrors.endDate = `This tour can be booked for up to ${maxTripDays} day${maxTripDays > 1 ? 's' : ''}.`
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateStepTwo = () => {
    const nextErrors: Record<string, string> = {}
    travelers.forEach((traveler, index) => {
      if (!traveler.name.trim()) {
        nextErrors[`traveler-${index}-name`] = 'Full name is required.'
      } else if (!NAME_REGEX.test(traveler.name.trim())) {
        nextErrors[`traveler-${index}-name`] = 'Use letters and spaces only.'
      }
      const age = Number(traveler.age)
      if (!traveler.age) {
        nextErrors[`traveler-${index}-age`] = 'Age is required.'
      } else if (!Number.isInteger(age) || age < 1 || age > 120) {
        nextErrors[`traveler-${index}-age`] = 'Enter a valid age between 1 and 120.'
      }
      if (!traveler.gender) {
        nextErrors[`traveler-${index}-gender`] = 'Gender is required.'
      }
      if (!traveler.contactNumber.trim()) {
        nextErrors[`traveler-${index}-contact`] = 'Contact number is required.'
      } else {
        const contactParts = splitContactNumber(traveler.contactNumber)
        const option = COUNTRY_CODE_OPTIONS.find((item) => item.value === contactParts.countryCode)
        const normalizedContactNumber = buildContactNumber(contactParts.countryCode, contactParts.localContactNumber)
        if (!option || contactParts.localContactNumber.length !== option.localLength || !PHONE_REGEX.test(normalizedContactNumber)) {
          nextErrors[`traveler-${index}-contact`] = `Choose a country code and enter exactly ${option?.localLength || 10} digits.`
        }
      }
    })
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleContinue = () => {
    if (step === 1 && validateStepOne()) {
      setStep(2)
      setErrors({})
    }
    if (step === 2 && validateStepTwo()) {
      setStep(3)
      setErrors({})
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
      const booking = await tourBookingApi.createBooking(token, {
        tourId: Number(tour.id),
        startDate,
        endDate,
        totalPeople: travelerCount,
        travelers
      })
      setConfirmedBooking(booking)
      setStep(4)
      onBooked?.(booking)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Unable to confirm booking.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleInvoiceDownload = async () => {
    if (!confirmedBooking) return
    const token = AuthService.getToken()
    if (!token) {
      setErrors({ submit: 'Your session expired. Please sign in again.' })
      return
    }
    setDownloadBusy(true)
    try {
      const blob = await tourBookingApi.downloadInvoice(token, confirmedBooking.bookingId)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `invoice-${confirmedBooking.bookingId}.pdf`
      anchor.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Unable to download invoice.' })
    } finally {
      setDownloadBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CalendarDays className="h-5 w-5 text-primary" />
            Book {tour.name}
          </DialogTitle>
          <DialogDescription>
            Complete your booking in a few quick steps. This tour is available between {formatDateLabel(tour.availability.minStartDate)} and {formatDateLabel(tour.availability.maxEndDate)}.
          </DialogDescription>
          <div className="mt-4">
            <Progress value={progressValue} className="h-2" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
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
                  <h3 className="text-lg font-semibold text-foreground">How many people are going on this tour?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">We'll create a traveler form for each person automatically.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-foreground">Number of travelers</span>
                    <input
                      className="w-full rounded-xl border border-border bg-background px-3 py-2"
                      type="number"
                      min={1}
                      max={tour.availability.availableSlots || tour.maxGroup}
                      value={travelerCount}
                      onChange={(event) => updateTravelerCount(Number(event.target.value || 1))}
                    />
                    {errors.totalPeople && <p className="text-xs text-red-500">{errors.totalPeople}</p>}
                  </label>
                  <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                    <p className="font-medium text-foreground">Availability</p>
                    <p className="mt-1 text-muted-foreground">This tour is available between {formatDateLabel(tour.availability.minStartDate)} and {formatDateLabel(tour.availability.maxEndDate)}.</p>
                    {maxTripDays && <p className="mt-2 text-muted-foreground">Maximum trip length: {maxTripDays} day{maxTripDays > 1 ? 's' : ''} per booking.</p>}
                    <p className="mt-2 text-muted-foreground">Remaining seats: {tour.availability.availableSlots}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-foreground">Start date</span>
                    <input
                      className="w-full rounded-xl border border-border bg-background px-3 py-2"
                      type="date"
                      min={tour.availability.minStartDate}
                      max={tour.availability.maxEndDate}
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                    />
                    {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-foreground">End date</span>
                    <input
                      className="w-full rounded-xl border border-border bg-background px-3 py-2"
                      type="date"
                      min={startDate || tour.availability.minStartDate}
                      max={computedEndDateMax}
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                    />
                    {errors.endDate && <p className="text-xs text-red-500">{errors.endDate}</p>}
                  </label>
                </div>
              </Card>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {travelers.map((traveler, index) => (
                  <Card key={`traveler-${index}`} className="space-y-4 p-5">
                    {(() => {
                      const contactParts = splitContactNumber(traveler.contactNumber)
                      const selectedCountry = COUNTRY_CODE_OPTIONS.find((option) => option.value === contactParts.countryCode) || COUNTRY_CODE_OPTIONS[0]
                      return (
                        <>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Traveler {index + 1}</h3>
                      <p className="text-sm text-muted-foreground">Add the required details for each member of the group.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm">
                        <span className="font-medium text-foreground">Full name</span>
                        <input
                          className="w-full rounded-xl border border-border bg-background px-3 py-2"
                          value={traveler.name}
                          onChange={(event) => setTravelers((prev) => prev.map((item, travelerIndex) => travelerIndex === index ? { ...item, name: event.target.value } : item))}
                        />
                        {errors[`traveler-${index}-name`] && <p className="text-xs text-red-500">{errors[`traveler-${index}-name`]}</p>}
                      </label>
                      <label className="space-y-2 text-sm">
                        <span className="font-medium text-foreground">Age</span>
                        <input
                          className="w-full rounded-xl border border-border bg-background px-3 py-2"
                          type="number"
                          min={1}
                          max={120}
                          value={traveler.age}
                          onChange={(event) => setTravelers((prev) => prev.map((item, travelerIndex) => travelerIndex === index ? { ...item, age: event.target.value } : item))}
                        />
                        {errors[`traveler-${index}-age`] && <p className="text-xs text-red-500">{errors[`traveler-${index}-age`]}</p>}
                      </label>
                      <label className="space-y-2 text-sm">
                        <span className="font-medium text-foreground">Gender</span>
                        <select
                          className="w-full rounded-xl border border-border bg-background px-3 py-2"
                          value={traveler.gender}
                          onChange={(event) => setTravelers((prev) => prev.map((item, travelerIndex) => travelerIndex === index ? { ...item, gender: event.target.value as TravelerInput['gender'] } : item))}
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors[`traveler-${index}-gender`] && <p className="text-xs text-red-500">{errors[`traveler-${index}-gender`]}</p>}
                      </label>
                      <label className="space-y-2 text-sm">
                        <span className="font-medium text-foreground">Contact number</span>
                        <div className="grid grid-cols-[170px_1fr] gap-2">
                          <select
                            className="h-10 rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            value={contactParts.countryCode}
                            onChange={(event) => updateTravelerContact(index, event.target.value, contactParts.localContactNumber)}
                          >
                            {COUNTRY_CODE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <input
                            className="w-full rounded-xl border border-border bg-background px-3 py-2"
                            placeholder={`${selectedCountry.localLength}-digit number`}
                            type="tel"
                            inputMode="numeric"
                            maxLength={selectedCountry.localLength}
                            value={contactParts.localContactNumber}
                            onChange={(event) => updateTravelerContact(index, contactParts.countryCode, event.target.value)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Select a country code and enter exactly {selectedCountry.localLength} digits.</p>
                        {errors[`traveler-${index}-contact`] && <p className="text-xs text-red-500">{errors[`traveler-${index}-contact`]}</p>}
                      </label>
                    </div>
                        </>
                      )
                    })()}
                  </Card>
                ))}
              </div>
            )}

            {step === 3 && (
              <Card className="space-y-5 p-5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Review your booking before payment</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Confirm the tour, travel dates, travelers, and billing details.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm font-medium text-foreground">Tour Name</p>
                    <p className="mt-1 text-sm text-muted-foreground">{tour.name}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm font-medium text-foreground">Travel Dates</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDateLabel(startDate)} to {formatDateLabel(endDate)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">Tour Description</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{tour.description}</p>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Users className="h-4 w-4" />
                    {travelerCount} Traveler{travelerCount > 1 ? 's' : ''}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Primary contact: {travelers[0]?.name || currentUser?.fullName || 'Not provided yet'}{travelers[0]?.contactNumber ? ` | ${travelers[0].contactNumber}` : ''}
                  </p>
                  <div className="mt-4 space-y-3">
                    {travelers.map((traveler, index) => (
                      <div key={`summary-${index}`} className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{traveler.name}</p>
                        <p>Age: {traveler.age} | Gender: {traveler.gender}</p>
                        <p>Contact: {traveler.contactNumber}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
              </Card>
            )}

            {step === 4 && confirmedBooking && (
              <Card className="space-y-5 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Booking confirmed</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Your booking ID is {confirmedBooking.bookingId}. The invoice PDF is ready to download.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                    <p className="font-medium text-foreground">Primary Contact</p>
                    <p className="mt-1 text-muted-foreground">{confirmedBooking.primaryContactPerson}</p>
                    <p className="text-muted-foreground">{confirmedBooking.primaryContactPhone}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                    <p className="font-medium text-foreground">Grand Total</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{formatMoney(confirmedBooking.totalAmount)}</p>
                  </div>
                </div>

                {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={handleInvoiceDownload} disabled={downloadBusy}>
                    {downloadBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download Invoice PDF
                  </Button>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              </Card>
            )}

            {step < 4 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="flex gap-3">
                  {step > 1 && (
                    <Button variant="outline" onClick={() => setStep((current) => current - 1)}>
                      Back
                    </Button>
                  )}
                  {step === 3 && (
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Edit Details
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  {step < 3 && <Button onClick={handleContinue}>Continue</Button>}
                  {step === 3 && (
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
              <p className="mt-1 text-sm text-muted-foreground">{tour.name}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price per person</span>
                <span className="font-medium text-foreground">{formatMoney(tour.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Travelers</span>
                <span className="font-medium text-foreground">{travelerCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span className="font-medium text-foreground">{formatMoney(totals.taxes)}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Total Amount</span>
                  <span className="text-lg font-semibold text-foreground">{formatMoney(totals.total)}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              This tour is available between {formatDateLabel(tour.availability.minStartDate)} and {formatDateLabel(tour.availability.maxEndDate)}.
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TourBookingFlow
