import { useEffect, useState } from 'react'
import CrudPage, { type CrudField } from '@/components/admin/CrudPage'
import { adminApi, type AdminTour } from '@/services/adminApi'

const fields: CrudField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'price', label: 'Price', type: 'number', required: true },
  { name: 'duration', label: 'Duration', type: 'text', required: true },
  { name: 'maxCapacity', label: 'Max Capacity', type: 'number', required: true },
  { name: 'imageUrl', label: 'Image URL', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' }
]

export default function AdminToursPage() {
  const [rows, setRows] = useState<AdminTour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await adminApi.tours.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tours')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <CrudPage
      title="Tours Management"
      fields={fields}
      rows={rows}
      loading={loading}
      error={error}
      onCreate={async (payload) => {
        await adminApi.tours.create({
          title: String(payload.title || ''),
          location: String(payload.location || ''),
          price: Number(payload.price || 0),
          duration: String(payload.duration || ''),
          maxCapacity: Number(payload.maxCapacity || 50),
          imageUrl: String(payload.imageUrl || ''),
          description: String(payload.description || '')
        })
        await load()
      }}
      onUpdate={async (id, payload) => {
        await adminApi.tours.update(id, {
          title: String(payload.title || ''),
          location: String(payload.location || ''),
          price: Number(payload.price || 0),
          duration: String(payload.duration || ''),
          maxCapacity: Number(payload.maxCapacity || 50),
          imageUrl: String(payload.imageUrl || ''),
          description: String(payload.description || '')
        })
        await load()
      }}
      onDelete={async (id) => {
        await adminApi.tours.delete(id)
        await load()
      }}
    />
  )
}
