import { useEffect, useState } from 'react'
import CrudPage, { type CrudField } from '@/components/admin/CrudPage'
import { adminApi, type AdminCar } from '@/services/adminApi'

const fields: CrudField[] = [
  { name: 'carName', label: 'Car Name', type: 'text', required: true },
  { name: 'company', label: 'Company', type: 'text', required: true },
  { name: 'pricePerDay', label: 'Price / Day', type: 'number', required: true },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'seats', label: 'Seats', type: 'number', required: true },
  { name: 'fuelType', label: 'Fuel Type', type: 'text', required: true },
  { name: 'maxCapacity', label: 'Max Capacity', type: 'number', required: true },
  { name: 'imageUrl', label: 'Image URL', type: 'text' }
]

export default function AdminCarsPage() {
  const [rows, setRows] = useState<AdminCar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await adminApi.cars.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load car rentals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <CrudPage
      title="Cars Management"
      fields={fields}
      rows={rows}
      loading={loading}
      error={error}
      onCreate={async (payload) => {
        await adminApi.cars.create({
          carName: String(payload.carName || ''),
          company: String(payload.company || ''),
          pricePerDay: Number(payload.pricePerDay || 0),
          location: String(payload.location || ''),
          seats: Number(payload.seats || 0),
          fuelType: String(payload.fuelType || ''),
          maxCapacity: Number(payload.maxCapacity || 50),
          imageUrl: String(payload.imageUrl || '')
        })
        await load()
      }}
      onUpdate={async (id, payload) => {
        await adminApi.cars.update(id, {
          carName: String(payload.carName || ''),
          company: String(payload.company || ''),
          pricePerDay: Number(payload.pricePerDay || 0),
          location: String(payload.location || ''),
          seats: Number(payload.seats || 0),
          fuelType: String(payload.fuelType || ''),
          maxCapacity: Number(payload.maxCapacity || 50),
          imageUrl: String(payload.imageUrl || '')
        })
        await load()
      }}
      onDelete={async (id) => {
        await adminApi.cars.delete(id)
        await load()
      }}
    />
  )
}
