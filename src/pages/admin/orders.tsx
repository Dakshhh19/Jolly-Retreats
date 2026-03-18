import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { adminApi, type AdminBooking } from '@/services/adminApi'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setOrders(await adminApi.bookings.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const updateStatus = async (id: number, status: AdminBooking['status']) => {
    setUpdatingId(id)
    try {
      await adminApi.bookings.update(id, { status })
      await load()
    } finally {
      setUpdatingId(null)
    }
  }

  const cancelOrder = async (id: number) => {
    setUpdatingId(id)
    try {
      await adminApi.bookings.update(id, { status: 'cancelled' })
      await load()
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="p-8">
      <h1 className="font-serif text-4xl font-bold text-foreground">Orders Management</h1>
      <p className="mt-2 text-muted-foreground">Track and update all reservations and order statuses.</p>

      <Card className="mt-6 overflow-x-auto p-4">
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 pr-4">Order ID</th>
              <th className="py-3 pr-4">User ID</th>
              <th className="py-3 pr-4">Service</th>
              <th className="py-3 pr-4">Booking Date</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && orders.map((order) => (
              <tr key={order.id} className="border-b border-border/70">
                <td className="py-3 pr-4">#{order.id}</td>
                <td className="py-3 pr-4">{order.userId}</td>
                <td className="py-3 pr-4">{order.serviceType} #{order.serviceId}</td>
                <td className="py-3 pr-4">{order.bookingDate}</td>
                <td className="py-3 pr-4">
                  <Badge variant="outline">{order.status}</Badge>
                </td>
                <td className="py-3 space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updatingId === order.id}
                    onClick={() => updateStatus(order.id, 'confirmed')}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updatingId === order.id}
                    onClick={() => updateStatus(order.id, 'pending')}
                  >
                    Set Pending
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={updatingId === order.id}
                    onClick={() => cancelOrder(order.id)}
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && !orders.length && (
              <tr>
                <td className="py-4 text-muted-foreground" colSpan={6}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
