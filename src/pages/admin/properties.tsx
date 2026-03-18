import { useEffect, useState } from 'react'
import CrudPage, { type CrudField } from '@/components/admin/CrudPage'
import { adminApi, type AdminProperty } from '@/services/adminApi'

const fields: CrudField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'pricePerNight', label: 'Price / Night', type: 'number', required: true },
  { name: 'capacity', label: 'Capacity', type: 'number', required: true },
  { name: 'maxCapacity', label: 'Max Capacity', type: 'number', required: true },
  { name: 'bedrooms', label: 'Bedrooms', type: 'number', required: true },
  { name: 'bathrooms', label: 'Bathrooms', type: 'number', required: true },
  { name: 'imageUrl', label: 'Image URL', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' }
]

export default function AdminPropertiesPage() {
  const [rows, setRows] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await adminApi.properties.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <CrudPage
      title="Properties Management"
      fields={fields}
      rows={rows}
      loading={loading}
      error={error}
      onCreate={async (payload) => {
        await adminApi.properties.create({
          name: String(payload.name || ''),
          location: String(payload.location || ''),
          pricePerNight: Number(payload.pricePerNight || 0),
          capacity: Number(payload.capacity || 1),
          maxCapacity: Number(payload.maxCapacity || 50),
          bedrooms: Number(payload.bedrooms || 1),
          bathrooms: Number(payload.bathrooms || 1),
          imageUrl: String(payload.imageUrl || ''),
          description: String(payload.description || '')
        })
        await load()
      }}
      onUpdate={async (id, payload) => {
        await adminApi.properties.update(id, {
          name: String(payload.name || ''),
          location: String(payload.location || ''),
          pricePerNight: Number(payload.pricePerNight || 0),
          capacity: Number(payload.capacity || 1),
          maxCapacity: Number(payload.maxCapacity || 50),
          bedrooms: Number(payload.bedrooms || 1),
          bathrooms: Number(payload.bathrooms || 1),
          imageUrl: String(payload.imageUrl || ''),
          description: String(payload.description || '')
        })
        await load()
      }}
      onDelete={async (id) => {
        await adminApi.properties.delete(id)
        await load()
      }}
    />
  )
}
