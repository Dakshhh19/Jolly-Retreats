import { useEffect, useState } from 'react'
import CrudPage, { type CrudField } from '@/components/admin/CrudPage'
import { adminApi, type AdminRestaurant } from '@/services/adminApi'

const fields: CrudField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'cuisineType', label: 'Cuisine Type', type: 'text', required: true },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'priceRange', label: 'Price Range', type: 'text', required: true },
  { name: 'maxCapacity', label: 'Max Capacity', type: 'number', required: true },
  { name: 'rating', label: 'Rating (0-5)', type: 'number' },
  { name: 'imageUrl', label: 'Image URL', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' }
]

export default function AdminRestaurantsPage() {
  const [rows, setRows] = useState<AdminRestaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await adminApi.restaurants.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <CrudPage
      title="Restaurants Management"
      fields={fields}
      rows={rows}
      loading={loading}
      error={error}
      onCreate={async (payload) => {
        await adminApi.restaurants.create({
          name: String(payload.name || ''),
          cuisineType: String(payload.cuisineType || ''),
          location: String(payload.location || ''),
          priceRange: String(payload.priceRange || ''),
          maxCapacity: Number(payload.maxCapacity || 50),
          rating: payload.rating === '' ? '' : Number(payload.rating || 0),
          imageUrl: String(payload.imageUrl || ''),
          description: String(payload.description || '')
        })
        await load()
      }}
      onUpdate={async (id, payload) => {
        await adminApi.restaurants.update(id, {
          name: String(payload.name || ''),
          cuisineType: String(payload.cuisineType || ''),
          location: String(payload.location || ''),
          priceRange: String(payload.priceRange || ''),
          maxCapacity: Number(payload.maxCapacity || 50),
          rating: payload.rating === '' ? '' : Number(payload.rating || 0),
          imageUrl: String(payload.imageUrl || ''),
          description: String(payload.description || '')
        })
        await load()
      }}
      onDelete={async (id) => {
        await adminApi.restaurants.delete(id)
        await load()
      }}
    />
  )
}
