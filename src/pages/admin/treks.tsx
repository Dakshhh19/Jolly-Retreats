import { useEffect, useState } from 'react'
import CrudPage, { type CrudField } from '@/components/admin/CrudPage'
import { adminApi, type AdminTrek } from '@/services/adminApi'

const fields: CrudField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'difficultyLevel', label: 'Difficulty', type: 'select', options: ['easy', 'moderate', 'hard', 'extreme'], required: true },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'duration', label: 'Duration', type: 'text', required: true },
  { name: 'price', label: 'Price', type: 'number', required: true },
  { name: 'maxCapacity', label: 'Max Capacity', type: 'number', required: true },
  { name: 'imageUrl', label: 'Image URL', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' }
]

export default function AdminTreksPage() {
  const [rows, setRows] = useState<AdminTrek[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await adminApi.treks.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load treks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <CrudPage
      title="Treks Management"
      fields={fields}
      rows={rows}
      loading={loading}
      error={error}
      onCreate={async (payload) => {
        await adminApi.treks.create({
          title: String(payload.title || ''),
          difficultyLevel: (payload.difficultyLevel as 'easy' | 'moderate' | 'hard' | 'extreme') || 'easy',
          location: String(payload.location || ''),
          duration: String(payload.duration || ''),
          price: Number(payload.price || 0),
          maxCapacity: Number(payload.maxCapacity || 50),
          imageUrl: String(payload.imageUrl || ''),
          description: String(payload.description || '')
        })
        await load()
      }}
      onUpdate={async (id, payload) => {
        await adminApi.treks.update(id, {
          title: String(payload.title || ''),
          difficultyLevel: (payload.difficultyLevel as 'easy' | 'moderate' | 'hard' | 'extreme') || 'easy',
          location: String(payload.location || ''),
          duration: String(payload.duration || ''),
          price: Number(payload.price || 0),
          maxCapacity: Number(payload.maxCapacity || 50),
          imageUrl: String(payload.imageUrl || ''),
          description: String(payload.description || '')
        })
        await load()
      }}
      onDelete={async (id) => {
        await adminApi.treks.delete(id)
        await load()
      }}
    />
  )
}
