import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { adminApi, type AdminTour, type AdminTourBooking } from '@/services/adminApi'

const formatMoney = (value: number) => `$${value.toFixed(2)}`

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminTourBooking[]>([])
  const [tours, setTours] = useState<AdminTour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    tourId: '',
    status: '',
    startDate: '',
    endDate: '',
    search: ''
  })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [bookingRows, tourRows] = await Promise.all([
        adminApi.tourBookings.list({
          tourId: filters.tourId ? Number(filters.tourId) : undefined,
          status: filters.status || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          search: filters.search || undefined
        }),
        adminApi.tours.list()
      ])
      setOrders(bookingRows)
      setTours(tourRows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tour bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const updateStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    setUpdatingId(bookingId)
    try {
      await adminApi.tourBookings.updateStatus(bookingId, status)
      await load()
    } finally {
      setUpdatingId(null)
    }
  }

  const downloadInvoice = async (bookingId: string) => {
    try {
      const blob = await adminApi.tourBookings.downloadInvoice(bookingId)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `invoice-${bookingId}.pdf`
      anchor.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to download invoice')
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="font-serif text-4xl font-bold text-foreground">Tour Bookings</h1>
        <p className="mt-2 text-muted-foreground">Review confirmed reservations, cancel bookings when needed, and download invoice PDFs.</p>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={filters.tourId}
            onChange={(event) => setFilters((current) => ({ ...current, tourId: event.target.value }))}
          >
            <option value="">All tours</option>
            {tours.map((tour) => (
              <option key={tour.id} value={tour.id}>{tour.title}</option>
            ))}
          </select>
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Input type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} />
          <Input type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} />
          <Input placeholder="Search booking ID or tour" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>Apply Filters</Button>
        </div>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-4">
        {!loading && orders.map((order) => (
          <Card key={order.bookingId} className="space-y-4 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">{order.tourTitle}</h2>
                  <Badge variant="outline">{order.bookingStatus}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Booking ID: {order.bookingId}</p>
                <p className="mt-1 text-sm text-muted-foreground">Customer: {order.customerName} ({order.customerEmail})</p>
                <p className="mt-1 text-sm text-muted-foreground">Primary contact: {order.primaryContactPerson} | {order.primaryContactPhone}</p>
                <p className="mt-1 text-sm text-muted-foreground">Travel dates: {order.startDate} to {order.endDate}</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                <p className="font-medium text-foreground">Billing</p>
                <p className="mt-1 text-muted-foreground">Per person: {formatMoney(order.pricePerPerson)}</p>
                <p className="text-muted-foreground">Travelers: {order.totalPeople}</p>
                <p className="text-muted-foreground">Taxes: {formatMoney(order.taxAmount)}</p>
                <p className="mt-2 font-semibold text-foreground">Total: {formatMoney(order.totalAmount)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">Traveler Details</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Age</th>
                      <th className="py-2 pr-4">Gender</th>
                      <th className="py-2 pr-4">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.travelers.map((traveler) => (
                      <tr key={traveler.travelerId} className="border-b border-border/60">
                        <td className="py-2 pr-4">{traveler.name}</td>
                        <td className="py-2 pr-4">{traveler.age}</td>
                        <td className="py-2 pr-4">{traveler.gender}</td>
                        <td className="py-2 pr-4">{traveler.contactNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {order.bookingStatus === 'cancelled' ? (
                <Button size="sm" variant="outline" disabled={updatingId === order.bookingId} onClick={() => updateStatus(order.bookingId, 'confirmed')}>
                  Restore Booking
                </Button>
              ) : (
                <Button size="sm" variant="destructive" disabled={updatingId === order.bookingId} onClick={() => updateStatus(order.bookingId, 'cancelled')}>
                  Cancel Booking
                </Button>
              )}
              <Button size="sm" onClick={() => void downloadInvoice(order.bookingId)}>
                Download Invoice
              </Button>
            </div>
          </Card>
        ))}

        {!loading && !orders.length && (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">No tour bookings found for the selected filters.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
